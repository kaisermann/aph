(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('aph', factory) :
	(global.aph = factory());
}(this, (function () { 'use strict';

var protoCache = { Array: Array.prototype };
var arrayProto = protoCache.Array;
var apheleiaProto;

function slice (what, from) {
  return arrayProto.slice.call(what, from || 0)
}

// Check if what's passed is a string
function isStr (maybeStr) {
  return '' + maybeStr === maybeStr
}

// Check if what's passed is to be considered a colletion
function isValidCollection (maybeCollection) {
  return (
    maybeCollection && !isStr(maybeCollection) && maybeCollection.length != null
  )
}

// Parses the passed context
function aphParseContext (elemOrAphOrStr) {
  return elemOrAphOrStr instanceof Node
    ? elemOrAphOrStr // If already a html element
    : isStr(elemOrAphOrStr)
        ? Apheleia.querySelector(elemOrAphOrStr, document)[0] // If string passed let's search for the element on the DOM
        : isValidCollection(elemOrAphOrStr)
            ? elemOrAphOrStr[0] // If already an collection
            : document // Return the document.
}

// Parses the elements passed to aph()
function aphParseElements (strOrCollectionOrElem, ctx) {
  // If string passed
  if (isStr(strOrCollectionOrElem)) {
    var isCreationStr = /<(\w*)\/?>/.exec(strOrCollectionOrElem);
    // If creation string, create the element
    if (isCreationStr) {
      return [document.createElement(isCreationStr[1])]
    }
    // If not a creation string, let's search for the elements
    return Apheleia.querySelector(strOrCollectionOrElem, ctx)
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
  if (isValidCollection(strOrCollectionOrElem)) {
    return strOrCollectionOrElem
  }

  if (strOrCollectionOrElem != null) {
    throw Error('aph: Invalid first parameter')
  }

  return []
}

var Apheleia = function Apheleia (elems, context, metaObj) {
  this.meta = metaObj || {};

  for (
    var list = aphParseElements(
      elems,
      (this.meta.context = aphParseContext(context)) // Sets current context
    ),
      len = (this.length = list.length); // Sets current length
    len--; // Ends loop when reaches 0
    this[len] = list[len] // Builds the array-like structure
  ){  }
};

// Wrapper for Node methods
Apheleia.prototype.call = function call (fnName) {
  var sum = [];
  var args = slice(arguments, 1);

  this.forEach(function (item, result) {
    if ((result = item[fnName].apply(item, args)) != null) {
      sum.push(result);
    }
  });
  return 0 in sum ? sum : this
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

Apheleia.prototype.map = function map () {
  return Apheleia.flatWrap(arrayProto.map.apply(this, arguments), this)
};

Apheleia.prototype.filter = function filter () {
  return new Apheleia(
    arrayProto.filter.apply(this, arguments),
    this.meta.context,
    { owner: this }
  )
};

Apheleia.prototype.slice = function slice () {
  return new Apheleia(
    arrayProto.slice.apply(this, arguments),
    this.meta.context,
    { owner: this }
  )
};

// Creates a new Apheleia instance with the elements found.
Apheleia.prototype.find = function find (selector) {
  return new Apheleia(selector, this[0], { owner: this })
};

// Gets the specified element or the whole array if no index was defined
Apheleia.prototype.get = function get (index) {
  return +index === index ? this[index] : Apheleia.flatWrap(this)
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
  if (children === undefined) {
    return this.map(function (elem) { return elem.innerHTML; })
  }

  // Manipulating arrays is easier
  if (!Array.isArray(children)) {
    children = [children];
  }

  // If we receive any collections (arrays, lists, aph),
  // we must get its elements
  children = children.reduce(function (acc, item) {
    if (isValidCollection(item)) {
      return acc.concat(slice(item))
    }
    acc.push(item);
    return acc
  }, []);

  // If a callback is received as the second argument
  // let's pass the parent and child nodes
  // and let the callback do all the work
  if (typeof cb === 'function') {
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

// Node property manipulation method
Apheleia.prototype.prop = function prop (objOrKey, nothingOrValue) {
  if (isStr(objOrKey)) {
    return nothingOrValue === undefined
      ? this.map(function (elem) { return elem[objOrKey]; })
      : this.forEach(function (elem) {
        elem[objOrKey] = nothingOrValue;
      })
  }

  return this.forEach(function (elem) {
    for (var key in objOrKey) {
      elem[key] = objOrKey[key];
    }
  })
};

// CSS
Apheleia.prototype.css = function css (objOrKey, nothingOrValue) {
  if (isStr(objOrKey)) {
    return nothingOrValue === undefined
      ? this.map(function (elem) { return window.getComputedStyle(elem)[objOrKey]; })
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

Apheleia.prototype.remove = function remove () {
  return this.forEach(function (elem) {
    elem.parentNode.removeChild(elem);
  })
};

Apheleia.prototype.on = function on (events, cb) {
    var this$1 = this;

  events.split(' ').forEach(function (eventName) { return this$1.addEventListener(eventName, cb); });
  return this
};

Apheleia.prototype.off = function off (events, cb) {
    var this$1 = this;

  events
    .split(' ')
    .forEach(function (eventName) { return this$1.removeEventListener(eventName, cb); });
  return this
};

Apheleia.prototype.once = function once (events, cb) {
  var self = this;
  return self.on(events, function onceFn (e) {
    cb.call(this, e);
    self.off(e.type, onceFn);
  })
};

Apheleia.querySelector = function querySelector (selector, ctx) {
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
};

Apheleia.flatWrap = function flatWrap (what, owner) {
  var acc = [];
  for (var i = 0, item = (void 0); i < what.length; i++) {
    item = what[i];
    if (item instanceof Node || item == null) {
      // If we received a single node
      if (!~acc.indexOf(item)) {
        acc.push(item);
      }
    } else if (
      item instanceof NodeList ||
      item instanceof HTMLCollection ||
      item instanceof Apheleia ||
      item instanceof Array
    ) {
      // If we received a node list/collection
      for (var j = 0, len2 = item.length; j < len2; j++) {
        if (!~acc.indexOf(item[j])) {
          acc.push(item[j]);
        }
      }
    } else {
      var constructorName = what[0].constructor.name;

      what.prop = apheleiaProto.prop;
      what.call = apheleiaProto.call;
      what.owner = owner;

      if (!protoCache[constructorName]) {
        protoCache[constructorName] = Object.getPrototypeOf(what[0]);
      }

      // Let's get all methods of this constructor
      Object.getOwnPropertyNames(protoCache[constructorName]).forEach(function (key) {
        console.log(key);
        if (what[key] === undefined) {
          what[key] = function () {
              var arguments$1 = arguments;

            var result = this.map(function (i) { return protoCache[constructorName][key].apply(i, arguments$1); }
            );
            // Return the Apheleia Owner
            // if the result is a list of undefined
            return result[0] == null && result[result.length - 1] == null
              ? owner
              : result
          };
        }
      });

      if (what.length != null) {
        what.map = apheleiaProto.map;
        what.forEach = what.forEach || apheleiaProto.forEach;
      }

      return what
    }
  }
  return new Apheleia(acc, document, { owner: owner })
};

apheleiaProto = Apheleia.prototype;

// Extending the Array Prototype
var ignoreMethods = [
  'concat',
  'join',
  'copyWithin',
  'fill',
  'reduce',
  'reduceRight' ];

Object.getOwnPropertyNames(arrayProto).forEach(function (key) {
  if (!~ignoreMethods.indexOf(key) && apheleiaProto[key] === undefined) {
    apheleiaProto[key] = arrayProto[key];
  }
});

// Extending default HTMLElement methods and properties
var baseElement = document.createElement('div');
var loop = function ( prop ) {
  if (!apheleiaProto[prop]) {
    if (baseElement[prop] instanceof Function) {
      apheleiaProto[prop] = function () {
        return this.call.apply(this, [prop].concat(slice(arguments)))
      };
    } else {
      Object.defineProperty(apheleiaProto, prop, {
        get: function get () {
          return this.prop(prop)
        },
        set: function set (value) {
          this.prop(prop, value);
        },
      });
    }
  }
};

for (var prop in baseElement) loop( prop );
baseElement = null;

function aph (elems, context, metaObj) {
  return new Apheleia(elems, context, metaObj)
}

// Plugs in new methods to the Apheleia prototype
aph.plug = function (key, fn) {
  Apheleia.prototype[key] = fn;
};

Object.getOwnPropertyNames(Apheleia).forEach(function (prop) {
  if (Apheleia[prop] instanceof Function) {
    aph[prop] = Apheleia[prop];
  }
});

return aph;

})));
