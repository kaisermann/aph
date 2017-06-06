(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('aph', factory) :
	(global.aph = factory());
}(this, (function () { 'use strict';

var arrProto = Array.prototype;
var baseElement = document.createElement('div');

function slice (what, from) {
  return arrProto.slice.call(what, from || 0)
}

// Check if what's passed is a string
function isStr (maybeStr) {
  return '' + maybeStr === maybeStr
}

// Queries a selector (smartly)
function smartQuerySelectorAll (selector, context) {
  return /^#[\w-]*$/.test(selector) // if #id
    ? [window[selector.slice(1)]]
    : slice(
        /^\.[\w-]*$/.test(selector) // if .class
          ? context.getElementsByClassName(selector.slice(1))
          : /^\w+$/.test(selector) // if tag (a, span, div, ...)
              ? context.getElementsByTagName(selector)
              : context.querySelectorAll(selector) // anything else
      )
}

// Parses the passed context
function aphParseContext (elemOrAphOrStr) {
  return elemOrAphOrStr instanceof Element
    ? elemOrAphOrStr // If already a html element
    : isStr(elemOrAphOrStr)
        ? smartQuerySelectorAll(elemOrAphOrStr, document)[0] // If string passed let's search for the element on the DOM
        : elemOrAphOrStr && elemOrAphOrStr.length
            ? elemOrAphOrStr[0] // If already an collection
            : document // Return the document.
}

// Parses the elements passed to aph()
function aphParseElements (strOrArrayOrAphOrElem, ctx) {
  // If string passed
  if (isStr(strOrArrayOrAphOrElem)) {
    var isCreationStr = /<(\w*)\/?>/.exec(strOrArrayOrAphOrElem);
    // If creation string, create the element
    if (isCreationStr) {
      return [document.createElement(isCreationStr[1])]
    }
    // If not a creation string, let's search for the elements
    return smartQuerySelectorAll(strOrArrayOrAphOrElem, ctx)
  }

  // If html element / window / document passed
  if (
    strOrArrayOrAphOrElem instanceof Element ||
    strOrArrayOrAphOrElem === window ||
    strOrArrayOrAphOrElem === document
  ) {
    return [strOrArrayOrAphOrElem]
  }

  // If array passed, just return
  if (Array.isArray(strOrArrayOrAphOrElem)) {
    return strOrArrayOrAphOrElem
  }

  // If collection passed and
  // is not a string (first if, up there) and
  // is not an array
  if (strOrArrayOrAphOrElem && strOrArrayOrAphOrElem.length) {
    return slice(strOrArrayOrAphOrElem)
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

// Iterates through the elements with a 'callback(element, index)''
Apheleia.prototype.forEach = function forEach (cb) {
  // Iterates through the Apheleia object.
  // If the callback returns false, the iteration stops.
  for (var i = 0; i < this.length && cb.call(this, this[i], i++) !== false;){  }
  return this
};

Apheleia.prototype.concat = function concat () {
    var arguments$1 = arguments;

  var sum = this.get();
  for (var i = 0, l = arguments.length; i < l; i++) {
    var arg = arguments$1[i];
    if (arg instanceof Node) { sum.push(arg); }
    else if (arg && !isStr(arg) && arg.length) {
      for (var j = 0, k = arg.length; j < k; j++) {
        if (sum.indexOf(arg[j]) < 0) {
          sum.push(arg[j]);
        }
      }
    }
  }

  return new Apheleia(sum, this.meta.context, { parent: this })
};

// Creates a new Apheleia instance with the elements found.
Apheleia.prototype.find = function find (selector) {
  return new Apheleia(selector, this[0], { parent: this })
};

// Gets the specified element or the whole array if no index was defined
Apheleia.prototype.get = function get (index) {
  return +index === index ? this[index] : slice(this)
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
Apheleia.prototype.html = function html (futureChildren, cb) {
  // If there're no arguments
  // Let's return the html of the first element
  if (futureChildren === undefined) {
    return this[0].innerHTML
  }

  // Manipulating arrays is easier
  if (!Array.isArray(futureChildren)) {
    futureChildren = [futureChildren];
  }

  // If we receive any collections (arrays, lists, aph),
  // we must get its elements
  futureChildren = futureChildren.reduce(function (acc, item) {
    // If a .length is found and it's not a string,
    // we assume it's a standard indexed collection
    if (!isStr(item) && item.length) {
      return acc.concat(slice(item))
    }
    acc.push(item);
    return acc
  }, []);

  // If a callback is received as the second argument
  // let's pass the parent and child nodes
  // and let the callback do all the work
  if (typeof cb === 'function') {
    return this.forEach(function (futureParent) { return futureChildren.forEach(function (futureChild) { return cb(futureParent, futureChild); }); }
    )
  }

  // If the second argument is not a valid callback,
  // we will rewrite all parents HTML
  return this.forEach(function (futureParent) {
    futureParent.innerHTML = '';
    futureChildren.forEach(function (futureChild) {
      futureParent.innerHTML += isStr(futureChild)
        ? futureChild
        : futureChild.outerHTML;
    });
  })
};

// Node Data manipulation Methods
Apheleia.prototype.attr = function attr (objOrKey, nothingOrValue, prepend) {
  // If prepend is falsy, it would be an empty string anyway
  prepend = prepend || '';

  if (isStr(objOrKey)) {
    return nothingOrValue === undefined
      ? this.map(function (elem) { return elem.getAttribute(prepend + objOrKey); })
      : this.forEach(function (elem) {
        elem.setAttribute(prepend + objOrKey, nothingOrValue);
      })
  }

  return this.forEach(function (elem) {
    for (var key in objOrKey) {
      elem.setAttribute(prepend + key, objOrKey[key]);
    }
  })
};

Apheleia.prototype.data = function data (objOrKey, nothingOrValue) {
  return this.attr(objOrKey, nothingOrValue, 'data-')
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
  return this.forEach(function (elem) { return elem.parentNode.removeChild(elem); })
};

// Class methods
Apheleia.prototype.toggleClass = function toggleClass (className) {
  return this.forEach(function (elem) { return elem.classList.toggle(className); })
};

Apheleia.prototype.addClass = function addClass (stringOrArray) {
  return this.forEach(function (elem) {
    isStr(stringOrArray)
      ? elem.classList.add(stringOrArray)
      : elem.classList.add.apply(elem.classList, stringOrArray);
  })
};

Apheleia.prototype.removeClass = function removeClass (stringOrArray) {
  return this.forEach(function (elem) {
    isStr(stringOrArray)
      ? elem.classList.remove(stringOrArray)
      : elem.classList.remove.apply(elem.classList, stringOrArray);
  })
};

Apheleia.prototype.hasClass = function hasClass (className, every) {
  return this[every ? 'every' : 'some'](function (elem) { return elem.classList.contains(className); }
  )
};

// Wrapper for Node methods
Apheleia.prototype.call = function call (fnName) {
  var sum = [];
  var args = slice(arguments, 1);

  this.forEach(function (elem) {
    var result = elem[fnName].apply(elem, args);
    if (result !== undefined) {
      sum.push(result);
    }
  });
  return sum.length ? sum : this
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

var newCollectionMethods = ['filter', 'map', 'slice'];
var ignoreMethods = ['join', 'copyWithin', 'fill'].concat(
  newCollectionMethods
);

// Extending array prototype (methods that do not return a new collection)
Object.getOwnPropertyNames(arrProto).forEach(function (key) {
  if (
    ignoreMethods.indexOf(key) === -1 &&
    Apheleia.prototype[key] === undefined
  ) {
    Apheleia.prototype[key] = arrProto[key];
  }
});

// Extending array prototype (methods that return new colletions)
newCollectionMethods.forEach(function (method) {
  Apheleia.prototype[method] = function () {
    return new Apheleia(
      arrProto[method].apply(this, arguments),
      this.meta.context,
      {
        parent: this,
      }
    )
  };
});

function buildSettersAndGetters (prop) {
  if (!Apheleia.prototype[prop]) {
    if (baseElement[prop] instanceof Function) {
      Apheleia.prototype[prop] = function () {
        return this.call.apply(this, [prop].concat(slice(arguments)))
      };
    } else {
      Object.defineProperty(Apheleia.prototype, prop, {
        get: function get () {
          return this.prop(prop)
        },
        set: function set (value) {
          this.prop(prop, value);
        },
      });
    }
  }
}

for (var prop in baseElement) {
  buildSettersAndGetters(prop);
}
baseElement = null;

function aph (elems, context, metaObj) {
  return new Apheleia(elems, context, metaObj)
}

// Plugs in new methods to the Apheleia prototype
aph.plug = function (key, fn) {
  Apheleia.prototype[key] = fn;
};

return aph;

})));
