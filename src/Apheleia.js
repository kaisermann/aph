const arrProto = Array.prototype

// Check if what's passed is a string
function isStr (maybeStr) {
  return '' + maybeStr === maybeStr
}

// Parses the passed context
function aphParseContext (elemOrAphOrStr) {
  return elemOrAphOrStr instanceof Element
    ? elemOrAphOrStr // If already a html element
    : Apheleia.prototype.isPrototypeOf(elemOrAphOrStr)
        ? elemOrAphOrStr[0] // If already an apheleia object
        : isStr(elemOrAphOrStr)
            ? document.querySelector(elemOrAphOrStr) // If string passed let's search for the element on the DOM
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
    return /^#[\w-]*$/.test(strOrArrayOrAphOrElem) // if #id
      ? [window[strOrArrayOrAphOrElem.slice(1)]]
      : arrProto.slice.call(
          /^\.[\w-]*$/.test(strOrArrayOrAphOrElem) // if .class
            ? ctx.getElementsByClassName(strOrArrayOrAphOrElem.slice(1))
            : /^\w+$/.test(strOrArrayOrAphOrElem) // if tag (a, span, div, ...)
                ? ctx.getElementsByTagName(strOrArrayOrAphOrElem)
                : ctx.querySelectorAll(strOrArrayOrAphOrElem) // anything else
        )
  }

  // If html element passed
  if (strOrArrayOrAphOrElem instanceof Element) {
    return [strOrArrayOrAphOrElem]
  }

  // If node list passed
  // If another apheleia object is passed, get its elements
  if (
    NodeList.prototype.isPrototypeOf(strOrArrayOrAphOrElem) ||
    Apheleia.prototype.isPrototypeOf(strOrArrayOrAphOrElem)
  ) {
    return arrProto.slice.call(strOrArrayOrAphOrElem)
  }

  // If array passed, just return
  if (Array.isArray(strOrArrayOrAphOrElem)) {
    return strOrArrayOrAphOrElem
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
  each (cb) {
    // Iterates through the Apheleia object.
    // If the callback returns false, the iteration stops.
    for (let i = 0; i < this.length && cb.call(this, this[i], i++) !== false;);
    return this
  }

  // Returns a new Apheleia instance with the filtered elements
  filter (cb) {
    return new Apheleia(arrProto.filter.call(this, cb), this.meta.context, {
      parent: this,
    })
  }

  // Returns a new Apheleia instance with a portion of the original collection
  slice (min, max) {
    return new Apheleia(
      arrProto.slice.call(this, min, max),
      this.meta.context,
      {
        parent: this,
      }
    )
  }

  // Creates a new Apheleia instance with the elements found.
  find (selector) {
    return new Apheleia(selector, this[0], { parent: this })
  }

  // Gets the specified element or the whole array if no index was defined
  get (index) {
    return +index === index ? this[index] : arrProto.slice.call(this)
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
        return acc.concat(arrProto.slice.call(item))
      }
      acc.push(item)
      return acc
    }, [])

    // If a callback is received as the second argument
    // let's pass the parent and child nodes
    // and let the callback do all the work
    if (typeof cb === 'function') {
      return this.each(futureParent =>
        futureChildren.forEach(futureChild => cb(futureParent, futureChild))
      )
    }

    // If the second argument is not a valid callback,
    // we will rewrite all parents HTML
    return this.each(futureParent => {
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
        ? this[0].getAttribute(prepend + objOrKey)
        : this.each(elem =>
            elem.setAttribute(prepend + objOrKey, nothingOrValue)
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
    if (isStr(objOrKey)) {
      return nothingOrValue === undefined
        ? this[0][objOrKey]
        : this.each(elem => {
          elem[objOrKey] = nothingOrValue
        })
    }

    return this.each(elem => {
      for (const key in objOrKey) {
        elem[key] = objOrKey[key]
      }
    })
  }

  // CSS
  css (objOrKey, nothingOrValue) {
    if (isStr(objOrKey)) {
      return nothingOrValue === undefined
        ? window.getComputedStyle(this[0])[objOrKey]
        : this.each(elem => {
          elem.style[objOrKey] = nothingOrValue
        })
    }

    return this.each(elem => {
      for (const key in objOrKey) {
        elem.style[key] = objOrKey[key]
      }
    })
  }

  delete () {
    return this.each(elem => elem.parentNode.removeChild(elem))
  }

  // Class methods
  toggleClass (className) {
    return this.each(elem => elem.classList.toggle(className))
  }

  addClass (stringOrArray) {
    return this.each(
      elem =>
        isStr(stringOrArray)
          ? elem.classList.add(stringOrArray)
          : elem.classList.add.apply(elem.classList, stringOrArray)
    )
  }

  removeClass (stringOrArray) {
    return this.each(
      elem =>
        isStr(stringOrArray)
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
    return this.each(elem => elem[fnName].apply(elem, args))
  }

  on (events, cb) {
    return this.each(elem =>
      events
        .split(' ')
        .forEach(eventName => elem.addEventListener(eventName, cb))
    )
  }

  off (events, cb) {
    return this.each(elem =>
      events
        .split(' ')
        .forEach(eventName => elem.removeEventListener(eventName, cb))
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

export default Apheleia
