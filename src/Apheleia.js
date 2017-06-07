const arrProto = Array.prototype
let baseElement = document.createElement('div')

function slice (what, from) {
  return arrProto.slice.call(what, from || 0)
}

// Check if what's passed is a string
function isStr (maybeStr) {
  return '' + maybeStr === maybeStr
}

function isValidCollection (maybeCollection) {
  return maybeCollection && !isStr(maybeCollection) && maybeCollection.length
}

function flatten (what, recursive) {
  let acc = []
  for (let i = 0, item; i < what.length; i++) {
    item = what[i]
    if (isValidCollection(item)) {
      acc = acc.concat(recursive ? flatten(item, true) : slice(item))
    } else {
      acc.push(item)
    }
  }
  return acc
}

// Queries a selector (smartly)
function aphQuerySelector (selector, context) {
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
  return elemOrAphOrStr instanceof Node
    ? elemOrAphOrStr // If already a html element
    : isStr(elemOrAphOrStr)
        ? aphQuerySelector(elemOrAphOrStr, document)[0] // If string passed let's search for the element on the DOM
        : isValidCollection(elemOrAphOrStr)
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
    return aphQuerySelector(strOrArrayOrAphOrElem, ctx)
  }

  // If html element / window / document passed
  if (
    strOrArrayOrAphOrElem instanceof Node ||
    strOrArrayOrAphOrElem === window
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
  if (isValidCollection(strOrArrayOrAphOrElem)) {
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
  html (children, cb) {
    // If there're no arguments
    // Let's return the html of the first element
    if (children === undefined) {
      return this.map(elem => elem.innerHTML)
    }

    // Manipulating arrays is easier
    if (!Array.isArray(children)) {
      children = [children]
    }

    // If we receive any collections (arrays, lists, aph),
    // we must get its elements
    children = flatten(children)
    console.log(children)

    // If a callback is received as the second argument
    // let's pass the parent and child nodes
    // and let the callback do all the work
    if (typeof cb === 'function') {
      return this.forEach(parent =>
        children.forEach(child => cb(parent, child))
      )
    }

    // If the second argument is not a valid callback,
    // we will rewrite all parents HTML
    return this.forEach(parent => {
      parent.innerHTML = ''
      children.forEach(child => {
        parent.innerHTML += isStr(child) ? child : child.outerHTML
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
    return this.forEach(function (elem) {
      elem.parentNode.removeChild(elem)
    })
  }

  // Class methods
  toggleClass (className) {
    return this.forEach(function (elem) {
      elem.classList.toggle(className)
    })
  }

  addClass () {
    const args = slice(arguments)
    return this.forEach(function (elem) {
      elem.classList.add.apply(elem.classList, args)
    })
  }

  removeClass () {
    const args = slice(arguments)
    return this.forEach(function (elem) {
      elem.classList.remove.apply(elem.classList, args)
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

    this.forEach((elem, result) => {
      if ((result = elem[fnName].apply(elem, args))) {
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
const AphProto = Apheleia.prototype
if (window.Symbol && Symbol.iterator) {
  AphProto[Symbol.iterator] = AphProto.values = arrProto[Symbol.iterator]
}

// Extending
const newCollectionMethods = ['filter', 'slice']
const ignoreMethods = [
  'concat',
  'join',
  'copyWithin',
  'fill',
  'reduce',
  'reduceRight',
].concat(newCollectionMethods)

// Extending array prototype (methods that do not return a new collection)
Object.getOwnPropertyNames(arrProto).forEach(key => {
  if (ignoreMethods.indexOf(key) === -1 && AphProto[key] === undefined) {
    AphProto[key] = arrProto[key]
  }
})

// Extending array prototype (methods that return new colletions)
newCollectionMethods.forEach(method => {
  AphProto[method] = function () {
    return new Apheleia(
      arrProto[method].apply(this, arguments),
      this.meta.context,
      { parent: this }
    )
  }
})

// Extending default HTMLElement methods and properties
function extendElementProperty (prop) {
  if (baseElement[prop] instanceof Function) {
    AphProto[prop] = function () {
      return this.call.apply(this, [prop].concat(slice(arguments)))
    }
  } else {
    Object.defineProperty(AphProto, prop, {
      get () {
        return this.prop(prop)
      },
      set (value) {
        this.prop(prop, value)
      },
    })
  }
}

for (const prop in baseElement) {
  if (!AphProto[prop]) {
    extendElementProperty(prop)
  }
}
baseElement = null

export default Apheleia
