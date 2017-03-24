(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('aph', factory) :
	(global.aph = factory());
}(this, (function () { 'use strict';

// Type coercion uses less bytes than "typeof str ==='string'"
var isString = function (str) { return '' + str === str; };
var arrProto = Array.prototype;

var Apheleia = function Apheleia (elems, context) {
  for (
    var list = aphParseElements(
      elems,
      this.context = aphParseContext(context) // Sets current context
    ), len = this.length = list.length; // Sets current length
    len--; // Ends loop when reaches 0
    this[len] = list[len] // Builds the array-like structure
  ){  }
};

// Returns a new Apheleia instance with the filtered elements
Apheleia.prototype.filter = function filter (cb) {
  return new Apheleia(arrProto.filter.call(this, cb), this.context)
};

// Creates a new Apheleia instance with the elements found.
Apheleia.prototype.find = function find (selector) {
  return new Apheleia(selector, this[0])
};

// Gets the specified element or the whole array if no index was defined
Apheleia.prototype.get = function get (index) {
  return +index === index
    ? this[index]
    : arrProto.slice.call(this)
};

// Iterates through the elements with a 'callback(element, index)''
Apheleia.prototype.each = function each (cb) {
  for (var i = 0; i < this.length && cb.call(this, this[i], i++) !== false;){  }
  return this
};

// Node Data manipulation Methods
Apheleia.prototype.attr = function attr (objOrKey, nothingOrValue, prepend) {
  // If prepend is falsy, it would be an empty string anyway
  prepend = prepend || '';

  if (isString(objOrKey)) {
    return (
      1 in arguments // if value passed
        ? this.each(function (elem) { return elem.setAttribute(prepend + objOrKey, nothingOrValue); })
        : this[0].getAttribute(prepend + objOrKey)
    )
  }

  return this.each(function (elem) {
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
  if (isString(objOrKey)) {
    return (
      1 in arguments // if value passed
        ? this.each(function (elem) { elem[objOrKey] = nothingOrValue; })
        : this[0][objOrKey]
    )
  }

  return this.each(function (elem) {
    for (var key in objOrKey) {
      elem[key] = objOrKey[key];
    }
  })
};

// CSS
Apheleia.prototype.css = function css (objOrKey, nothingOrValue) {
  if (isString(objOrKey)) {
    return (
      1 in arguments // if value passed
        ? this.each(function (elem) { elem.style[objOrKey] = nothingOrValue; })
        : window.getComputedStyle(this[0])[objOrKey]
    )
  }

  return this.each(function (elem) {
    for (var key in objOrKey) {
      elem.style[key] = objOrKey[key];
    }
  })
};

Apheleia.prototype.appendTo = function appendTo (newParent) {
  return this.each(function (elem) { return newParent.appendChild(elem); })
};

Apheleia.prototype.prependTo = function prependTo (newParent) {
  return this.each(function (elem) { return newParent.insertBefore(elem, newParent.firstChild); })
};

Apheleia.prototype.delete = function delete$1 () {
  return this.each(function (elem) { return elem.parentNode.removeChild(elem); })
};

// Class methods
Apheleia.prototype.toggleClass = function toggleClass (className) {
  return this.each(function (elem) { return elem.classList.toggle(className); })
};

Apheleia.prototype.addClass = function addClass (stringOrArray) {
  return this.each(function (elem) { return isString(stringOrArray)
      ? elem.classList.add(stringOrArray)
      : elem.classList.add.apply(elem.classList, stringOrArray); }
  )
};

Apheleia.prototype.removeClass = function removeClass (stringOrArray) {
  return this.each(function (elem) { return isString(stringOrArray)
      ? elem.classList.remove(stringOrArray)
      : elem.classList.remove.apply(elem.classList, stringOrArray); }
  )
};

Apheleia.prototype.hasClass = function hasClass (className, every) {
  return arrProto[every ? 'every' : 'some'].call(this, function (elem) { return elem.classList.contains(className); }
  )
};

// Wrapper for Node methods
Apheleia.prototype.exec = function exec (fnName, args) {
  return this.each(function (elem) { return elem[fnName].apply(elem, args); }
  )
};

Apheleia.prototype.on = function on (events, cb) {
  return this.each(function (elem) { return events.split(' ').forEach(function (eventName) { return elem.addEventListener(eventName, cb); }
    ); }
  )
};

Apheleia.prototype.off = function off (events, cb) {
  return this.each(function (elem) { return events.split(' ').forEach(function (eventName) { return elem.removeEventListener(eventName, cb); }
    ); }
  )
};

Apheleia.prototype.once = function once (events, cb) {
    var this$1 = this;

  var onceFn = function (e) { return (cb(e) || this$1.off(e.type, onceFn)); };
  return this.on(events, onceFn)
};

// Parses the passed context
var aphParseContext = function (contextOrAttr) {
  return contextOrAttr instanceof Element
    ? contextOrAttr // If already a html element
    : Apheleia.prototype.isPrototypeOf(contextOrAttr)
      ? contextOrAttr[0] // If already apheleia object
      : document // Probably an attribute was passed. Return the document.
};

// Parses the elements passed to aph()
var aphParseElements = function (stringOrListOrNode, ctx) {
  // If string passed
  if (isString(stringOrListOrNode)) {
    var isCreationStr = /<(\w*)\/?>/.exec(stringOrListOrNode);
    // If creation string, create the element
    if (isCreationStr) {
      return [document.createElement(isCreationStr[1])]
    }
    // If not a creation string, let's search for the elements
    return /^#[\w-]*$/.test(stringOrListOrNode) // if #id
        ? [window[stringOrListOrNode.slice(1)]]
        : arrProto.slice.call(
            /^\.[\w-]*$/.test(stringOrListOrNode) // if .class
              ? ctx.getElementsByClassName(stringOrListOrNode.slice(1))
              : /^\w+$/.test(stringOrListOrNode) // if singlet (a, span, div, ...)
                ? ctx.getElementsByTagName(stringOrListOrNode)
                : ctx.querySelectorAll(stringOrListOrNode) // anything else
          )
  }
  // If html element passed
  if (stringOrListOrNode instanceof Element) {
    return [stringOrListOrNode]
  }

  // If node list passed
  // If another apheleia object is passed, get its elements
  if (
    NodeList.prototype.isPrototypeOf(stringOrListOrNode) ||
    Apheleia.prototype.isPrototypeOf(stringOrListOrNode)) {
    return arrProto.slice.call(stringOrListOrNode)
  }

  // If array passed, just return
  if (Array.isArray(stringOrListOrNode)) {
    return stringOrListOrNode
  }

  return []
};

function aph (elems, context) {
  return new Apheleia(elems, context)
}

// Plugs in new methods to the Apheleia prototype
aph.plug = function (key, fn) { Apheleia.prototype[key] = fn; };

return aph;

})));
