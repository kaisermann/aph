import {
  isStr,
  isFn,
  isInt,
  isArrayLike,
  createElement,
  aphParseContext,
  querySelector,
  wrapPrototypeMethod,
  hasKey,
} from './helpers.js'

import { arrayPrototype } from './shared.js'

function aphSetWrapper (objOrKey, nothingOrValue) {
  Apheleia.prototype.set.call(this, objOrKey, nothingOrValue)
  return this.aph.owner
}

export default class Apheleia {
  constructor (elems, context, meta) {
    if (!this) return new Apheleia(elems, context, meta)
    this.aph = meta || {}
    this.aph.context = context = aphParseContext(context)
    this.length = 0

    if (isStr(elems)) {
      // If creation string, create the element
      elems = elems[0] === '<' && elems[elems.length - 1] === '>'
        ? createElement(elems)
        : querySelector(elems, context)
    }

    if (!elems) return this

    if (elems.nodeType === 1 || elems === window) {
      this[0] = elems
      this.length = 1
    } else {
      for (
        let len = (this.length = elems.length); // Sets current length
        len--; // Ends loop when reaches 0
        this[len] = elems[len] // Builds the array-like structure
      );
    }
  }

  // Iterates through the elements with a 'callback(element, index)''
  forEach (eachCb) {
    // Iterates through the Apheleia object.
    // If the callback returns false, the iteration stops.
    for (
      let i = 0, len = this.length;
      i < len && eachCb.call(this, this[i], i++) !== false;

    );
    return this
  }

  map (mapCb) {
    const result = []
    for (
      let len = this.length;
      len--;
      result[len] = mapCb(this[len], len, this)
    );
    return Apheleia.wrap(result, this)
  }

  filter (filterCb) {
    return Apheleia.wrap(arrayPrototype.filter.call(this, filterCb), this)
  }

  // Creates an Apheleia instance with the elements found.
  find (selector) {
    return Apheleia(selector, this[0], { owner: this })
  }

  // Returns the collection in array format
  asArray () {
    return arrayPrototype.slice.call(this)
  }

  // Object Property manipulation methods
  get (key) {
    return this.map(elem => elem[key])
  }

  set (objOrKey, nothingOrValue) {
    return this.forEach(
      isStr(objOrKey) || isInt(objOrKey)
        ? elem => {
          elem[objOrKey] = nothingOrValue
        }
        : elem => {
          for (const key in objOrKey) {
            elem[key] = objOrKey[key]
          }
        }
    )
  }

  // Gets and Sets the computed CSS value of a property.
  css (key, val) {
    if (isStr(key) && val == null) {
      return this.map(elem => getComputedStyle(elem)[key])
    }
    return this.style.set(key, val)
  }

  // DOM Manipulation
  detach () {
    return this.forEach(function (elem) {
      elem.parentNode.removeChild(elem)
    })
  }

  // Appends the passed html/aph
  append (futureContent) {
    return this.html(futureContent, (parent, child) => {
      parent.appendChild(child)
    })
  }

  appendTo (newParent) {
    Apheleia(newParent).append(this)
    return this
  }

  // Prepends the passed html/aph
  prepend (futureContent) {
    return this.html(futureContent, (parent, child) => {
      parent.insertBefore(child, parent.firstChild)
    })
  }

  prependTo (newParent) {
    Apheleia(newParent).prepend(this)
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
    if (!isFn(cb)) {
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
          if (flatChildren.indexOf(children[i][j]) < 0) {
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
      flatChildren.forEach(child => {
        cb(parent, isStr(child) ? createElement(child) : child)
      })
    )
  }
  static querySelector (selector, context) {
    return querySelector(selector, aphParseContext(context))
  }

  static wrap (what, owner) {
    let acc = []

    for (let i = 0, len = what.length, item; i < len; i++) {
      item = what[i]

      if (item == null) continue

      if (item.nodeType === 1) {
        // If we received a single node
        if (acc.indexOf(item) < 0) {
          acc.push(item)
        }
      } else if (
        ((item instanceof NodeList || item.constructor instanceof Array) &&
          item[0].nodeType === 1) ||
        item.constructor === Apheleia ||
        item instanceof HTMLCollection
      ) {
        // If we received a node list/collection
        for (let j = 0, len2 = item.length; j < len2; j++) {
          if (acc.indexOf(item[j]) < 0) {
            acc.push(item[j])
          }
        }
      } else {
        what.map = Apheleia.prototype.map
        what.filter = Apheleia.prototype.filter
        what.forEach = Apheleia.prototype.forEach
        what.get = Apheleia.prototype.get
        what.set = aphSetWrapper
        what.aph = { owner: owner }

        // Returns a proxy which allows to access
        // the items methods and properties
        return new Proxy(what, {
          set (target, propKey, val) {
            target.set(propKey, val)
          },
          get (target, propKey) {
            if (hasKey(target, propKey)) {
              return target[propKey]
            }

            if (isFn(target[0][propKey])) {
              return wrapPrototypeMethod(propKey, target[0]).bind(target)
            }

            if (hasKey(target[0], propKey)) {
              return target.map(i => i[propKey])
            }

            return undefined
          },
        })
      }
    }

    return Apheleia(acc, owner ? owner.aph.context : null, { owner: owner })
  }
}

Apheleia.fn = Apheleia.prototype
