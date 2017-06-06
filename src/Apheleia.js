const arrProto = Array.prototype
let baseElement = document.createElement('div')

function slice (what, from) {
  return arrProto.slice.call(what, from || 0)
}

// Check if what's passed is a string
function isStr (maybeStr) {
  return '' + maybeStr === maybeStr
}

// Queries a selector (smartly)
function smartQuerySelectorAll (selector, context) {
  return /^#[\w-]*$/.test(selector) // if #id
    ? [window[selector.slice(1)]]
    : slice(
        /^\.[\w-]*$/.test(selector) // if .class
          ? context.getElementsByClassName(selector.slice(1))
          : /^\w+$/.test(selector) // if tag (a, span, div, ...)
              ? context.getElementsByTagName(selector)
              : context.querySelectorAll(selector) // anything else
      )
}

// Parses the passed context
function aphParseContext (elemOrAphOrStr) {
  return elemOrAphOrStr instanceof Element
    ? elemOrAphOrStr // If already a html element
    : isStr(elemOrAphOrStr)
        ? smartQuerySelectorAll(elemOrAphOrStr, document)[0] // If string passed let's search for the element on the DOM
        : elemOrAphOrStr && elemOrAphOrStr.length
            ? elemOrAphOrStr[0] // If already an collection
            : document // Return the document.
}

// Parses the elements passed to aph()
function aphParseElements (strOrArrayOrAphOrElem, ctx) {
  // If string passed
  if (isStr(strOrArrayOrAphOrElem)) {
    const isCreationStr = /<(\w*)\/?>/.exec(strOrArrayOrAphOrElem)
    // If creation string, create the element
    if (isCreationStr) {
      return [document.createElement(isCreationStr[1])]
    }
    // If not a creation string, let's search for the elements
    return smartQuerySelectorAll(strOrArrayOrAphOrElem, ctx)
  }

  // If html element / window / document passed
  if (
    strOrArrayOrAphOrElem instanceof Element ||
    strOrArrayOrAphOrElem === window ||
    strOrArrayOrAphOrElem === document
  ) {
    return [strOrArrayOrAphOrElem]
  }

  // If array passed, just return
  if (Array.isArray(strOrArrayOrAphOrElem)) {
    return strOrArrayOrAphOrElem
  }

  // If collection passed and
  // is not a string (first if, up there) and
  // is not an array
  if (strOrArrayOrAphOrElem && strOrArrayOrAphOrElem.length) {
    return slice(strOrArrayOrAphOrElem)
  }

  return []
}

class Apheleia {
  constructor (elems, context, metaObj) {
    this.meta = metaObj || {}
    for (
      let list = aphParseElements(
        elems,
        (this.meta.context = aphParseContext(context)) // Sets current context
      ),
        len = (this.length = list.length); // Sets current length
      len--; // Ends loop when reaches 0
      this[len] = list[len] // Builds the array-like structure
    );
  }

  // Iterates through the elements with a 'callback(element, index)''
  forEach (cb) {
    // Iterates through the Apheleia object.
    // If the callback returns false, the iteration stops.
    for (let i = 0; i < this.length && cb.call(this, this[i], i++) !== false;);
    return this
  }

  concat () {
    let sum = this.get()
    for (let i = 0, l = arguments.length; i < l; i++) {
      const arg = arguments[i]
      if (arg instanceof Node) sum.push(arg)
      else if (arg && !isStr(arg) && arg.length) {
        for (let j = 0, k = arg.length; j < k; j++) {
          if (sum.indexOf(arg[j]) < 0) {
            sum.push(arg[j])
          }
        }
      }
    }

    return new Apheleia(sum, this.meta.context, { parent: this })
  }

  // Creates a new Apheleia instance with the elements found.
  find (selector) {
    return new Apheleia(selector, this[0], { parent: this })
  }

  // Gets the specified element or the whole array if no index was defined
  get (index) {
    return +index === index ? this[index] : slice(this)
  }

  // Appends the passed html/aph
  append (futureContent) {
    return this.html(futureContent, function (parent, child) {
      parent.appendChild(child)
    })
  }

  appendTo (newParent) {
    new Apheleia(newParent).append(this)
    return this
  }

  // Prepends the passed html/aph
  prepend (futureContent) {
    return this.html(futureContent, function (parent, child) {
      parent.insertBefore(child, parent.firstChild)
    })
  }

  prependTo (newParent) {
    new Apheleia(newParent).prepend(this)
    return this
  }

  // Sets or gets the html
  html (futureChildren, cb) {
    // If there're no arguments
    // Let's return the html of the first element
    if (futureChildren === undefined) {
      return this[0].innerHTML
    }

    // Manipulating arrays is easier
    if (!Array.isArray(futureChildren)) {
      futureChildren = [futureChildren]
    }

    // If we receive any collections (arrays, lists, aph),
    // we must get its elements
    futureChildren = futureChildren.reduce((acc, item) => {
      // If a .length is found and it's not a string,
      // we assume it's a standard indexed collection
      if (!isStr(item) && item.length) {
        return acc.concat(slice(item))
      }
      acc.push(item)
      return acc
    }, [])

    // If a callback is received as the second argument
    // let's pass the parent and child nodes
    // and let the callback do all the work
    if (typeof cb === 'function') {
      return this.forEach(futureParent =>
        futureChildren.forEach(futureChild => cb(futureParent, futureChild))
      )
    }

    // If the second argument is not a valid callback,
    // we will rewrite all parents HTML
    return this.forEach(futureParent => {
      futureParent.innerHTML = ''
      futureChildren.forEach(futureChild => {
        futureParent.innerHTML += isStr(futureChild)
          ? futureChild
          : futureChild.outerHTML
      })
    })
  }

