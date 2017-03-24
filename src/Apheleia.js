// Type coercion uses less bytes than "typeof str ==='string'"
const arrProto = Array.prototype

class Apheleia {
  constructor (elems, context, prevInstance) {
    this.prev = prevInstance
    for (
      let list = aphParseElements(
        elems,
        this.context = aphParseContext(context) // Sets current context
      ), len = this.length = list.length; // Sets current length
      len--; // Ends loop when reaches 0
      this[len] = list[len] // Builds the array-like structure
    );
  }

  // Returns a new Apheleia instance with the filtered elements
  filter (cb) {
    return new Apheleia(arrProto.filter.call(this, cb), this.context, this)
  }

  // Creates a new Apheleia instance with the elements found.
  find (selector) {
    return new Apheleia(selector, this[0], this)
  }

  // Gets the specified element or the whole array if no index was defined
  get (index) {
    return +index === index
      ? this[index]
      : arrProto.slice.call(this)
  }

  // Iterates through the elements with a 'callback(element, index)''
  each (cb) {
    // Iterates through the Apheleia object.
    // If the callback returns false, the iteration stops.
    for (let i = 0; i < this.length && cb.call(this, this[i], i++) !== false;);
    return this
  }

  // Node Data manipulation Methods
  attr (objOrKey, nothingOrValue, prepend) {
    // If prepend is falsy, it would be an empty string anyway
    prepend = prepend || ''

    if ('' + objOrKey === objOrKey) {
      return (
        nothingOrValue === undefined
          ? this[0].getAttribute(prepend + objOrKey)
          : this.each(elem => elem.setAttribute(prepend + objOrKey, nothingOrValue))
      )
    }

    return this.each(elem => {
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
    if ('' + objOrKey === objOrKey) {
      return (
        nothingOrValue === undefined
          ? this[0][objOrKey]
          : this.each(elem => { elem[objOrKey] = nothingOrValue })
      )
    }

    return this.each(elem => {
      for (const key in objOrKey) {
        elem[key] = objOrKey[key]
      }
    })
  }

  // CSS
  css (objOrKey, nothingOrValue) {
    if ('' + objOrKey === objOrKey) {
      return (
        nothingOrValue === undefined
          ? window.getComputedStyle(this[0])[objOrKey]
          : this.each(elem => { elem.style[objOrKey] = nothingOrValue })
      )
    }

    return this.each(elem => {
      for (const key in objOrKey) {
        elem.style[key] = objOrKey[key]
      }
    })
  }

  appendTo (newParent) {
    return this.each(elem => newParent.appendChild(elem))
  }

  prependTo (newParent) {
    return this.each(elem => newParent.insertBefore(elem, newParent.firstChild))
  }

  delete () {
    return this.each(elem => elem.parentNode.removeChild(elem))
  }

  // Class methods
  toggleClass (className) {
    return this.each(elem => elem.classList.toggle(className))
  }

  addClass (stringOrArray) {
    return this.each(elem =>
      '' + stringOrArray === stringOrArray
        ? elem.classList.add(stringOrArray)
        : elem.classList.add.apply(elem.classList, stringOrArray)
    )
  }

  removeClass (stringOrArray) {
    return this.each(elem =>
      '' + stringOrArray === stringOrArray
        ? elem.classList.remove(stringOrArray)
        : elem.classList.remove.apply(elem.classList, stringOrArray)
    )
  }

  hasClass (className, every) {
    return arrProto[every ? 'every' : 'some'].call(this, elem =>
      elem.classList.contains(className)
    )
  }

  // Wrapper for Node methods
  exec (fnName, args) {
    return this.each(elem =>
      elem[fnName].apply(elem, args)
    )
  }

  on (events, cb) {
    return this.each(elem =>
      events.split(' ').forEach(eventName =>
        elem.addEventListener(eventName, cb)
      )
    )
  }

  off (events, cb) {
    return this.each(elem =>
      events.split(' ').forEach(eventName =>
        elem.removeEventListener(eventName, cb)
      )
    )
  }

  once (events, cb) {
    const self = this
    return self.on(events, function onceFn (e) {
      cb.call(this, e)
      self.off(e.type, onceFn)
    })
  }
}

// Parses the passed context
const aphParseContext = (contextOrAttr) => {
  return contextOrAttr instanceof Element
    ? contextOrAttr // If already a html element
    : Apheleia.prototype.isPrototypeOf(contextOrAttr)
      ? contextOrAttr[0] // If already apheleia object
      : document // Probably an attribute was passed. Return the document.
}

// Parses the elements passed to aph()
const aphParseElements = (stringOrListOrNode, ctx) => {
  // If string passed
  if ('' + stringOrListOrNode === stringOrListOrNode) {
    const isCreationStr = /<(\w*)\/?>/.exec(stringOrListOrNode)
    // If creation string, create the element
    if (isCreationStr) {
      return [document.createElement(isCreationStr[1])]
    }
    // If not a creation string, let's search for the elements
    return /^#[\w-]*$/.test(stringOrListOrNode) // if #id
        ? [window[stringOrListOrNode.slice(1)]]
        : arrProto.slice.call(
            /^\.[\w-]*$/.test(stringOrListOrNode) // if .class
              ? ctx.getElementsByClassName(stringOrListOrNode.slice(1))
              : /^\w+$/.test(stringOrListOrNode) // if singlet (a, span, div, ...)
                ? ctx.getElementsByTagName(stringOrListOrNode)
                : ctx.querySelectorAll(stringOrListOrNode) // anything else
          )
  }
  // If html element passed
  if (stringOrListOrNode instanceof Element) {
    return [stringOrListOrNode]
  }

  // If node list passed
  // If another apheleia object is passed, get its elements
  if (
    NodeList.prototype.isPrototypeOf(stringOrListOrNode) ||
    Apheleia.prototype.isPrototypeOf(stringOrListOrNode)) {
    return arrProto.slice.call(stringOrListOrNode)
  }

  // If array passed, just return
  if (Array.isArray(stringOrListOrNode)) {
    return stringOrListOrNode
  }

  return []
}

export default Apheleia
