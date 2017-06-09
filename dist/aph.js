(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('aph', factory) :
	(global.aph = factory());
}(this, (function () { 'use strict';

var arrayProto = Array.prototype;

function querySelector (selector, ctx) {
  ctx = aphParseContext(ctx);
  return /^#[\w-]*$/.test(selector) // if #id
    ? [window[selector.slice(1)]]
    : slice(
        /^\.[\w-]*$/.test(selector) // if .class
          ? ctx.getElementsByClassName(selector.slice(1))
          : /^\w+$/.test(selector) // if tag (a, span, div, ...)
              ? ctx.getElementsByTagName(selector)
              : ctx.querySelectorAll(selector) // anything else
      )
}

function flatWrap (what, owner) {
  var acc = [];
  for (var i = 0, len = what.length, item = (void 0); i < len; i++) {
    item = what[i];
    if (item != null) {
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
        var sampleEntry = (void 0);
        // Iterate through the result to find a non-null value
        for (
          var counter = 0;
          sampleEntry == null && counter < what.length;
          sampleEntry = what[counter++]
        ){  }

        var methodsToBeCopied = ['map', 'filter', 'forEach', 'get', 'set'];
        methodsToBeCopied.forEach(function (key) {
          what[key] = Apheleia.prototype[key];
        });
        what.aph = { owner: owner };

        // If we're dealing with objects, let's iterate through it's methods
        // If not, we're dealing with primitibe types and
        // we should use it's prototype instead
        assignMethodsAndProperties(
          what,
          sampleEntry,
          function (instance) { return instance.aph.owner; }
        );

        console.log(what);
        return what
      }
    }
  }
  return new Apheleia(acc, owner.aph.context, { owner: owner })
}

function isStr (maybeStr) {
  return '' + maybeStr === maybeStr
}

// Check if what's passed is to be considered a colletion
function isArrayLike (maybeCollection) {
  return (
    maybeCollection && !isStr(maybeCollection) && maybeCollection.length != null
  )
}

function isRelevantCollection (collection) {
  return collection[0] != null || collection[collection.length - 1] != null
}

// Slice a array-like collection
function slice (what, from) {
  return arrayProto.slice.call(what, from || 0)
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
function aphParseElements (strOrCollectionOrElem, ctx) {
  // If string passed
  if (isStr(strOrCollectionOrElem)) {
    // If creation string, create the element
    if (/<.+>/.test(strOrCollectionOrElem)) {
      if (!documentFragment) {
        documentFragment = document.implementation.createHTMLDocument();
      }
      documentFragment.body.innerHTML = strOrCollectionOrElem;
      return documentFragment.body.childNodes
    }
    // If not a creation string, let's search for the elements
    return querySelector(strOrCollectionOrElem, ctx)
  }

  // If html element / window / document passed
  if (
    strOrCollectionOrElem instanceof Node ||
    strOrCollectionOrElem === window
  ) {
    return [strOrCollectionOrElem]
  }

  // If collection passed and
  // is not a string (first if, up there)
  if (isArrayLike(strOrCollectionOrElem)) {
    return strOrCollectionOrElem
  }

  return []
}

function assignMethodsAndProperties (
  what,
  propCollection,
  undefinedResultCallback
) {
  function innerFunction (key) {
    if (what[key] == null) {
      try {
        if (propCollection[key] instanceof Function) {
          what[key] = function () {
            var args = arguments;
            var result = this.map(function (i) { return propCollection[key].apply(i, args); });
            return isRelevantCollection(result)
              ? result
              : undefinedResultCallback ? undefinedResultCallback(this) : this
          };
        } else {
          propGetSetWithProp(what, key);
        }
      } catch (ex) {
        // If we reach this exception, we are probably dealing with a property / getter / setter
        propGetSetWithProp(what, key);
      }
    }
  }

  // For some reason for-in loops with primitive prototypes doesn't work
  // So... If we're dealing with a primitive type, let's get it's prototype
  // And iterate with a Object.getOwnPropertyNames().forEach()
  if (typeof propCollection !== 'object') {
    propCollection = Object.getPrototypeOf(propCollection);
    Object.getOwnPropertyNames(propCollection).forEach(innerFunction);
  } else {
    // If we're dealing with objects, let's iterate through it's properties
    // With a for-in loop
    for (var key in propCollection) {
      innerFunction(key);
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

var Apheleia = function Apheleia (elems, context, aphMetaObj) {
  this.aph = aphMetaObj || {};

  for (
    var list = aphParseElements(
      elems,
      (this.aph.context = aphParseContext(context)) // Sets current context
    ),
      len = (this.length = list.length); // Sets current length
    len--; // Ends loop when reaches 0
    this[len] = list[len] // Builds the array-like structure
  ){  }
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
  return slice(this)
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
Apheleia.prototype.remove = function remove () {
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

  // Manipulating arrays is easier
  if (!Array.isArray(children)) {
    children = [children];
  }

  // If we receive any collections (arrays, lists, aph),
  // we must get its elements
  children = children.reduce(function (acc, item) {
    if (isArrayLike(item)) {
      return acc.concat(slice(item))
    }
    acc.push(item);
    return acc
  }, []);

  // If a callback is received as the second argument
  // let's pass the parent and child nodes
  // and let the callback do all the work
  if (cb instanceof Function) {
    return this.forEach(function (parent) { return children.forEach(function (child) { return cb(parent, child); }); }
    )
  }

  // If the second argument is not a valid callback,
  // we will rewrite all parents HTML
  return this.forEach(function (parent) {
    parent.innerHTML = '';
    children.forEach(function (child) {
      parent.innerHTML += isStr(child) ? child : child.outerHTML;
    });
  })
};

function aph (elems, context, metaObj) {
  return new Apheleia(elems, context, metaObj)
}

aph.fn = Apheleia.prototype;
aph.flatWrap = flatWrap;
aph.querySelector = querySelector;

// Extending the Array Prototype
var newCollectionMethods = ['map', 'filter'];
// Here is where all the magic happens
newCollectionMethods.forEach(function (key) {
  aph.fn[key] = function () {
    return flatWrap(arrayProto[key].apply(this, arguments), this)
  };
});

// Irrelevant methods on the context of an Apheleia collection
var ignoreMethods = [
  'concat',
  'copyWithin',
  'fill',
  'join',
  'reduce',
  'reduceRight',
  'slice',
  'splice' ];
Object.getOwnPropertyNames(arrayProto).forEach(function (key) {
  if (!~ignoreMethods.indexOf(key) && aph.fn[key] == null) {
    aph.fn[key] = arrayProto[key];
  }
});

// Extending default HTMLElement methods and properties
assignMethodsAndProperties(aph.fn, document.createElement('div'));

return aph;

})));
