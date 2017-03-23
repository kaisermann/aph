(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('aph', factory) :
	(global.aph = factory());
}(this, (function () { 'use strict';

var Apheleia = function Apheleia (elems, context) {
  this.elements = aphParseElements(elems,
    this.context = aphParseContext(context)
  );
};

// Returns a new Apheleia instance with the filtered elements
Apheleia.prototype.filter = function filter (cb) {
  return new Apheleia(this.elements.filter(cb), this.context)
};

// Creates a new Apheleia instance with the elements found.
Apheleia.prototype.find = function find (selector) {
  return new Apheleia(selector, this.elements[0])
};

// Gets the specified element or the whole array if no index was defined
Apheleia.prototype.get = function get (index) {
  // Type coercion uses less bytes than "index !== undefined"
  return +index === index ? this.elements[index] : this.elements
};

// Iterates through the elements with a 'callback(element, index)''
Apheleia.prototype.each = function each (cb) {
  this.elements.forEach(cb.bind(this));
  return this
};

// Node Data manipulation Methods
Apheleia.prototype.attr = function attr (objOrKey, nothingOrValue, prepend) {
  // If prepend is falsy, it would be an empty string anyway
  prepend = prepend || '';

  if ('' + objOrKey === objOrKey) {
    return (
      nothingOrValue === undefined
        ? this.elements[0].getAttribute(prepend + objOrKey)
        : this.each(function (elem) { return elem.setAttribute(prepend + objOrKey, nothingOrValue); })
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

// Node propertiy manipulation method
Apheleia.prototype.prop = function prop (objOrKey, nothingOrValue) {
  if ('' + objOrKey === objOrKey) {
    return (
      nothingOrValue === undefined
        ? this.elements[0][objOrKey]
        : this.each(function (elem) { elem[objOrKey] = nothingOrValue; })
    )
  }

  return this.each(function (elem) {
    for (var key in objOrKey) {
      elem[key] = objOrKey[key];
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

Apheleia.prototype.addClass = function addClass (/* any number of arguments */) {
    var arguments$1 = arguments;

  return this.each(function (elem) { return elem.classList.add(Array.prototype.slice.call(arguments$1)); }
  )
};

Apheleia.prototype.removeClass = function removeClass (/* any number of arguments */) {
    var arguments$1 = arguments;

  return this.each(function (elem) { return elem.classList.remove(Array.prototype.slice.call(arguments$1)); }
  )
};

Apheleia.prototype.hasClass = function hasClass (className, every) {
  return this.elements[every ? 'every' : 'some'](function (elem) {
    return elem.classList.contains(className)
  })
};

// Wrapper for Node methods
Apheleia.prototype.exec = function exec (fnName/*, any number of arguments */) {
    var arguments$1 = arguments;

  return this.each(function (elem) { return elem[fnName].apply(elem, Array.prototype.slice.call(arguments$1, 1)); }
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

// "Private" Helpers. No need to keep this in the prototype.
var aphParseContext = function (contextOrAttr) {
  return contextOrAttr instanceof Element
    ? contextOrAttr // If already a html element
    : Apheleia.prototype.isPrototypeOf(contextOrAttr)
      ? contextOrAttr.elements[0] // If already apheleia object
      : document // Probably an attribute was passed. Return the document.
};

var aphParseElements = function (stringOrListOrNode, ctx) {
  // If string passed
  // Type coercion uses less bytes than "typeof stringOrListOrNode ==='string'"
  if ('' + stringOrListOrNode === stringOrListOrNode) {
    var isCreationStr = /<(\w*)\/?>/.exec(stringOrListOrNode);
    // If creation string, create the element
    if (isCreationStr) {
      return [document.createElement(isCreationStr[1])]
    }
    // If not a creation string, let's search for the elements
    return /^#[\w-]*$/.test(stringOrListOrNode) // if #id
        ? [window[stringOrListOrNode.slice(1)]]
        : Array.prototype.slice.call(
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
  if (NodeList.prototype.isPrototypeOf(stringOrListOrNode)) {
    return Array.prototype.slice.call(stringOrListOrNode)
  }

  // If array passed, just return
  if (Array.isArray(stringOrListOrNode)) {
    return stringOrListOrNode
  }

  // If another apheleia object is passed, get its elements
  if (Apheleia.prototype.isPrototypeOf(stringOrListOrNode)) {
    return stringOrListOrNode.elements
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
