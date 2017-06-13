import { doc } from './shared.js'

export function hasKey (what, key) {
  return typeof what[key] !== 'undefined'
}

export function inverseFor (collection, cb) {
  for (let len = collection.length; len--;) cb(collection[len], len)
}

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

const wrappedMethodsCache = {}
const prototypeNamesCache = {}
const propCache = {}

export function setPropOrMethod (what, collection, key, curType, undefinedCallback) {
  if (!hasKey(what, key)) {
    try {
      if (collection[key] instanceof Function) {
        if (!wrappedMethodsCache[curType][key]) {
          // Let's cache the wrapper function
          // If we're dealing with a set method,
          // should allow to pass a object as parameter
          wrappedMethodsCache[curType][key] = key.substr(0, 3) === 'set' &&
            key[key.length - 1] !== 's'
            ? function () {
              const args = arguments
              if (args.length === 1 && args[0].constructor === Object) {
                return undefinedCallback(
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
                  : undefinedCallback(this)
            }
            : function () {
              const args = arguments
              const result = this.map(i => collection[key].apply(i, args))
              return isRelevantCollection(result)
                  ? result
                  : undefinedCallback(this)
            }
        }
        what[key] = wrappedMethodsCache[curType][key]
      } else {
        propGetSetWithProp(what, key)
      }
    } catch (ex) {
      // If we reach this exception, we are probably dealing with a property / getter / setter
      propGetSetWithProp(what, key)
    }
  }
}

export function assignMethodsAndProperties (
  what,
  propCollection,
  undefinedResultCallback
) {
  const curType = propCollection.constructor.name

  // If the wrapped methods cache doesn't exist for this variable type
  // Let's create it
  const curPrototype = Object.getPrototypeOf(propCollection)
  if (!wrappedMethodsCache[curType]) {
    const usedKeys = {}
    prototypeNamesCache[curType] = Object.getOwnPropertyNames(curPrototype)
    wrappedMethodsCache[curType] = {}
    propCache[curType] = []

    inverseFor(prototypeNamesCache[curType], methodName => {
      setPropOrMethod(
        what,
        curPrototype,
        methodName,
        curType,
        undefinedResultCallback
      )
      usedKeys[methodName] = 1
    })

    for (let key in propCollection) {
      if (isNaN(key) && !hasKey(usedKeys, key)) {
        propCache[curType].push(key)
        setPropOrMethod(
          what,
          curPrototype,
          key,
          curType,
          undefinedResultCallback
        )
      }
    }

    // And now the properties
    // Is there already a cache for this type's properties?
  } else {
    // If yes, let's use the prop cache
    // Inverse for loop, the order is not relevant here
    inverseFor(prototypeNamesCache[curType], methodName => {
      setPropOrMethod(
        what,
        curPrototype,
        methodName,
        curType,
        undefinedResultCallback
      )
    })
    inverseFor(propCache[curType], prop => {
      setPropOrMethod(
        what,
        curPrototype,
        prop,
        curType,
        undefinedResultCallback
      )
    })
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
