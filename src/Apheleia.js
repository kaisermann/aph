class Apheleia {
  constructor (elems, contextOrAttr, nothingOrAttrVal) {
    // Second parameter is used as context when a HTML Element is passed
    // Second/Third parameter are used as attribute object/list/pair when creating elements

    this.elements = aphParseElements(elems,
      this.context = aphParseContext(contextOrAttr)
    )

    // If second parameter is not an html element and not undefined, we assume it's an attribute obj
    if (!(contextOrAttr instanceof Element) && contextOrAttr) {
      this.attr(contextOrAttr, nothingOrAttrVal)
    }
  }

  filter (cb) {
    return new Apheleia(this.elements.filter(cb))
  }

  get (index) {
    // Type coercion uses less bytes than "index !== undefined"
    return +index === index ? this.elements[index] : this.elements
  }

  // Iterates through the elements with a 'callback(element, index)''
  // The this is attached to the element itself
  each (cb) {
    this.elements.forEach(cb)
    return this
  }

  // Node Data manipulation Methods
  attr (objOrKey, nothingOrValue, prepend) {
    // If prepend is falsy, it would be an empty string anyway
    prepend = prepend || ''

    let tmpObj = objOrKey
    // Is the first parameter a key string?
    // Type coercion uses less bytes than "typeof objOrKey ==='string'"
    if ('' + objOrKey === objOrKey) {
      // If passed only a key, let's return the attribute
      if (nothingOrValue === undefined) {
        return this.elements[0].getAttribute(prepend + objOrKey)
      }
      // If not, let's objectify the key/value pair
      tmpObj = {
        [objOrKey]: nothingOrValue,
      }
    }

    // Finally, let's set the attributes
    return this.each(elem =>
      Object.keys(tmpObj).forEach(key =>
        elem.setAttribute(prepend + key, tmpObj[key])
      )
    )
  }

  prop (objOrKey, nothingOrValue) {
    let tmpObj = objOrKey
    // Is the first parameter a key string?
    // Type coercion uses less bytes than "typeof objOrKey ==='string'"
    if ('' + objOrKey === objOrKey) {
      // If passed only a key, let's return the property
      if (nothingOrValue === undefined) {
        return this.elements[0][objOrKey]
      }
      // If not, let's objectify the key/value pair
      tmpObj = {
        [objOrKey]: nothingOrValue,
      }
    }

    // Finally, let's set the properties
    return this.each(elem =>
      Object.keys(tmpObj).forEach(key => {
        elem[key] = tmpObj[key]
      })
    )
  }

  data (objOrKey, nothingOrValue) {
    return this.attr(objOrKey, nothingOrValue, 'data-')
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
    return this.elements[every ? 'every' : 'some'](elem =>
      elem.classList.contains(className)
    )
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
      ? contextOrAttr.get(0) // If already apheleia object
      : document // Probably an attribute was passed. Return the document.
}

const aphParseElements = (stringOrListOrNode, ctx) => {
  // If single string
  // Type coercion uses less bytes than "typeof stringOrListOrNode ==='string'"
  if ('' + stringOrListOrNode === stringOrListOrNode) {
    const isCreationStr = /<(\w*)\/?>/.exec(stringOrListOrNode)
    // If creation string
    if (isCreationStr) {
      return [document.createElement(isCreationStr[1])]
    }
    // If not a creation string, let's search for the elements
    return Array.prototype.slice.call(ctx.querySelectorAll(stringOrListOrNode))
  }
  // If single node
  if (stringOrListOrNode instanceof Element) {
    return [stringOrListOrNode]
  }
  // If node list
  if (NodeList.prototype.isPrototypeOf(stringOrListOrNode)) {
    return Array.prototype.slice.call(stringOrListOrNode)
  }
  // If array, we're done
  if (Array.isArray(stringOrListOrNode)) {
    return stringOrListOrNode
  }
  // If another apheleia object is passed, get all elements from it
  if (Apheleia.prototype.isPrototypeOf(stringOrListOrNode)) {
    return stringOrListOrNode.get()
  }
  return []
}

export default Apheleia
