class Apheleia {
  constructor (elems, context) {
    this.elements = aphParseElements(elems,
      this.context = aphParseContext(context)
    )
  }

  // Returns a new Apheleia instance with the filtered elements
  filter (cb) {
    return new Apheleia(this.elements.filter(cb), this.context)
  }

  // Creates a new Apheleia instance with the elements found.
  find (selector) {
    return new Apheleia(selector, this.elements[0])
  }

  // Gets the specified element or the whole array if no index was defined
  get (index) {
    // Type coercion uses less bytes than "index !== undefined"
    return +index === index ? this.elements[index] : this.elements
  }

  // Iterates through the elements with a 'callback(element, index)''
  each (cb) {
    this.elements.forEach(cb.bind(this))
    return this
  }

  // Node Data manipulation Methods
  attr (objOrKey, nothingOrValue, prepend) {
    // If prepend is falsy, it would be an empty string anyway
    prepend = prepend || ''

    if ('' + objOrKey === objOrKey) {
      return (
        nothingOrValue === undefined
          ? this.elements[0].getAttribute(prepend + objOrKey)
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

  // Node propertiy manipulation method
  prop (objOrKey, nothingOrValue) {
    if ('' + objOrKey === objOrKey) {
      return (
        nothingOrValue === undefined
          ? this.elements[0][objOrKey]
          : this.each(elem => { elem[objOrKey] = nothingOrValue })
      )
    }

    return this.each(elem => {
      for (const key in objOrKey) {
        elem[key] = objOrKey[key]
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

  addClass (/* any number of arguments */) {
    return this.each(elem =>
      elem.classList.add(Array.prototype.slice.call(arguments))
    )
  }

  removeClass (/* any number of arguments */) {
    return this.each(elem =>
      elem.classList.remove(Array.prototype.slice.call(arguments))
    )
  }

  hasClass (className, every) {
    return this.elements[every ? 'every' : 'some'](elem => {
      return elem.classList.contains(className)
    })
  }

  // Wrapper for Node methods
  exec (fnName/*, any number of arguments */) {
    return this.each(elem =>
      elem[fnName].apply(elem, Array.prototype.slice.call(arguments, 1))
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
    const onceFn = e => (cb(e) || this.off(e.type, onceFn))
    return this.on(events, onceFn)
  }
}

// "Private" Helpers. No need to keep this in the prototype.
const aphParseContext = (contextOrAttr) => {
  return contextOrAttr instanceof Element
    ? contextOrAttr // If already a html element
    : Apheleia.prototype.isPrototypeOf(contextOrAttr)
      ? contextOrAttr.elements[0] // If already apheleia object
      : document // Probably an attribute was passed. Return the document.
}

const aphParseElements = (stringOrListOrNode, ctx) => {
  // If string passed
  // Type coercion uses less bytes than "typeof stringOrListOrNode ==='string'"
  if ('' + stringOrListOrNode === stringOrListOrNode) {
    const isCreationStr = /<(\w*)\/?>/.exec(stringOrListOrNode)
    // If creation string, create the element
    if (isCreationStr) {
      return [document.createElement(isCreationStr[1])]
    }
    // If not a creation string, let's search for the elements
    return /^#[\w-]*$/.test(stringOrListOrNode) // if #id
        ? [window[stringOrListOrNode.slice(1)]]
        : Array.prototype.slice.call(
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
  if (NodeList.prototype.isPrototypeOf(stringOrListOrNode)) {
    return Array.prototype.slice.call(stringOrListOrNode)
  }

  // If array passed, just return
  if (Array.isArray(stringOrListOrNode)) {
    return stringOrListOrNode
  }

  // If another apheleia object is passed, get its elements
  if (Apheleia.prototype.isPrototypeOf(stringOrListOrNode)) {
    return stringOrListOrNode.elements
  }

  return []
}

export default Apheleia
