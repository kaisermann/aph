(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('aph', factory) :
	(global.aph = factory());
}(this, (function () { 'use strict';

var arrayPrototype = Array.prototype;
var doc = document;

function aphSetWrapper (objOrKey, nothingOrValue) {
  Apheleia.prototype.set.call(this, objOrKey, nothingOrValue);
  return this.aph.owner
}

var defaultWrapperMethods = ['map', 'filter', 'forEach', 'get'];
function wrap (what, owner) {
  var acc = [];

  for (var i = 0, len = what.length, item = (void 0); i < len; i++) {
    item = what[i];

    if (item == null) { continue }

    if (item.nodeType === 1) {
      // If we received a single node
      if (!~acc.indexOf(item)) {
        acc.push(item);
      }
    } else if (
      ((item instanceof NodeList || item.constructor instanceof Array) &&
        item[0].nodeType === 1) ||
      item.constructor === Apheleia ||
      item instanceof HTMLCollection
    ) {
      // If we received a node list/collection
      for (var j = 0, len2 = item.length; j < len2; j++) {
        if (!~acc.indexOf(item[j])) {
          acc.push(item[j]);
        }
      }
    } else {
      defaultWrapperMethods.forEach(function (key) {
        what[key] = Apheleia.prototype[key];
      });
      what.set = aphSetWrapper;
      what.aph = { owner: owner };

      // Returns a proxy which allows to access methods and properties
      // of the list items type.
      return new Proxy(what, {
        set: function set (target, propKey, val) {
          target.set(propKey, val);
        },
        get: function get (target, propKey) {
          if (hasKey(target, propKey)) {
            return target[propKey]
          }

          if (isFn(target[0][propKey])) {
            return wrapPrototypeMethod(propKey, target[0]).bind(target)
          }

          if (!hasKey(target[0], propKey)) {
            return undefined
          }

          return target.map(function (i) { return i[propKey]; })
        },
      })
    }
  }

  return new Apheleia(acc, owner ? owner.aph.context : null, { owner: owner })
}

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
var simpleSelectorPattern = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
function querySelector (selector, ctx) {
  var regTest;
  var matched;
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
          ? elemOrAphOrStr[0] // If already an collection
          : doc // Return the document if nothing else...
}

// Parses the elements passed to aph()
// This regex assumes the string begins with < and ends with >
var singleTagRegEx = /(\w+)\/?>(?:<\/\1)?/i;
var docFragment;
function createElement (str, match) {
  if ((match = singleTagRegEx.exec(str))) {
    return doc.createElement(match[1])
  } else if (!docFragment) {
    docFragment = doc.implementation.createHTMLDocument();
    var base = docFragment.createElement('base');
    base.href = document.location.href;
    docFragment.head.appendChild(base);
  }

  docFragment.body.innerHTML = str;
  return docFragment.body.childNodes[0]
}

// Wraps a object method making it work with collections natively and caches it
var wrappedMethodsCache = {};

function auxMap (overWhat, methodName, args) {
  var result = overWhat.map(function (i) { return i[methodName].apply(i, args); });
  return result[0] != null || result[result.length - 1] != null
    ? result
    : getAphOwner(overWhat)
}

function getAphOwner (what) {
  while (!(what.constructor === Apheleia)) { what = what.aph.owner; }
  return what
}

function wrapPrototypeMethod (methodName, sample) {
  var curType = sample.constructor.name;

  if (!hasKey(wrappedMethodsCache, curType)) {
    wrappedMethodsCache[curType] = {};
  }

  if (!hasKey(wrappedMethodsCache[curType], methodName)) {
    // Let's cache the wrapper function
    // If we're dealing with a set method,
    // should allow to pass a object as parameter
    var isSetMethod =
      methodName.substr(0, 3) === 'set' &&
      methodName[methodName.length - 1] !== 's';

    wrappedMethodsCache[curType][methodName] = isSetMethod
      ? function () {
        var args = arguments;
        if (args.length === 1 && args[0].constructor === Object) {
          return getAphOwner(
              // this.forEach returns 'this'
              this.forEach(function (item) {
                for (var objKey in args[0]) {
                  item[methodName](objKey, args[0][objKey]);
                }
              })
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

var Apheleia = function Apheleia (elems, context, aphMetaObj) {
  this.aph = aphMetaObj || {};

  if (isStr(elems)) {
    // If creation string, create the element
    elems = elems[0] === '<' &&
      elems[elems.length - 1] === '>' &&
      elems.length > 2
      ? createElement(elems)
      : querySelector(elems, (this.aph.context = aphParseContext(context)));
  }

  if (!elems) { return this }
  if (elems.nodeType === 1 || elems === window) {
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

Apheleia.prototype.map = function map (cb) {
  var result = [];
  for (var len = this.length; len--; result[len] = cb(this[len], len, this)){  }
  return wrap(result, this)
};

Apheleia.prototype.filter = function filter (cb) {
  return wrap(arrayPrototype.filter.call(this, cb), this)
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
  return this.forEach(
    typeof objOrKey !== 'object'
      ? function (elem) {
        elem[objOrKey] = nothingOrValue;
      }
      : function (elem) {
        for (var key in objOrKey) {
          elem[key] = objOrKey[key];
        }
      }
  )
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
  return this.forEach(function (parent) { return flatChildren.forEach(function (child) {
      cb(parent, isStr(child) ? createElement(child) : child);
    }); }
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

var irrelevantArrayMethods = [
  'concat',
  'copyWithin',
  'fill',
  'join',
  'reduce',
  'reduceRight',
  'splice',
  'sort',
  'slice' ];

// Extending the Array Prototype
// Irrelevant methods on the context of an Apheleia Collection
Object.getOwnPropertyNames(arrayPrototype).forEach(function (key) {
  if (!~irrelevantArrayMethods.indexOf(key) && !hasKey(aph.fn, key)) {
    aph.fn[key] = arrayPrototype[key];
  }
});

// Extending default HTMLDivElement methods and properties
var aDiv = createElement('<div>');
var loop = function ( propKey ) {
  if (!hasKey(aph.fn, propKey)) {
    if (isFn(aDiv[propKey])) {
      aph.fn[propKey] = wrapPrototypeMethod(propKey, aDiv);
    } else {
      Object.defineProperty(aph.fn, propKey, {
        get: function get () {
          return this.get(propKey)
        },
        set: function set (value) {
          this.set(propKey, value);
        },
      });
    }
  }
};

for (var propKey in aDiv) loop( propKey );
aDiv = null;

return aph;

})));
