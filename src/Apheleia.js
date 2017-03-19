class Apheleia {
  constructor (elems, contextOrAttr, nothingOrAttrVal) {
    // Second parameter is used as context when a HTML Element is passed
    // Second/Third parameter are used as attribute object/list/pair when creating elements
    this.context = contextOrAttr instanceof Element ? contextOrAttr : document
    this.elements = this.parseElems(elems)
    this.length = this.elements.length

    // If second parameter is not an html element and not undefined, we assume it's an attribute obj
    if (!(contextOrAttr instanceof Element) && contextOrAttr) {
      this.attr(contextOrAttr, nothingOrAttrVal)
    }
  }

  parseElems (stringOrListOrNode) {
    // If single string
    if ('' + stringOrListOrNode === stringOrListOrNode) {
      const isCreationStr = /<(\w*)\/?>/.exec(stringOrListOrNode)
      // If creation string
      if (isCreationStr) {
        return [document.createElement(isCreationStr[1])]
      }
      // If not a creation string, let's search for the elements
      return Array.prototype.slice.call(this.context.querySelectorAll(stringOrListOrNode))
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
    // If prepend is falsy, it would be an empty string anyway
    prepend = prepend || ''

    let tmpObj = objOrKey
    // Is the first parameter a key string?
    if ('' + objOrKey === objOrKey) {
      // If passed only a key, let's return the attribute
      if (nothingOrValue === undefined) {
        return this.elements[0].getAttribute(prepend + objOrKey)
      }
      // If not, let's objectify the key/value pair
      tmpObj = { [objOrKey]: nothingOrValue }
    }

    // Finally, let's set the attributes
    Object.keys(tmpObj).forEach(key => this.each(elem => elem.setAttribute(prepend + key, tmpObj[key])))
    return this
  }

  prop (objOrKey, nothingOrValue) {
    let tmpObj = objOrKey
    // Is the first parameter a key string?
    if ('' + objOrKey === objOrKey) {
      // If passed only a key, let's return the property
      if (nothingOrValue === undefined) {
        return this.elements[0][objOrKey]
      }
      // If not, let's objectify the key/value pair
      tmpObj = { [objOrKey]: nothingOrValue }
    }

    // Finally, let's set the properties
    Object.keys(tmpObj).forEach(key => this.each(elem => (elem[key] = tmpObj[key])))
    return this
  }

  data (objOrKey, nothingOrValue) {
    return this.attr(objOrKey, nothingOrValue, 'data-')
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
  appendTo (element, newParent) {
    newParent.appendChild(element)
  },
  prependTo (element, newParent) {
    newParent.insertBefore(element, newParent.firstChild)
  },
  delete (element) {
    element.parentNode.removeChild(element)
  },
  // Class methods
  toggleClass (element, className) {
    element.classList.toggle(className)
  },
  addClass (element) {
    element.classList.add(Array.prototype.slice.call(arguments, 1))
  },
  removeClass (element) {
    element.classList.remove(Array.prototype.slice.call(arguments, 1))
  },
  // Wrapper for Node methods
  exec (element, fnName) {
    element[fnName].apply(element, Array.prototype.slice.call(arguments, 2))
  },
  on (element, events, cb) {
    events.split(' ').forEach(eventName => element.addEventListener(eventName, cb))
  },
  off (element, events, cb) {
    events.split(' ').forEach(eventName => element.removeEventListener(eventName, cb))
  },
  once (element, events, cb) {
    const onceFn = e => (cb(e) || this.off(e.type, onceFn))
    this.on(events, onceFn)
  },
}

// Wraps the default chainable methods with the elements loop and 'return this'
Object.keys(collectionChain).forEach(key => {
  Apheleia.prototype[key] = function () {
    this.each(elem =>
      collectionChain[key].apply(
        this,
        [elem].concat(Array.prototype.slice.call(arguments))
      )
    )
    return this
  }
})

export default Apheleia
