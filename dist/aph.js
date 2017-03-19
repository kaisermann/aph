(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('aph', factory) :
	(global.aph = factory());
}(this, (function () { 'use strict';

var Apheleia = function Apheleia (elems, contextOrAttr, nothingOrAttrVal) {
  // Second parameter is used as context when a HTML Element is passed
  // Second/Third parameter are used as attribute object/list/pair when creating elements
  this.context = contextOrAttr instanceof Element ? contextOrAttr : document;
  this.elements = this.parseElems(elems);
  this.length = this.elements.length;

  // If second parameter is not an html element and not undefined, we assume it's an attribute obj
  if (!(contextOrAttr instanceof Element) && contextOrAttr) {
    this.attr(contextOrAttr, nothingOrAttrVal);
  }
};

Apheleia.prototype.parseElems = function parseElems (stringOrListOrNode) {
  // If single string
  if ('' + stringOrListOrNode === stringOrListOrNode) {
    var isCreationStr = /<(\w*)\/?>/.exec(stringOrListOrNode);
    // If creation string
    if (isCreationStr) {
      return [document.createElement(isCreationStr[1])]
    }
    // If not a creation string, let's search for the elements
    return Array.prototype.slice.call(this.context.querySelectorAll(stringOrListOrNode))
  }
  // If single node
  if (stringOrListOrNode instanceof Element) {
    return [stringOrListOrNode]
  }
  // If node list
  if (NodeList.prototype.isPrototypeOf(stringOrListOrNode)) {
    return Array.prototype.slice.call(stringOrListOrNode)
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
Apheleia.prototype.each = function each (cb) { return this.elements.forEach(cb) };

// Node Data manipulation Methods
Apheleia.prototype.attr = function attr (objOrKey, nothingOrValue, prepend) {
  // If prepend is falsy, it would be an empty string anyway
  prepend = prepend || '';

  var tmpObj = objOrKey;
  // Is the first parameter a key string?
  if ('' + objOrKey === objOrKey) {
    // If passed only a key, let's return the attribute
    if (nothingOrValue === undefined) {
      return this.elements[0].getAttribute(prepend + objOrKey)
    }
    // If not, let's objectify the key/value pair
    tmpObj = {};
      tmpObj[objOrKey] = nothingOrValue;
  }

  // Finally, let's set the attributes
  this.each(function (elem) { return Object.keys(tmpObj).forEach(function (key) { return elem.setAttribute(prepend + key, tmpObj[key]); }
    ); }
  );
  return this
};

Apheleia.prototype.prop = function prop (objOrKey, nothingOrValue) {
  var tmpObj = objOrKey;
  // Is the first parameter a key string?
  if ('' + objOrKey === objOrKey) {
    // If passed only a key, let's return the property
    if (nothingOrValue === undefined) {
      return this.elements[0][objOrKey]
    }
    // If not, let's objectify the key/value pair
    tmpObj = {};
      tmpObj[objOrKey] = nothingOrValue;
  }

  // Finally, let's set the properties
  this.each(function (elem) { return Object.keys(tmpObj).forEach(function (key) {
      elem[key] = tmpObj[key];
    }); }
  );
  return this
};

Apheleia.prototype.data = function data (objOrKey, nothingOrValue) {
  return this.attr(objOrKey, nothingOrValue, 'data-')
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
  appendTo: function appendTo (element, newParent) {
    newParent.appendChild(element);
  },
  prependTo: function prependTo (element, newParent) {
    newParent.insertBefore(element, newParent.firstChild);
  },
  delete: function delete$1 (element) {
    element.parentNode.removeChild(element);
  },
  // Class methods
  toggleClass: function toggleClass (element, className) {
    element.classList.toggle(className);
  },
  addClass: function addClass (element) {
    element.classList.add(Array.prototype.slice.call(arguments, 1));
  },
  removeClass: function removeClass (element) {
    element.classList.remove(Array.prototype.slice.call(arguments, 1));
  },
  // Wrapper for Node methods
  exec: function exec (element, fnName) {
    element[fnName].apply(element, Array.prototype.slice.call(arguments, 2));
  },
  on: function on (element, events, cb) {
    events.split(' ').forEach(function (eventName) { return element.addEventListener(eventName, cb); });
  },
  off: function off (element, events, cb) {
    events.split(' ').forEach(function (eventName) { return element.removeEventListener(eventName, cb); });
  },
  once: function once (element, events, cb) {
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

    this.each(function (elem) { return collectionChain[key].apply(
        this$1,
        [elem].concat(Array.prototype.slice.call(arguments$1))
      ); }
    );
    return this
  };
});

function aph (elems, contextOrAttrKey, nothingOrAttrVal) {
  return new Apheleia(elems, contextOrAttrKey, nothingOrAttrVal)
}

// Plugs in new methods to the Apheleia prototype
aph.plug = function (key, fn) { Apheleia.prototype[key] = fn; };

// querySelector shortcut
aph.find = function (str, ctx) { return (ctx || document).querySelector(str); };

// querySelectorAll shortcut
aph.findAll = function (str, ctx) { return (ctx || document).querySelectorAll(str); };

return aph;

})));
