(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('$$', factory) :
	(global.$$ = factory());
}(this, (function () { 'use strict';

const arrayPrototype = Array.prototype;
const doc = document;

const hasKey = (what, key) => typeof what[key] !== 'undefined';
const isStr = maybeStr => typeof maybeStr === 'string';
const isFn = maybeFn => typeof maybeFn === 'function';

function flattenArrayLike (what) {
  let flat = [];
  for (let i = 0, len = what.length; i < len; i++) {
    if (isArrayLike(what[i])) {
      flat = flat.concat(flattenArrayLike(what[i]));
    } else {
      if (flat.indexOf(what[i]) < 0) {
        flat.push(what[i]);
      }
    }
  }
  return flat
}

// Check if what's passed is to be considered a colletion
function isArrayLike (maybeCollection) {
  return (
    maybeCollection &&
    !isStr(maybeCollection) &&
    !isFn(maybeCollection) &&
    hasKey(maybeCollection, 'length')
  )
}

// Queries a selector
const simpleSelectorPattern = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
function querySelector (selector, ctx) {
  let regTest;
  if ((regTest = simpleSelectorPattern.exec(selector))) {
    let matched;
    if ((matched = regTest[3])) {
      return ctx.getElementsByClassName(matched)
    }

    if ((matched = regTest[2])) {
      return ctx.getElementsByTagName(matched)
    }

    if ((matched = regTest[1])) {
      return doc.getElementById(matched)
    }
  }
  return ctx.querySelectorAll(selector)
}

// Parses the passed context
function aphParseContext (elemOrAphOrStr) {
  return !elemOrAphOrStr
    ? doc // Defaults to the document
    : elemOrAphOrStr instanceof Node
      ? elemOrAphOrStr // If already a html element
      : isStr(elemOrAphOrStr)
        ? querySelector(elemOrAphOrStr, doc)[0] // If string passed let's search for the element on the DOM
        : isArrayLike(elemOrAphOrStr)
          ? elemOrAphOrStr[0] // If already a collection
          : doc // Return the document if nothing else...
}

const singleTagRegEx = /^<(\w+)\/?>(?:$|<\/\1>)/i;
let docFragment;
function createElement (str, match) {
  // We check if there's any newline
  // if yes, we assume it's a complex html element creation
  // if not, we check if it's a simple tag
  if (!/\r|\n/.test(str) && (match = singleTagRegEx.exec(str))) {
    return doc.createElement(match[1])
  }

  if (!docFragment) {
    docFragment = doc.implementation.createHTMLDocument();
    const base = docFragment.createElement('base');
    base.href = document.location.href;
    docFragment.head.appendChild(base);
  }

  docFragment.body.innerHTML = str;
  return docFragment.body.childNodes[0]
}

// Searches for an apheleia collection on the ownership hierarchy
function getAphOwner (what) {
  while (!what.aph) what = what.owner;
  return proxify(what)
}

// Auxiliary map function
function auxMap (overWhat, methodName, args) {
  const result = overWhat.map(i => i[methodName](...args));
  // If first and last items are null/undefined,
  // we assume the method returned nothing
  return result && result[0] != null && result[result.length - 1] != null
    ? result
    : getAphOwner(overWhat)
}

function proxify (what) {
  return new Proxy(what, {
    set (target, propKey, val) {
      target.set(propKey, val);
    },
    get (target, propKey) {
      // If key is '_target' let's return the target itself
      if (propKey === '_target') return target

      if (hasKey(target, propKey)) {
        if (isFn(target[propKey])) {
          return target[propKey].bind(target)
        }
        return target[propKey]
      }

      if (target.length) {
        if (isFn(target[0][propKey])) {
          return wrapPrototypeMethod(propKey, target[0]).bind(target)
        }

        if (hasKey(target[0], propKey)) {
          return target.map(i => i[propKey])
        }
      }

      return undefined
    },
  })
}

// Wraps a object method making it work with collections natively and caches it
const wrappedMethodsCache = {};
function wrapPrototypeMethod (methodName, sample) {
  const curType = sample.constructor.name;

  if (!hasKey(wrappedMethodsCache, curType)) {
    wrappedMethodsCache[curType] = {};
  }

  if (!hasKey(wrappedMethodsCache[curType], methodName)) {
    // Let's cache the wrapper function
    // If we're dealing with a set method,
    // should allow to pass a object as parameter

    wrappedMethodsCache[curType][methodName] = methodName.substr(0, 3) ===
      'set' && methodName[methodName.length - 1] !== 's'
      ? function (...args) {
        // Received only one argument and it's a 'plain' object?
        if (args.length === 1 && args[0].constructor === Object) {
          return getAphOwner(
            this.forEach(item => {
              for (const objKey in args[0]) {
                item[methodName](objKey, args[0][objKey]);
              }
            })
            // this.forEach returns 'this'
          )
        }
        return auxMap(this, methodName, args)
      }
      : function (...args) {
        return auxMap(this, methodName, args)
      };
  }

  return wrappedMethodsCache[curType][methodName]
}

const defaultCollectionMethods = ['map', 'filter', 'forEach', 'get', 'set'];

class Apheleia {
  constructor (elems, context, meta = {}) {
    this.aph = meta;
    this.aph.context = context = aphParseContext(context);
    this.length = 0;

    if (isStr(elems)) {
      // If creation string, create the element
      elems = elems[0] === '<' && elems[elems.length - 1] === '>'
        ? createElement(elems)
        : querySelector(elems, context);
    }

    if (!elems) return this

    if (elems.nodeType === 1 || elems.nodeType === 9 || elems === window) {
      this[0] = elems;
      this.length = 1;
    } else {
      for (
        let len = (this.length = elems.length); // Sets current length
        len--; // Ends loop when reaches 0
        this[len] = elems[len] // Builds the array-like structure
      );
    }
    return (this.aph.proxy = proxify(this))
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
    const result = [];
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
    return getAphOwner(
      this.forEach(
        objOrKey.constructor === Object
          ? elem => {
            for (const key in objOrKey) {
              elem[key] = objOrKey[key];
            }
          }
          : elem => {
            elem[objOrKey] = nothingOrValue;
          }
      )
    )
  }

  // Gets and Sets the computed CSS value of a property.
  css (key, val) {
    if (isStr(key) && val == null) {
      return this.map(elem => getComputedStyle(elem)[key])
    }
    // this.aph.proxy references the proxy in control of this Apheleia instance
    return this.aph.proxy.style.set(key, val)
  }

  // DOM Manipulation
  detach () {
    return this.forEach(elem => elem.parentNode.removeChild(elem))
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
      return this.map(elem => elem.innerHTML)
    }

    // If the .html() is called without a callback, let's erase everything
    // And append the nodes
    if (!isFn(cb)) {
      return this.forEach(parent => {
        parent.innerHTML = '';
      }).append(children)
    }

    // Manipulating arrays is easier
    if (!isArrayLike(children)) {
      children = [children];
    }

    // If we receive any collections (arrays, lists, aph),
    // we must get its elements
    const flatChildren = flattenArrayLike(children);

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
      what = flattenArrayLike(what);
    }

    // Did we receive a list of nodes?
    if (what[0] && what[0].nodeType === 1) {
      return new Apheleia(what, owner.aph ? owner.aph.context : null, { owner })
    }

    // If not, proxify this sh*t
    what.owner = owner;
    defaultCollectionMethods.forEach(key => {
      what[key] = Apheleia.prototype[key];
    });
    return proxify(what)
  }
}

function aph (elems, context, meta) {
  return new Apheleia(elems, context, meta)
}

aph.fn = Apheleia.prototype;
aph.wrap = Apheleia.wrap;
aph.querySelector = Apheleia.querySelector;

return aph;

})));
