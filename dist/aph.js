(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('aph', factory) :
	(global.aph = factory());
}(this, (function () { 'use strict';

var slice = Array.prototype.slice;

var Apheleia = function Apheleia (elems, contextOrAttr, nothingOrAttrVal) {
  // Second parameter is used as context when a HTML Element is passed
  // Second/Third parameter are used as attribute object/list/pair when creating nodes
  this.context = contextOrAttr instanceof Element ? contextOrAttr : document;
  this.elements = this.parseArgs(elems);
  this.length = this.elements.length;

  // If second parameter is not an html element and not undefined, we assume it's an attribute obj
  if (!(contextOrAttr instanceof Element) && contextOrAttr) {
    this.attr(contextOrAttr, nothingOrAttrVal);
  }
};
Apheleia.prototype.parseArgs = function parseArgs (stringOrListOrNode) {
  // If single string
  if (typeof stringOrListOrNode === 'string') {
    var isCreationStr = /<(\w*)\/?>/.exec(stringOrListOrNode);
    // If creation string
    if (isCreationStr) { return [document.createElement(isCreationStr[1])] }
    // If not a creation string, let's search for the elements
    return slice.call(this.context.querySelectorAll(stringOrListOrNode))
  }
  // If single node
  if (stringOrListOrNode instanceof Element) {
    return [stringOrListOrNode]
  }
  // If node list
  if (NodeList.prototype.isPrototypeOf(stringOrListOrNode)) {
    return slice.call(stringOrListOrNode)
  }
  // If array, we're done
  if (Array.isArray(stringOrListOrNode)) {
    return stringOrListOrNode
  }
  return []
};
Apheleia.prototype.get = function get (index) {
  return index !== undefined ? this.elements[index] : this.elements
};
// Iterates through the elements with a 'callback(element, index)''
// The this is attached to the element itself
Apheleia.prototype.each = function each (cb) {
  return this.elements.forEach(function (elem, index) { return cb.call(elem, elem, index); })
};
// Node Data manipulation Methods
Apheleia.prototype.attr = function attr (objOrKey, nothingOrValue, prepend) {
    var this$1 = this;

  prepend = prepend || '';
  // If passed only a key, let's return the attribute
  if (typeof objOrKey === 'string' && nothingOrValue === undefined) {
    return this.elements[0].getAttribute(prepend + objOrKey)
  }
  // If not, let's see what was passed
  objOrKey = objectifyTuple(objOrKey, nothingOrValue);

  // Finally, let's set the attributes
  Object.keys(objOrKey).forEach(function (key) { return this$1.elements.forEach(function (elem) { return elem.setAttribute(prepend + key, objOrKey[key]); }
    ); }
  );
  return this
};
Apheleia.prototype.data = function data (objOrKey, nothingOrValue) {
  return this.attr(objOrKey, nothingOrValue, 'data-')
};
Apheleia.prototype.prop = function prop (objOrKey, nothingOrValue) {
    var this$1 = this;

  // If passed only a key, let's return the property
  if (typeof objOrKey === 'string' && nothingOrValue === undefined) {
    return this.elements[0][objOrKey]
  }

  objOrKey = objectifyTuple(objOrKey, nothingOrValue);

  Object.keys(objOrKey).forEach(function (key) { return this$1.elements.forEach(function (elem) { return (elem[key] = objOrKey[key]); }
    ); }
  );
  return this
};
Apheleia.prototype.filter = function filter (cb) {
  return new Apheleia(this.elements.filter(function (elem) { return cb(elem); }))
};

Apheleia.prototype.hasClass = function hasClass (className, every) {
  return this.elements[every ? 'every' : 'some'](function (elem) { return elem.classList.contains(className); })
};

// Wrapper for main chainable methods.
var collectionChain = {
  // DOM Manipulation Methods
  appendTo: function appendTo (node, newParent) {
    newParent.appendChild(node);
  },
  prependTo: function prependTo (node, newParent) {
    newParent.insertBefore(node, newParent.firstChild);
  },
  delete: function delete$1 (node) {
    node.parentNode.removeChild(node);
  },
  // Class methods
  toggleClass: function toggleClass (node, className) {
    node.classList.toggle(className);
  },
  addClass: function addClass (node) {
    node.classList.add(slice.call(arguments, 1));
  },
  removeClass: function removeClass (node) {
    node.classList.remove(slice.call(arguments, 1));
  },
  // Wrapper for Node methods
  exec: function exec (node, fnName) {
    node[fnName].apply(node, slice.call(arguments, 2));
  },
  on: function on (node, events, cb) {
    events.split(' ').forEach(function (eventName) { return node.addEventListener(eventName, cb); });
  },
  off: function off (node, events, cb) {
    events.split(' ').forEach(function (eventName) { return node.removeEventListener(eventName, cb); });
  },
  once: function once (node, events, cb) {
    var this$1 = this;

    var onceFn = function (e) { return (cb(e) || this$1.off(e.type, onceFn)); };
    this.on(events, onceFn);
  },
};

// Wraps the default chainable methods with the elements loop and 'return this'
Object.keys(collectionChain).forEach(function (key) {
  Apheleia.prototype[key] = function () {
    var arguments$1 = arguments;
    var this$1 = this;

    this.elements.forEach(function (elem) { return collectionChain[key].apply(this$1, [elem].concat(slice.call(arguments$1))); }
    );
    return this
  };
});

// Helpers
var objectifyTuple = function (objOrKey, nothingOrValue) { return typeof objOrKey === 'string'
  ? ( obj = {}, obj[objOrKey] = nothingOrValue, obj )
  : (objOrKey || {})
    var obj; };

function aph (elems, contextOrAttrKey, nothingOrAttrVal) {
  return new Apheleia(elems, contextOrAttrKey, nothingOrAttrVal)
}
aph.fn = Apheleia.prototype;

// Plugs in new methods to the aph() prototype
aph.plug = function (key, fn) { aph.fn[key] = fn; };
// querySelector shortcut
aph.find = function (str, ctx) { return (ctx || document).querySelector(str); };
// querySelectorAll shortcut
aph.findAll = function (str, ctx) { return (ctx || document).querySelectorAll(str); };

// Helpers

return aph;

})));
