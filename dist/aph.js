(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('aph', factory) :
	(global.aph = factory());
}(this, (function () { 'use strict';

// Check if what's passed is a string
function isStr (maybeStr) {
  return typeof maybeStr === 'string'
}

// Check if what's passed is to be considered a colletion
function isArrayLike (maybeCollection) {
  return (
    maybeCollection &&
    !isStr(maybeCollection) &&
    typeof maybeCollection !== 'function' &&
    maybeCollection.length != null
  )
}

function isRelevantCollection (collection) {
  return collection[0] != null || collection[collection.length - 1] != null
}

// Queries a selector
var simpleSelectorPattern = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
function querySelector (selector, ctx) {
  var regTest = simpleSelectorPattern.exec(selector);
  var matched;
  return (matched = regTest[1]) // if #id
    ? document.getElementById(matched)
    : (matched = regTest[2]) // if tag (a, span, div, ...)
      ? ctx.getElementsByTagName(matched)
      : (matched = regTest[3]) // if .class
        ? ctx.getElementsByClassName(matched)
        : ctx.querySelectorAll(selector) // anything else
}

// Parses the passed context
function aphParseContext (elemOrAphOrStr) {
  return elemOrAphOrStr instanceof Node
    ? elemOrAphOrStr // If already a html element
    : isStr(elemOrAphOrStr)
      ? querySelector(elemOrAphOrStr, document)[0] // If string passed let's search for the element on the DOM
      : isArrayLike(elemOrAphOrStr)
        ? elemOrAphOrStr[0] // If already an collection
        : document // Return the document.
}

// Parses the elements passed to aph()
var documentFragment;
function createElement (str) {
  if (!documentFragment) {
    documentFragment = document.implementation.createHTMLDocument();
  }
  documentFragment.body.innerHTML = str;
  return documentFragment.body.childNodes[0]
}

var prototypeCache = {};
var propCache = {};

function assignMethodsAndProperties (
  what,
  propCollection,
  undefinedResultCallback
) {
  var typeBeingDealtWith = propCollection.constructor.name;

  // If the wrapped methods cache doesn't exist for this variable type
  // Let's create it
  if (!prototypeCache[typeBeingDealtWith]) {
    prototypeCache[typeBeingDealtWith] = {};
  }

  function setProp (collection, key) {
    if (what[key] == null) {
      try {
        if (collection[key] instanceof Function) {
          if (!prototypeCache[typeBeingDealtWith][key]) {
            // Let's cache the wrapper function
            // If we're dealing with a set method,
            // should allow to pass a object as parameter
            prototypeCache[typeBeingDealtWith][key] = key.substr(0, 3) ===
              'set' && key[key.length - 1] !== 's'
              ? function () {
                var args = arguments;
                if (args.length === 1 && args[0].constructor === Object) {
                  return undefinedResultCallback(
                      // this.forEach returns 'this'
                      this.forEach(function (item) {
                        for (var objKey in args[0]) {
                          collection[key].call(item, objKey, args[0][objKey]);
                        }
                      })
                    )
                }

                var result = this.map(function (i) { return collection[key].apply(i, args); });
                return isRelevantCollection(result)
                    ? result
                    : undefinedResultCallback(this)
              }
              : function () {
                var args = arguments;
                var result = this.map(function (i) { return collection[key].apply(i, args); });
                return isRelevantCollection(result)
                    ? result
                    : undefinedResultCallback(this)
              };
          }
          what[key] = prototypeCache[typeBeingDealtWith][key];
        } else {
          propGetSetWithProp(what, key);
        }
      } catch (ex) {
        // If we reach this exception, we are probably dealing with a property / getter / setter
        propGetSetWithProp(what, key);
      }
    }
  }

  // Let's get the methods first
  var curPrototype = Object.getPrototypeOf(propCollection);
  var prototypeKeys = {};
  Object.getOwnPropertyNames(curPrototype).forEach(function (methodName) {
    setProp(curPrototype, methodName);
    prototypeKeys[methodName] = 1;
  });

  // And now the properties
  // Is there already a cache for this type's properties?
  if (!propCache[typeBeingDealtWith]) {
    propCache[typeBeingDealtWith] = [];
    for (var key in propCollection) {
      if (isNaN(key) && !prototypeKeys[key]) {
        propCache[typeBeingDealtWith].push(key);
        setProp(propCollection, key);
      }
    }
  } else {
    // If yes, let's use the prop cache
    // Inverse for loop, the order is not relevant here
    for (var len = propCache[typeBeingDealtWith].length; len--;) {
      setProp(propCollection, propCache[typeBeingDealtWith][len]);
    }
  }
}

// Sets the set/get methods of a property as the Apheleia.prop method
function propGetSetWithProp (obj, key) {
  Object.defineProperty(obj, key, {
    get: function get () {
      return this.get(key)
    },
    set: function set (value) {
      this.set(key, value);
    },
  });
}

var arrayPrototype = Array.prototype;

function aphSetWrapper () {
  Apheleia.prototype.set.apply(this, arguments);
  return this.aph.owner
}

function wrap (what, owner) {
  var acc = [];

  for (var i = 0, len = what.length, item = (void 0); i < len; i++) {
    item = what[i];
    if (item == null) { continue }

    if (item instanceof Node) {
      // If we received a single node
      if (!~acc.indexOf(item)) {
        acc.push(item);
      }
    } else if (
      item instanceof NodeList ||
      item instanceof HTMLCollection ||
      item instanceof Apheleia ||
      (item instanceof Array && item[0] instanceof Node)
    ) {
      // If we received a node list/collection
      for (var j = 0, len2 = item.length; j < len2; j++) {
        if (!~acc.indexOf(item[j])) {
          acc.push(item[j]);
        }
      }
    } else {
      var methodsToBeCopied = ['map', 'filter', 'forEach', 'get', 'call'];
      methodsToBeCopied.forEach(function (key) {
        what[key] = Apheleia.prototype[key];
      });
      what.set = aphSetWrapper;
      what.aph = { owner: owner };

      assignMethodsAndProperties(what, item, function (instance) { return instance.aph.owner; });

      return what
    }
  }

  return new Apheleia(acc, owner.aph.context, { owner: owner })
}

var Apheleia = function Apheleia (elems, context, aphMetaObj) {
  this.aph = aphMetaObj || {};
  this.aph.context = context = aphParseContext(context);

  if (isStr(elems)) {
    // If creation string, create the element
    elems = elems[0] === '<' &&
      elems[elems.length - 1] === '>' &&
      elems.length > 2
      ? createElement(elems)
      : querySelector(elems, context);
  }

  if (!elems) { return this }
  if (elems.nodeType || elems === window) {
    this[0] = elems;
    this.length = 1;
  } else {
    for (
      var len = (this.length = elems.length); // Sets current length
      len--; // Ends loop when reaches 0
      this[len] = elems[len] // Builds the array-like structure
    ){  }
  }
};

Apheleia.prototype.call = function call (fn) {
  var args = arguments;
  var result = this.map(function (elem, result) { return elem[fn].apply(elem, args); });
  return isRelevantCollection(result) ? result : this
};

Apheleia.prototype.map = function map () {
  return wrap(arrayPrototype.map.apply(this, arguments), this)
};

Apheleia.prototype.filter = function filter () {
  return wrap(arrayPrototype.filter.apply(this, arguments), this)
};

// Iterates through the elements with a 'callback(element, index)''
Apheleia.prototype.forEach = function forEach (cb) {
  // Iterates through the Apheleia object.
  // If the callback returns false, the iteration stops.
  for (
    var i = 0, len = this.length;
    i < len && cb.call(this, this[i], i++) !== false;

  ){  }
  return this
};

// Creates a new Apheleia instance with the elements found.
Apheleia.prototype.find = function find (selector) {
  return new Apheleia(selector, this[0], { owner: this })
};

// Returns the collection in array format
Apheleia.prototype.asArray = function asArray () {
  return arrayPrototype.slice.call(this)
};

// Object Property manipulation methods
Apheleia.prototype.get = function get (key) {
  return this.map(function (elem) { return elem[key]; })
};

Apheleia.prototype.set = function set (objOrKey, nothingOrValue) {
  if (typeof objOrKey !== 'object') {
    return this.forEach(function (elem) {
      elem[objOrKey] = nothingOrValue;
    })
  }

  return this.forEach(function (elem) {
    for (var key in objOrKey) {
      elem[key] = objOrKey[key];
    }
  })
};

// Sets CSS or gets the computed value
Apheleia.prototype.css = function css (objOrKey, nothingOrValue) {
  if (typeof objOrKey !== 'object') {
    return nothingOrValue == null
      ? this.map(function (elem) { return getComputedStyle(elem)[objOrKey]; })
      : this.forEach(function (elem) {
        elem.style[objOrKey] = nothingOrValue;
      })
  }

  return this.forEach(function (elem) {
    for (var key in objOrKey) {
      elem.style[key] = objOrKey[key];
    }
  })
};

// DOM Manipulation
Apheleia.prototype.detach = function detach () {
  return this.forEach(function (elem) {
    elem.parentNode.removeChild(elem);
  })
};

// Appends the passed html/aph
Apheleia.prototype.append = function append (futureContent) {
  return this.html(futureContent, function (parent, child) {
    parent.appendChild(child);
  })
};

Apheleia.prototype.appendTo = function appendTo (newParent) {
  new Apheleia(newParent).append(this);
  return this
};

// Prepends the passed html/aph
Apheleia.prototype.prepend = function prepend (futureContent) {
  return this.html(futureContent, function (parent, child) {
    parent.insertBefore(child, parent.firstChild);
  })
};

Apheleia.prototype.prependTo = function prependTo (newParent) {
  new Apheleia(newParent).prepend(this);
  return this
};

// Sets or gets the html
Apheleia.prototype.html = function html (children, cb) {
  // If there're no arguments
  // Let's return the html of the first element
  if (children == null) {
    return this.map(function (elem) { return elem.innerHTML; })
  }

  // If the .html() is called without a callback, let's erase everything
  // And append the nodes
  if (!(cb instanceof Function)) {
    return this.forEach(function (parent) {
      parent.innerHTML = '';
    }).append(children)
  }

  // Manipulating arrays is easier
  if (!isArrayLike(children)) {
    children = [children];
  }

  // If we receive any collections (arrays, lists, aph),
  // we must get its elements
  var flatChildren = [];
  for (var i = 0, len = children.length; i < len; i++) {
    if (isArrayLike(children[i])) {
      for (var j = 0, len2 = children[i].length; j < len2; j++) {
        if (!~flatChildren.indexOf(children[i][j])) {
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
  return this.forEach(function (parent) { return flatChildren.forEach(function (child) { return cb(parent, isStr(child) ? createElement(child) : child); }
    ); }
  )
};

function aph (elems, context, metaObj) {
  return new Apheleia(elems, context, metaObj)
}

aph.fn = Apheleia.prototype;
aph.wrap = wrap;
aph.querySelector = function (selector, context) {
  querySelector(selector, aphParseContext(context));
};

// Extending the Array Prototype
// Irrelevant methods on the context of an Apheleia Collection
var ignoreMethods = [
  'concat',
  'copyWithin',
  'fill',
  'join',
  'reduce',
  'reduceRight',
  'slice',
  'splice',
  'sort' ];

Object.getOwnPropertyNames(arrayPrototype).forEach(function (key) {
  if (!~ignoreMethods.indexOf(key) && aph.fn[key] == null) {
    aph.fn[key] = arrayPrototype[key];
  }
});

// Extending default HTMLElement methods and properties
assignMethodsAndProperties(aph.fn, createElement('<div>'), function (instance) { return instance; });

return aph;

})));