  // Node Data manipulation Methods
  attr (objOrKey, nothingOrValue, prepend) {
    // If prepend is falsy, it would be an empty string anyway
    prepend = prepend || ''

    if (isStr(objOrKey)) {
      return nothingOrValue === undefined
        ? this.map(elem => elem.getAttribute(prepend + objOrKey))
        : this.forEach(function (elem) {
          elem.setAttribute(prepend + objOrKey, nothingOrValue)
        })
    }

    return this.forEach(function (elem) {
      for (const key in objOrKey) {
        elem.setAttribute(prepend + key, objOrKey[key])
      }
    })
  }

  data (objOrKey, nothingOrValue) {
    return this.attr(objOrKey, nothingOrValue, 'data-')
  }

  // Node property manipulation method
  prop (objOrKey, nothingOrValue) {
    if (isStr(objOrKey)) {
      return nothingOrValue === undefined
        ? this.map(elem => elem[objOrKey])
        : this.forEach(function (elem) {
          elem[objOrKey] = nothingOrValue
        })
    }

    return this.forEach(function (elem) {
      for (const key in objOrKey) {
        elem[key] = objOrKey[key]
      }
    })
  }

  // CSS
  css (objOrKey, nothingOrValue) {
    if (isStr(objOrKey)) {
      return nothingOrValue === undefined
        ? this.map(elem => window.getComputedStyle(elem)[objOrKey])
        : this.forEach(function (elem) {
          elem.style[objOrKey] = nothingOrValue
        })
    }

    return this.forEach(function (elem) {
      for (const key in objOrKey) {
        elem.style[key] = objOrKey[key]
      }
    })
  }

  remove () {
    return this.forEach(elem => elem.parentNode.removeChild(elem))
  }

  // Class methods
  toggleClass (className) {
    return this.forEach(elem => elem.classList.toggle(className))
  }

  addClass (stringOrArray) {
    return this.forEach(function (elem) {
      isStr(stringOrArray)
        ? elem.classList.add(stringOrArray)
        : elem.classList.add.apply(elem.classList, stringOrArray)
    })
  }

  removeClass (stringOrArray) {
    return this.forEach(function (elem) {
      isStr(stringOrArray)
        ? elem.classList.remove(stringOrArray)
        : elem.classList.remove.apply(elem.classList, stringOrArray)
    })
  }

  hasClass (className, every) {
    return this[every ? 'every' : 'some'](elem =>
      elem.classList.contains(className)
    )
  }

  // Wrapper for Node methods
  call (fnName) {
    const sum = []
    const args = slice(arguments, 1)

    this.forEach(elem => {
      const result = elem[fnName].apply(elem, args)
      if (result !== undefined) {
        sum.push(result)
      }
    })
    return sum.length ? sum : this
  }

  on (events, cb) {
    events.split(' ').forEach(eventName => this.addEventListener(eventName, cb))
    return this
  }

  off (events, cb) {
    events
      .split(' ')
      .forEach(eventName => this.removeEventListener(eventName, cb))
    return this
  }

  once (events, cb) {
    const self = this
    return self.on(events, function onceFn (e) {
      cb.call(this, e)
      self.off(e.type, onceFn)
    })
  }
}

const newCollectionMethods = ['filter', 'slice']
const ignoreMethods = [
  'join',
  'copyWithin',
  'fill',
  'reduce',
  'reduceRight',
].concat(newCollectionMethods)

// Extending array prototype (methods that do not return a new collection)
Object.getOwnPropertyNames(arrProto).forEach(key => {
  if (
    ignoreMethods.indexOf(key) === -1 &&
    Apheleia.prototype[key] === undefined
  ) {
    Apheleia.prototype[key] = arrProto[key]
  }
})

// Extending array prototype (methods that return new colletions)
newCollectionMethods.forEach(method => {
  Apheleia.prototype[method] = function () {
    return new Apheleia(
      arrProto[method].apply(this, arguments),
      this.meta.context,
      {
        parent: this,
      }
    )
  }
})

function buildSettersAndGetters (prop) {
  if (!Apheleia.prototype[prop]) {
    if (baseElement[prop] instanceof Function) {
      Apheleia.prototype[prop] = function () {
        return this.call.apply(this, [prop].concat(slice(arguments)))
      }
    } else {
      Object.defineProperty(Apheleia.prototype, prop, {
        get () {
          return this.prop(prop)
        },
        set (value) {
          this.prop(prop, value)
        },
      })
    }
  }
}

for (const prop in baseElement) {
  buildSettersAndGetters(prop)
}
baseElement = null

export default Apheleia
