import {
  isStr,
  isArrayLike,
  slice,
  createElement,
  isRelevantCollection,
  aphParseContext,
  aphParseElements,
} from './helpers.js'

export default class Apheleia {
  constructor (elems, context, aphMetaObj) {
    this.aph = aphMetaObj || {}

    for (
      let list = aphParseElements(
        elems,
        (this.aph.context = aphParseContext(context)) // Sets current context
      ),
        len = (this.length = list.length); // Sets current length
      len--; // Ends loop when reaches 0
      this[len] = list[len] // Builds the array-like structure
    );
  }

  call (fn) {
    const args = slice(arguments, 1)
    const result = this.map((elem, result) => elem[fn].apply(elem, args))
    return isRelevantCollection(result) ? result : this
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

  // Creates a new Apheleia instance with the elements found.
  find (selector) {
    return new Apheleia(selector, this[0], { owner: this })
  }

  // Returns the collection in array format
  asArray () {
    return slice(this)
  }

  // Object Property manipulation methods
  get (key) {
    return this.map(elem => elem[key])
  }

  set (objOrKey, nothingOrValue) {
    if (typeof objOrKey !== 'object') {
      return this.forEach(function (elem) {
        elem[objOrKey] = nothingOrValue
      })
    }

    return this.forEach(function (elem) {
      for (const key in objOrKey) {
        elem[key] = objOrKey[key]
      }
    })
  }

  // Sets CSS or gets the computed value
  css (objOrKey, nothingOrValue) {
    if (typeof objOrKey !== 'object') {
      return nothingOrValue == null
        ? this.map(elem => getComputedStyle(elem)[objOrKey])
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

  // DOM Manipulation
  detach () {
    return this.forEach(function (elem) {
      elem.parentNode.removeChild(elem)
    })
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
    if (children == null) {
      return this.map(elem => elem.innerHTML)
    }

    // If the .html() is called without a callback, let's erase everything
    // And append the nodes
    if (!(cb instanceof Function)) {
      return this.forEach(parent => {
        parent.innerHTML = ''
      }).append(children)
    }

    // Manipulating arrays is easier
    if (!isArrayLike(children)) {
      children = [children]
    }

    // If we receive any collections (arrays, lists, aph),
    // we must get its elements
    const flatChildren = []
    for (let i = 0, len = children.length; i < len; i++) {
      if (isArrayLike(children[i])) {
        for (let j = 0, len2 = children[i].length; j < len2; j++) {
          if (!~flatChildren.indexOf(children[i][j])) {
            flatChildren.push(children[i][j])
          }
        }
      } else {
        flatChildren.push(children[i])
      }
    }

    // If a callback is received as the second argument
    // let's pass the parent and child nodes
    // and let the callback do all the work
    return this.forEach(parent =>
      flatChildren.forEach(child =>
        cb(parent, isStr(child) ? createElement(child) : child)
      )
    )
  }
}
