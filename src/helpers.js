import { doc } from './shared.js'

// Check if what's passed is a string
export function isStr (maybeStr) {
  return typeof maybeStr === 'string'
}

// Check if what's passed is to be considered a colletion
export function isArrayLike (maybeCollection) {
  return (
    maybeCollection &&
    !isStr(maybeCollection) &&
    typeof maybeCollection !== 'function' &&
    maybeCollection.length != null
  )
}

export function isRelevantCollection (collection) {
  return collection[0] != null || collection[collection.length - 1] != null
}

// Queries a selector
const simpleSelectorPattern = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/
export function querySelector (selector, ctx) {
  let regTest
  let matched
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
export function aphParseContext (elemOrAphOrStr) {
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
const singleTagRegEx = /(\w+)\/?>(?:<\/\1)?/i
let docFragment
export function createElement (str, match) {
  if ((match = singleTagRegEx.exec(str))) {
    return doc.createElement(match[1])
  } else if (!docFragment) {
    docFragment = doc.implementation.createHTMLDocument()
    const base = docFragment.createElement('base')
    base.href = document.location.href
    docFragment.head.appendChild(base)
  }

  docFragment.body.innerHTML = str
  return docFragment.body.childNodes[0]
}

const prototypeCache = {}
const propCache = {}

export function assignMethodsAndProperties (
  what,
  propCollection,
  undefinedResultCallback
) {
  const typeBeingDealtWith = propCollection.constructor.name

  // If the wrapped methods cache doesn't exist for this variable type
  // Let's create it
  if (!prototypeCache[typeBeingDealtWith]) {
    prototypeCache[typeBeingDealtWith] = {}
  }

  function setProp (collection, key) {
    if (what[key] == null) {
      try {
        if (collection[key] instanceof Function) {
          if (!prototypeCache[typeBeingDealtWith][key]) {
            // Let's cache the wrapper function
            // If we're dealing with a set method,
            // should allow to pass a object as parameter
            prototypeCache[typeBeingDealtWith][key] = key.substr(0, 3) ===
              'set' && key[key.length - 1] !== 's'
              ? function () {
                const args = arguments
                if (args.length === 1 && args[0].constructor === Object) {
                  return undefinedResultCallback(
                      // this.forEach returns 'this'
                      this.forEach(item => {
                        for (const objKey in args[0]) {
                          collection[key].call(item, objKey, args[0][objKey])
                        }
                      })
                    )
                }

                const result = this.map(i => collection[key].apply(i, args))
                return isRelevantCollection(result)
                    ? result
                    : undefinedResultCallback(this)
              }
              : function () {
                const args = arguments
                const result = this.map(i => collection[key].apply(i, args))
                return isRelevantCollection(result)
                    ? result
                    : undefinedResultCallback(this)
              }
          }
          what[key] = prototypeCache[typeBeingDealtWith][key]
        } else {
          propGetSetWithProp(what, key)
        }
      } catch (ex) {
        // If we reach this exception, we are probably dealing with a property / getter / setter
        propGetSetWithProp(what, key)
      }
    }
  }

  // Let's get the methods first
  const curPrototype = Object.getPrototypeOf(propCollection)
  const prototypeKeys = {}
  Object.getOwnPropertyNames(curPrototype).forEach(function (methodName) {
    setProp(curPrototype, methodName)
    prototypeKeys[methodName] = 1
  })

  // And now the properties
  // Is there already a cache for this type's properties?
  if (!propCache[typeBeingDealtWith]) {
    propCache[typeBeingDealtWith] = []
    for (let key in propCollection) {
      if (isNaN(key) && !prototypeKeys[key]) {
        propCache[typeBeingDealtWith].push(key)
        setProp(propCollection, key)
      }
    }
  } else {
    // If yes, let's use the prop cache
    // Inverse for loop, the order is not relevant here
    for (let len = propCache[typeBeingDealtWith].length; len--;) {
      setProp(propCollection, propCache[typeBeingDealtWith][len])
    }
  }
}

// Sets the set/get methods of a property as the Apheleia.prop method
export function propGetSetWithProp (obj, key) {
  Object.defineProperty(obj, key, {
    get () {
      return this.get(key)
    },
    set (value) {
      this.set(key, value)
    },
  })
}
