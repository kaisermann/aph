(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('$$', factory) :
	(global.$$ = factory());
}(this, (function () { 'use strict';

const arrayPrototype = Array.prototype;
const doc = document;

function hasKey (what, key) {
  return typeof what[key] !== 'undefined'
}

// Check if what's passed is a string
function isStr (maybeStr) {
  return typeof maybeStr === 'string'
}

function isFn (maybeFn) {
  return typeof maybeFn === 'function'
}

function isInt (maybeInt) {
  return typeof maybeInt === 'number' && Math.floor(maybeInt) === maybeInt
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
  let matched;
  if ((regTest = simpleSelectorPattern.exec(selector))) {
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

// Parses the elements passed to aph()
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

// Wraps a object method making it work with collections natively and caches it
const wrappedMethodsCache = {};

// Searches for an apheleia collection on the ownership hierarchy
function getAphOwner (what) {
  while (what.aph === undefined) what = what.owner;
  return proxify(what)
}

// Auxiliary map function
function auxMap (overWhat, methodName, args) {
  const result = overWhat.map(i => i[methodName].apply(i, args));
  // If first and last items are null/undefined,
  // we assume the method returned nothing
  return result[0] != null && result[result.length - 1] != null
    ? result
    : getAphOwner(overWhat)
}

function proxify (what) {
  return new Proxy(what, {
    set (target, propKey, val) {
      target.set(propKey, val);
    },
    get (target, propKey) {
      if (hasKey(target, propKey)) {
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
      ? function () {
        const args = arguments;
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
      : function () {
        return auxMap(this, methodName, arguments)
      };
  }

  return wrappedMethodsCache[curType][methodName]
}

let defaultCollectionMethods = {};

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
    return proxify(this)
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
        isStr(objOrKey) || isInt(objOrKey)
          ? elem => {
            elem[objOrKey] = nothingOrValue;
          }
          : elem => {
            for (const key in objOrKey) {
              elem[key] = objOrKey[key];
            }
          }
      )
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
    return this.forEach(elem => elem.parentNode.removeChild(elem))
  }

  // Appends the passed html/aph
  append (futureContent) {
    return this.html(futureContent, (parent, child) =>
      parent.appendChild(child)
    )
  }

  appendTo (newParent) {
    new Apheleia(newParent).append(this);
    return this
  }

  // Prepends the passed html/aph
  prepend (futureContent) {
    return this.html(futureContent, (parent, child) => {
      parent.insertBefore(child, parent.firstChild);
    })
  }

  prependTo (newParent) {
    new Apheleia(newParent).prepend(this);
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
        parent.innerHTML = '';
      }).append(children)
    }

    // Manipulating arrays is easier
    if (!isArrayLike(children)) {
      children = [children];
    }

    // If we receive any collections (arrays, lists, aph),
    // we must get its elements
    const flatChildren = [];
    for (let i = 0, len = children.length; i < len; i++) {
      if (isArrayLike(children[i])) {
        for (let j = 0, len2 = children[i].length; j < len2; j++) {
          if (flatChildren.indexOf(children[i][j]) < 0) {
            flatChildren.push(children[i][j]);
          }
        }
      } else {
        flatChildren.push(children[i]);
      }
    }

    // If a callback is received as the second argument
    // let's pass the parent and child nodes
    // and let the callback do all the work
    return this.forEach(parent => {
      flatChildren.forEach(child => {
        cb(parent, isStr(child) ? createElement(child) : child);
      });
    })
  }

  static querySelector (selector, context) {
    return querySelector(selector, aphParseContext(context))
  }

  static wrap (what, owner) {
    let acc = [];

    for (let i = 0, len = what.length, item; i < len; i++) {
      item = what[i];

      if (item == null) continue

      if (item.nodeType === 1) {
        // If we received a single node
        if (acc.indexOf(item) < 0) {
          acc.push(item);
        }
      } else if (
        ((item instanceof NodeList || Array.isArray(item)) &&
          item[0].nodeType === 1) ||
        item.aph !== undefined ||
        item instanceof HTMLCollection
      ) {
        // If we received a node list/collection
        for (let j = 0, len2 = item.length; j < len2; j++) {
          if (acc.indexOf(item[j]) < 0) {
            acc.push(item[j]);
          }
        }
      } else {
        return proxify(Object.assign(what, defaultCollectionMethods, { owner }))
      }
    }

    return new Apheleia(acc, owner.aph ? owner.aph.context : null, { owner })
  }
}

['map', 'filter', 'forEach', 'get', 'set'].forEach(key => {
  defaultCollectionMethods[key] = Apheleia.prototype[key];
});

function aph (elems, context, meta) {
  return new Apheleia(elems, context, meta)
}

aph.fn = Apheleia.prototype;

return aph;

})));
