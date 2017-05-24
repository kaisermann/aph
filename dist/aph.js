(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('aph', factory) :
	(global.aph = factory());
}(this, (function () { 'use strict';

var arrProto = Array.prototype;

// Check if what's passed is a string
function isStr (maybeStr) {
  return '' + maybeStr === maybeStr
}

// If what's passed is a apheleia object, return its first element.
// If not, return the argument itself
function parseElementArg (elemOrAph) {
  return Apheleia.prototype.isPrototypeOf(elemOrAph) ? elemOrAph[0] : elemOrAph
}

// Parses the passed context
function aphParseContext (elemOrAphOrStr) {
  return elemOrAphOrStr instanceof Element
    ? elemOrAphOrStr // If already a html element
    : Apheleia.prototype.isPrototypeOf(elemOrAphOrStr)
        ? elemOrAphOrStr[0] // If already an apheleia object
        : isStr(elemOrAphOrStr)
            ? document.querySelector(elemOrAphOrStr) // If string passed let's search for the element on the DOM
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
    return /^#[\w-]*$/.test(strOrArrayOrAphOrElem) // if #id
      ? [window[strOrArrayOrAphOrElem.slice(1)]]
      : arrProto.slice.call(
          /^\.[\w-]*$/.test(strOrArrayOrAphOrElem) // if .class
            ? ctx.getElementsByClassName(strOrArrayOrAphOrElem.slice(1))
            : /^\w+$/.test(strOrArrayOrAphOrElem) // if tag (a, span, div, ...)
                ? ctx.getElementsByTagName(strOrArrayOrAphOrElem)
                : ctx.querySelectorAll(strOrArrayOrAphOrElem) // anything else
        )
  }

  // If html element passed
  if (strOrArrayOrAphOrElem instanceof Element) {
    return [strOrArrayOrAphOrElem]
  }

  // If node list passed
  // If another apheleia object is passed, get its elements
  if (
    NodeList.prototype.isPrototypeOf(strOrArrayOrAphOrElem) ||
    Apheleia.prototype.isPrototypeOf(strOrArrayOrAphOrElem)
  ) {
    return arrProto.slice.call(strOrArrayOrAphOrElem)
  }

  // If array passed, just return
  if (Array.isArray(strOrArrayOrAphOrElem)) {
    return strOrArrayOrAphOrElem
  }

  return []
}

var Apheleia = function Apheleia (elems, context, aphParentInstance) {
  this.aphParent = aphParentInstance;
  for (
    var list = aphParseElements(
      elems,
      (this.context = aphParseContext(context)) // Sets current context
    ),
      len = (this.length = list.length); // Sets current length
    len--; // Ends loop when reaches 0
    this[len] = list[len] // Builds the array-like structure
  ){  }
};

// Iterates through the elements with a 'callback(element, index)''
Apheleia.prototype.each = function each (cb) {
  // Iterates through the Apheleia object.
  // If the callback returns false, the iteration stops.
  for (var i = 0; i < this.length && cb.call(this, this[i], i++) !== false;){  }
  return this
};

// Returns a new Apheleia instance with the filtered elements
Apheleia.prototype.filter = function filter (cb) {
  return new Apheleia(arrProto.filter.call(this, cb), this.context, this)
};

// Returns a new Apheleia instance with a portion of the original collection
Apheleia.prototype.slice = function slice (min, max) {
  return new Apheleia(arrProto.slice.call(this, min, max), this.context, this)
};

// Creates a new Apheleia instance with the elements found.
Apheleia.prototype.find = function find (selector) {
  return new Apheleia(selector, this[0], this)
};

// Gets the specified element or the whole array if no index was defined
Apheleia.prototype.get = function get (index) {
  return +index === index ? this[index] : arrProto.slice.call(this)
};

// Appends the passed html/aph
Apheleia.prototype.append = function append (futureContent) {
  return this.html(futureContent, function (parent, child) { return parent.appendChild(child); }
  )
};

Apheleia.prototype.appendTo = function appendTo (newParent) {
  new Apheleia(newParent).append(this);
  return this
};

// Prepends the passed html/aph
Apheleia.prototype.prepend = function prepend (futureContent) {
  return this.html(futureContent, function (parent, child) { return parent.insertBefore(child, parent.firstChild); }
  )
};

Apheleia.prototype.prependTo = function prependTo (newParent) {
  new Apheleia(newParent).prepend(this);
  return this
};

// Sets or gets the html
Apheleia.prototype.html = function html (futureHTML, cb) {
  if (futureHTML === undefined) { return this[0].innerHTML }

  // If an aph obj was passed, let's get its elements
  if (Apheleia.prototype.isPrototypeOf(futureHTML)) {
    futureHTML = futureHTML.get();
  } else if (!Array.isArray(futureHTML)) {
    futureHTML = [futureHTML];
  }

  // If a callback is received as the second argument
  // let's pass the parent and child nodes
  // and let the callback do all the work
  if (typeof cb === 'function') {
    return this.each(function (futureParent) { return futureHTML.forEach(function (futureChild) { return cb(futureParent, parseElementArg(futureChild)); }
      ); }
    )
  }

  // If the second argument is not a valid callback,
  // we must rewrite all of a parents HTML
  return this.each(function (futureParent) {
    futureParent.innerHTML = '';
    futureHTML.forEach(
      function (futureChild) { return (futureParent.innerHTML += parseElementArg(futureChild)); }
    );
  })
};

// Node Data manipulation Methods
Apheleia.prototype.attr = function attr (objOrKey, nothingOrValue, prepend) {
  // If prepend is falsy, it would be an empty string anyway
  prepend = prepend || '';

  if (isStr(objOrKey)) {
    return nothingOrValue === undefined
      ? this[0].getAttribute(prepend + objOrKey)
      : this.each(function (elem) { return elem.setAttribute(prepend + objOrKey, nothingOrValue); }
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
  if (isStr(objOrKey)) {
    return nothingOrValue === undefined
      ? this[0][objOrKey]
      : this.each(function (elem) {
        elem[objOrKey] = nothingOrValue;
      })
  }

  return this.each(function (elem) {
    for (var key in objOrKey) {
      elem[key] = objOrKey[key];
    }
  })
};

// CSS
Apheleia.prototype.css = function css (objOrKey, nothingOrValue) {
  if (isStr(objOrKey)) {
    return nothingOrValue === undefined
      ? window.getComputedStyle(this[0])[objOrKey]
      : this.each(function (elem) {
        elem.style[objOrKey] = nothingOrValue;
      })
  }

  return this.each(function (elem) {
    for (var key in objOrKey) {
      elem.style[key] = objOrKey[key];
    }
  })
};

Apheleia.prototype.delete = function delete$1 () {
  return this.each(function (elem) { return elem.parentNode.removeChild(elem); })
};

// Class methods
Apheleia.prototype.toggleClass = function toggleClass (className) {
  return this.each(function (elem) { return elem.classList.toggle(className); })
};

Apheleia.prototype.addClass = function addClass (stringOrArray) {
  return this.each(
    function (elem) { return isStr(stringOrArray)
        ? elem.classList.add(stringOrArray)
        : elem.classList.add.apply(elem.classList, stringOrArray); }
  )
};

Apheleia.prototype.removeClass = function removeClass (stringOrArray) {
  return this.each(
    function (elem) { return isStr(stringOrArray)
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
  return this.each(function (elem) { return elem[fnName].apply(elem, args); })
};

Apheleia.prototype.on = function on (events, cb) {
  return this.each(function (elem) { return events
      .split(' ')
      .forEach(function (eventName) { return elem.addEventListener(eventName, cb); }); }
  )
};

Apheleia.prototype.off = function off (events, cb) {
  return this.each(function (elem) { return events
      .split(' ')
      .forEach(function (eventName) { return elem.removeEventListener(eventName, cb); }); }
  )
};

Apheleia.prototype.once = function once (events, cb) {
  var self = this;
  return self.on(events, function onceFn (e) {
    cb.call(this, e);
    self.off(e.type, onceFn);
  })
};

function aph (elems, context) {
  return new Apheleia(elems, context)
}

// Plugs in new methods to the Apheleia prototype
aph.plug = function (key, fn) {
  Apheleia.prototype[key] = fn;
};

// Executes a especified callback when the DOM is loaded
aph.onDOMLoaded = function (cb) {
  if (
    document.readyState === 'complete' ||
    (document.readyState !== 'loading' && !document.documentElement.doScroll)
  ) {
    cb();
  } else {
    document.addEventListener('DOMContentLoaded', function () { return cb(); }, false);
  }
};

return aph;

})));
