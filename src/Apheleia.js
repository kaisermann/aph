import {
  isStr,
  isArrayLike,
  slice,
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
  remove () {
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

    // Manipulating arrays is easier
    if (!Array.isArray(children)) {
      children = [children]
    }

    // If we receive any collections (arrays, lists, aph),
    // we must get its elements
    children = children.reduce((acc, item) => {
      if (isArrayLike(item)) {
        return acc.concat(slice(item))
      }
      acc.push(item)
      return acc
    }, [])

    // If a callback is received as the second argument
    // let's pass the parent and child nodes
    // and let the callback do all the work
    if (cb instanceof Function) {
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
}
