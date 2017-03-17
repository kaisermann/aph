const slice = Array.prototype.slice

class Apheleia {
  constructor (elems, contextOrAttr, nothingOrAttrVal) {
    // Second parameter is used as context when a HTML Element is passed
    // Second/Third parameter are used as attribute object/list/pair when creating nodes
    this.context = contextOrAttr instanceof Element ? contextOrAttr : document
    this.elements = this.parseArgs(elems)
    this.length = this.elements.length

    // If second parameter is not an html element and not undefined, we assume it's an attribute obj
    if (!(contextOrAttr instanceof Element) && contextOrAttr) {
      this.attr(contextOrAttr, nothingOrAttrVal)
    }
  }
  parseArgs (stringOrListOrNode) {
    // If single string
    if (typeof stringOrListOrNode === 'string') {
      const isCreationStr = /<(\w*)\/?>/.exec(stringOrListOrNode)
      // If creation string
      if (isCreationStr) return [document.createElement(isCreationStr[1])]
      // If not a creation string, let's search for the elements
      return slice.call(this.context.querySelectorAll(stringOrListOrNode))
    }
    // If single node
    if (stringOrListOrNode instanceof Element) {
      return [stringOrListOrNode]
    }
    // If node list
    if (NodeList.prototype.isPrototypeOf(stringOrListOrNode)) {
      return slice.call(stringOrListOrNode)
    }
    // If array, we're done
    if (Array.isArray(stringOrListOrNode)) {
      return stringOrListOrNode
    }
    return []
  }
  get (index) {
    return index !== undefined ? this.elements[index] : this.elements
  }
  // Iterates through the elements with a 'callback(element, index)''
  // The this is attached to the element itself
  each (cb) {
    return this.elements.forEach((elem, index) => cb.call(elem, elem, index))
  }
  // Node Data manipulation Methods
  attr (objOrKey, nothingOrValue, prepend) {
    prepend = prepend || ''
    // If passed only a key, let's return the attribute
    if (typeof objOrKey === 'string' && nothingOrValue === undefined) {
      return this.elements[0].getAttribute(prepend + objOrKey)
    }
    // If not, let's see what was passed
    objOrKey = objectifyTuple(objOrKey, nothingOrValue)

    // Finally, let's set the attributes
    Object.keys(objOrKey).forEach(key =>
      this.elements.forEach(elem =>
        elem.setAttribute(prepend + key, objOrKey[key])
      )
    )
    return this
  }
  data (objOrKey, nothingOrValue) {
    return this.attr(objOrKey, nothingOrValue, 'data-')
  }
  prop (objOrKey, nothingOrValue) {
    // If passed only a key, let's return the property
    if (typeof objOrKey === 'string' && nothingOrValue === undefined) {
      return this.elements[0][objOrKey]
    }

    objOrKey = objectifyTuple(objOrKey, nothingOrValue)

    Object.keys(objOrKey).forEach(key =>
      this.elements.forEach(elem =>
        (elem[key] = objOrKey[key])
      )
    )
    return this
  }
  filter (cb) {
    return new Apheleia(this.elements.filter(elem => cb(elem)))
  }

  hasClass (className, every) {
    return this.elements[every ? 'every' : 'some'](elem => elem.classList.contains(className))
  }
}

// Wrapper for main chainable methods.
const collectionChain = {
  // DOM Manipulation Methods
  appendTo (node, newParent) {
    newParent.appendChild(node)
  },
  prependTo (node, newParent) {
    newParent.insertBefore(node, newParent.firstChild)
  },
  delete (node) {
    node.parentNode.removeChild(node)
  },
  // Class methods
  toggleClass (node, className) {
    node.classList.toggle(className)
  },
  addClass (node) {
    node.classList.add(slice.call(arguments, 1))
  },
  removeClass (node) {
    node.classList.remove(slice.call(arguments, 1))
  },
  // Wrapper for Node methods
  exec (node, fnName) {
    node[fnName].apply(node, slice.call(arguments, 2))
  },
  on (node, events, cb) {
    events.split(' ').forEach(eventName => node.addEventListener(eventName, cb))
  },
  off (node, events, cb) {
    events.split(' ').forEach(eventName => node.removeEventListener(eventName, cb))
  },
  once (node, events, cb) {
    const onceFn = e => (cb(e) || this.off(e.type, onceFn))
    this.on(events, onceFn)
  },
}

// Wraps the default chainable methods with the elements loop and 'return this'
Object.keys(collectionChain).forEach(key => {
  Apheleia.prototype[key] = function () {
    this.elements.forEach(elem =>
      collectionChain[key].apply(this, [elem].concat(slice.call(arguments)))
    )
    return this
  }
})

// Helpers
const objectifyTuple = (objOrKey, nothingOrValue) =>
  typeof objOrKey === 'string'
  ? {
    [objOrKey]: nothingOrValue,
  }
  : (objOrKey || {})

export default Apheleia
