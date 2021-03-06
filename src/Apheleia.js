import {
  isStr,
  isFn,
  isArrayLike,
  createElement,
  aphParseContext,
  querySelector,
  getAphProxy,
  flattenArrayLike,
  proxify,
} from './helpers.js'

import { arrayPrototype } from './shared.js'

export default class Apheleia {
  constructor (elems, context, meta = {}) {
    this.aph = meta
    this.aph.context = context = aphParseContext(context)
    this.length = 0

    if (isStr(elems)) {
      // If creation string, create the element
      elems =
        elems[0] === '<' && elems[elems.length - 1] === '>'
          ? createElement(elems)
          : querySelector(elems, context)
    }

    if (elems) {
      if (elems.nodeType === 1 || elems.nodeType === 9 || elems === window) {
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
    return (this.aph.proxy = proxify(this))
  }

  // Iterates through the elements with a 'callback(element, index)''
  forEach (eachCb) {
    // Iterates through the Apheleia object.
    // If the callback returns false, the iteration stops.
    for (
      let i = 0, len = this.length;
      len-- && eachCb.call(this, this[i], i++) !== false;

    );

    // If we have an owner, let's get the apheleia owner
    return getAphProxy(this)
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
    return new Apheleia(selector, this[0], { owner: this })
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
    return getAphProxy(
      this.forEach(
        objOrKey.constructor === Object
          ? item => {
            for (const key in objOrKey) {
              item[key] = objOrKey[key]
            }
          }
          : item => {
            item[objOrKey] = nothingOrValue
          }
      )
    )
  }

  // Gets and Sets the computed CSS value of a property.
  css (key, val) {
    if (isStr(key) && val == null) {
      return this.map(item => getComputedStyle(item)[key])
    }
    // this.aph.proxy references the proxy in control of this Apheleia instance
    this.aph.proxy.style.set(key, val)
  }

  // DOM Manipulation
  detach () {
    return this.forEach(item => item.parentNode.removeChild(item))
  }

  // Appends the passed html/aph
  append (futureContent) {
    return this.html(futureContent, (parent, child) =>
      parent.appendChild(child)
    )
  }

  appendTo (newParent) {
    return new Apheleia(newParent).append(this) && this
  }

  // Prepends the passed html/aph
  prepend (futureContent) {
    return this.html(futureContent, (parent, child) =>
      parent.insertBefore(child, parent.firstChild)
    )
  }

  prependTo (newParent) {
    return new Apheleia(newParent).prepend(this) && this
  }

  // Sets or gets the html
  html (children, cb) {
    // If there're no arguments
    // Let's return the html of the first element
    if (children == null) {
      return this.map(item => item.innerHTML)
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
    const flatChildren = flattenArrayLike(children)

    // If a callback is received as the second argument
    // let's pass the parent and child nodes
    // and let the callback do all the work
    return this.forEach(parent =>
      flatChildren.forEach(child =>
        cb(parent, isStr(child) ? createElement(child) : child)
      )
    )
  }

  static querySelector (selector, context) {
    return querySelector(selector, aphParseContext(context))
  }

  static wrap (what, owner) {
    // If it's a collection of nothing, return nothing
    if (what[0] == null) return

    // If we receive an array like of nodes, let's flatten it
    if (isArrayLike(what[0]) && what[0][0] && what[0][0].nodeType === 1) {
      what = flattenArrayLike(what)
    }

    // Did we receive a list of nodes?
    if (what[0] && what[0].nodeType === 1) {
      return new Apheleia(what, owner.aph ? owner.aph.context : null, { owner })
    }

    what.owner = owner
    what.map = Apheleia.prototype.map
    what.filter = Apheleia.prototype.filter
    what.forEach = Apheleia.prototype.forEach
    what.get = Apheleia.prototype.get
    what.set = Apheleia.prototype.set
    // If not, proxify this sh*t
    return proxify(what)
  }
}
