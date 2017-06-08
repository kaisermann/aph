const protoCache = { Array: Array.prototype }
const arrayProto = protoCache.Array
let apheleiaProto

function slice (what, from) {
  return arrayProto.slice.call(what, from || 0)
}

// Check if what's passed is a string
function isStr (maybeStr) {
  return '' + maybeStr === maybeStr
}

// Check if what's passed is to be considered a colletion
function isValidCollection (maybeCollection) {
  return (
    maybeCollection && !isStr(maybeCollection) && maybeCollection.length != null
  )
}

// Parses the passed context
function aphParseContext (elemOrAphOrStr) {
  return elemOrAphOrStr instanceof Node
    ? elemOrAphOrStr // If already a html element
    : isStr(elemOrAphOrStr)
        ? Apheleia.querySelector(elemOrAphOrStr, document)[0] // If string passed let's search for the element on the DOM
        : isValidCollection(elemOrAphOrStr)
            ? elemOrAphOrStr[0] // If already an collection
            : document // Return the document.
}

// Parses the elements passed to aph()
function aphParseElements (strOrCollectionOrElem, ctx) {
  // If string passed
  if (isStr(strOrCollectionOrElem)) {
    const isCreationStr = /<(\w*)\/?>/.exec(strOrCollectionOrElem)
    // If creation string, create the element
    if (isCreationStr) {
      return [document.createElement(isCreationStr[1])]
    }
    // If not a creation string, let's search for the elements
    return Apheleia.querySelector(strOrCollectionOrElem, ctx)
  }

  // If html element / window / document passed
  if (
    strOrCollectionOrElem instanceof Node ||
    strOrCollectionOrElem === window
  ) {
    return [strOrCollectionOrElem]
  }

  // If collection passed and
  // is not a string (first if, up there)
  if (isValidCollection(strOrCollectionOrElem)) {
    return strOrCollectionOrElem
  }

  if (strOrCollectionOrElem != null) {
    throw Error('aph: Invalid first parameter')
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

  // Wrapper for Node methods
  call (fnName) {
    const sum = []
    const args = slice(arguments, 1)

    this.forEach((item, result) => {
      if ((result = item[fnName].apply(item, args)) != null) {
        sum.push(result)
      }
    })
    return 0 in sum ? sum : this
  }

  // Iterates through the elements with a 'callback(element, index)''
  forEach (cb) {
    // Iterates through the Apheleia object.
    // If the callback returns false, the iteration stops.
    for (
      let i = 0, len = this.length;
      i < len && cb.call(this, this[i], i++) !== false;

    );
    return this
  }

  map () {
    return Apheleia.flatWrap(arrayProto.map.apply(this, arguments), this)
  }

  filter () {
    return new Apheleia(
      arrayProto.filter.apply(this, arguments),
      this.meta.context,
      { owner: this }
    )
  }

  slice () {
    return new Apheleia(
      arrayProto.slice.apply(this, arguments),
      this.meta.context,
      { owner: this }
    )
  }

  // Creates a new Apheleia instance with the elements found.
  find (selector) {
    return new Apheleia(selector, this[0], { owner: this })
  }

  // Gets the specified element or the whole array if no index was defined
  get (index) {
    return +index === index ? this[index] : Apheleia.flatWrap(this)
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
    children = children.reduce((acc, item) => {
      if (isValidCollection(item)) {
        return acc.concat(slice(item))
      }
      acc.push(item)
      return acc
    }, [])

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

  static querySelector (selector, ctx) {
    ctx = aphParseContext(ctx)
    return /^#[\w-]*$/.test(selector) // if #id
      ? [window[selector.slice(1)]]
      : slice(
          /^\.[\w-]*$/.test(selector) // if .class
            ? ctx.getElementsByClassName(selector.slice(1))
            : /^\w+$/.test(selector) // if tag (a, span, div, ...)
                ? ctx.getElementsByTagName(selector)
                : ctx.querySelectorAll(selector) // anything else
        )
  }

  static flatWrap (what, owner) {
    let acc = []
    for (let i = 0, item; i < what.length; i++) {
      item = what[i]
      if (item instanceof Node || item == null) {
        // If we received a single node
        if (!~acc.indexOf(item)) {
          acc.push(item)
        }
      } else if (
        item instanceof NodeList ||
        item instanceof HTMLCollection ||
        item instanceof Apheleia ||
        item instanceof Array
      ) {
        // If we received a node list/collection
        for (let j = 0, len2 = item.length; j < len2; j++) {
          if (!~acc.indexOf(item[j])) {
            acc.push(item[j])
          }
        }
      } else {
        const constructorName = what[0].constructor.name

        what.prop = apheleiaProto.prop
        what.call = apheleiaProto.call
        what.owner = owner

        if (!protoCache[constructorName]) {
          protoCache[constructorName] = Object.getPrototypeOf(what[0])
        }

        // Let's get all methods of this constructor
        Object.getOwnPropertyNames(protoCache[constructorName]).forEach(key => {
          console.log(key)
          if (what[key] === undefined) {
            what[key] = function () {
              const result = this.map(i =>
                protoCache[constructorName][key].apply(i, arguments)
              )
              // Return the Apheleia Owner
              // if the result is a list of undefined
              return result[0] == null && result[result.length - 1] == null
                ? owner
                : result
            }
          }
        })

        if (what.length != null) {
          what.map = apheleiaProto.map
          what.forEach = what.forEach || apheleiaProto.forEach
        }

        return what
      }
    }
    return new Apheleia(acc, document, { owner: owner })
  }
}

apheleiaProto = Apheleia.prototype

// Extending the Array Prototype
const ignoreMethods = [
  'concat',
  'join',
  'copyWithin',
  'fill',
  'reduce',
  'reduceRight',
]

Object.getOwnPropertyNames(arrayProto).forEach(key => {
  if (!~ignoreMethods.indexOf(key) && apheleiaProto[key] === undefined) {
    apheleiaProto[key] = arrayProto[key]
  }
})

// Extending default HTMLElement methods and properties
let baseElement = document.createElement('div')
for (const prop in baseElement) {
  if (!apheleiaProto[prop]) {
    if (baseElement[prop] instanceof Function) {
      apheleiaProto[prop] = function () {
        return this.call.apply(this, [prop].concat(slice(arguments)))
      }
    } else {
      Object.defineProperty(apheleiaProto, prop, {
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
baseElement = null

export default Apheleia
