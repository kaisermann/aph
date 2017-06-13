import { doc } from './shared.js'

export function hasKey (what, key) {
  return typeof what[key] !== 'undefined'
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
export function wrapPrototypeMethod (
  what,
  methodName,
  method,
  curType,
  undefinedCallback
) {
  if (!hasKey(wrappedMethodsCache[curType], methodName)) {
    // Let's cache the wrapper function
    // If we're dealing with a set method,
    // should allow to pass a object as parameter
    wrappedMethodsCache[curType][methodName] = methodName.substr(0, 3) ===
      'set' && methodName[methodName.length - 1] !== 's'
      ? function () {
        const args = arguments
        if (args.length === 1 && args[0].constructor === Object) {
          return undefinedCallback(
              // this.forEach returns 'this'
              this.forEach(item => {
                for (const objKey in args[0]) {
                  method.call(item, objKey, args[0][objKey])
                }
              })
            )
        }

        const result = this.map(i => method.apply(i, args))
        return isRelevantCollection(result) ? result : undefinedCallback(this)
      }
      : function () {
        const args = arguments
        const result = this.map(i => method.apply(i, args))
        return isRelevantCollection(result) ? result : undefinedCallback(this)
      }
  }
  what[methodName] = wrappedMethodsCache[curType][methodName]
}

const protoNames = {}
export function extendObjectPrototype (
  what,
  collection,
  undefinedResultCallback,
  shouldExtendProps
) {
  const { name: curType, prototype: curProto } = collection.constructor

  if (!hasKey(wrappedMethodsCache, curType)) {
    wrappedMethodsCache[curType] = {}
  }

  function aux (collection, key) {
    try {
      if (collection[key] instanceof Function) {
        wrapPrototypeMethod(
          what,
          key,
          collection[key],
          curType,
          undefinedResultCallback
        )
      } else if (shouldExtendProps) propGetSet(what, key)
    } catch (ex) {
      if (shouldExtendProps) propGetSet(what, key)
    }
  }

  if (shouldExtendProps) {
    for (const key in collection) {
      if (!hasKey(what, key)) {
        aux(collection, key) // prop list, key
      }
    }
  } else {
    collection = hasKey(protoNames, curType)
      ? protoNames[curType]
      : (protoNames[curType] = Object.getOwnPropertyNames(curProto))

    for (let len = collection.length; len--;) {
      if (!hasKey(what, collection[len])) {
        aux(curProto, collection[len]) // proto, key
      }
    }
  }
}

// Sets the set/get methods of a property as the Apheleia.prop method
export function propGetSet (obj, key) {
  Object.defineProperty(obj, key, {
    get () {
      return this.get(key)
    },
    set (value) {
      this.set(key, value)
    },
  })
}
