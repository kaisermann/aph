import { protoCache, flatWrap } from './shared.js'
import {
  propGetSetWithProp,
  isStr,
  isArrayLike,
  isRelevantCollection,
  slice,
  aphParseContext,
  aphParseElements,
} from './helpers.js'

const arrayProto = protoCache.Array

class Apheleia {
  constructor (elems, context, metaObj) {
    this.meta = metaObj || {}

    for (
      let list = aphParseElements(
        elems,
        (this.meta.context = aphParseContext(context)) // Sets current context
      ),
        len = (this.length = list.length); // Sets current length
      len--; // Ends loop when reaches 0
      this[len] = list[len] // Builds the array-like structure
    );
  }

  // Wrapper for Node methods
  call (fnName) {
    const args = slice(arguments, 1)
    const sum = this.map(item => item[fnName].apply(item, args))
    return isRelevantCollection(sum) ? sum : this
  }

  // Iterates through the elements with a 'callback(element, index)''
  forEach (cb) {
    // Iterates through the Apheleia object.
    // If the callback returns false, the iteration stops.
    for (
      let i = 0, len = this.length;
      i < len && cb.call(this, this[i], i++) !== false;

    );
    return this
  }

  map () {
    return flatWrap(arrayProto.map.apply(this, arguments), this)
  }

  filter () {
    return new Apheleia(
      arrayProto.filter.apply(this, arguments),
      this.meta.context,
      { owner: this }
    )
  }

  slice () {
    return new Apheleia(
      arrayProto.slice.apply(this, arguments),
      this.meta.context,
      { owner: this }
    )
  }

  // Creates a new Apheleia instance with the elements found.
  find (selector) {
    return new Apheleia(selector, this[0], { owner: this })
  }

  // Gets the specified element or the whole array if no index was defined
  get (index) {
    return +index === index ? this[index] : flatWrap(this)
  }

  // Node property manipulation method
  prop (objOrKey, nothingOrValue) {
    if (isStr(objOrKey)) {
      return nothingOrValue == null
        ? this.map(elem => elem[objOrKey])
        : this.forEach(function (elem) {
          elem[objOrKey] = nothingOrValue
        })
    }

    return this.forEach(function (elem) {
      for (const key in objOrKey) {
        elem[key] = objOrKey[key]
      }
    })
  }

  // CSS
  css (objOrKey, nothingOrValue) {
    if (isStr(objOrKey)) {
      return nothingOrValue == null
        ? this.map(elem => getComputedStyle(elem)[objOrKey])
        : this.forEach(function (elem) {
          elem.style[objOrKey] = nothingOrValue
        })
    }

    return this.forEach(function (elem) {
      for (const key in objOrKey) {
        elem.style[key] = objOrKey[key]
      }
    })
  }

  remove () {
    return this.forEach(function (elem) {
      elem.parentNode.removeChild(elem)
    })
  }

  // Appends the passed html/aph
  append (futureContent) {
    return this.html(futureContent, function (parent, child) {
      parent.appendChild(child)
    })
  }

  appendTo (newParent) {
    new Apheleia(newParent).append(this)
    return this
  }

  // Prepends the passed html/aph
  prepend (futureContent) {
    return this.html(futureContent, function (parent, child) {
      parent.insertBefore(child, parent.firstChild)
    })
  }

  prependTo (newParent) {
    new Apheleia(newParent).prepend(this)
    return this
  }

  // Sets or gets the html
  html (children, cb) {
    // If there're no arguments
    // Let's return the html of the first element
    if (children == null) {
      return this.map(elem => elem.innerHTML)
    }

    // Manipulating arrays is easier
    if (!Array.isArray(children)) {
      children = [children]
    }

    // If we receive any collections (arrays, lists, aph),
    // we must get its elements
    children = children.reduce((acc, item) => {
      if (isArrayLike(item)) {
        return acc.concat(slice(item))
      }
      acc.push(item)
      return acc
    }, [])

    // If a callback is received as the second argument
    // let's pass the parent and child nodes
    // and let the callback do all the work
    if (cb instanceof Function) {
      return this.forEach(parent =>
        children.forEach(child => cb(parent, child))
      )
    }

    // If the second argument is not a valid callback,
    // we will rewrite all parents HTML
    return this.forEach(parent => {
      parent.innerHTML = ''
      children.forEach(child => {
        parent.innerHTML += isStr(child) ? child : child.outerHTML
      })
    })
  }
}

// Let's cache the prototype
protoCache.Apheleia = Apheleia.prototype

// Extending the Array Prototype
const ignoreMethods = [
  'concat',
  'join',
  'copyWithin',
  'fill',
  'reduce',
  'reduceRight',
]

Object.getOwnPropertyNames(arrayProto).forEach(key => {
  if (!~ignoreMethods.indexOf(key) && protoCache.Apheleia[key] == null) {
    protoCache.Apheleia[key] = arrayProto[key]
  }
})

// Extending default HTMLElement methods and properties
let baseElement = document.createElement('div')
function extendElementProp (prop) {
  if (!protoCache.Apheleia[prop]) {
    if (baseElement[prop] instanceof Function) {
      protoCache.Apheleia[prop] = function () {
        return this.call.apply(this, [prop].concat(slice(arguments)))
      }
    } else {
      propGetSetWithProp(protoCache.Apheleia, prop)
    }
  }
}

for (const prop in baseElement) {
  extendElementProp(prop)
}
baseElement = null

export default Apheleia
