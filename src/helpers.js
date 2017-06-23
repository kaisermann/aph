import Apheleia from './Apheleia.js'
import { doc } from './shared.js'

export function hasKey (what, key) {
  return typeof what[key] !== 'undefined'
}

// Check if what's passed is a string
export function isStr (maybeStr) {
  return typeof maybeStr === 'string'
}

export function isFn (maybeFn) {
  return typeof maybeFn === 'function'
}

export function isInt (maybeInt) {
  return typeof maybeInt === 'number' && Math.floor(maybeInt) === maybeInt
}

// Check if what's passed is to be considered a colletion
export function isArrayLike (maybeCollection) {
  return (
    maybeCollection &&
    !isStr(maybeCollection) &&
    !isFn(maybeCollection) &&
    hasKey(maybeCollection, 'length')
  )
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
          ? elemOrAphOrStr[0] // If already a collection
          : doc // Return the document if nothing else...
}

// Parses the elements passed to aph()
const singleTagRegEx = /<(\w+)\/?>(?:$|<\/\1>)/i
let docFragment
export function createElement (str, match) {
  if ((match = singleTagRegEx.exec(str))) {
    return doc.createElement(match[1])
  }

  if (!docFragment) {
    docFragment = doc.implementation.createHTMLDocument()
    const base = docFragment.createElement('base')
    base.href = document.location.href
    docFragment.head.appendChild(base)
  }

  docFragment.body.innerHTML = str
  return docFragment.body.childNodes[0]
}

// Wraps a object method making it work with collections natively and caches it
const wrappedMethodsCache = {}

// Searches for an apheleia collection on the ownership hierarchy
function getAphOwner (what) {
  while (what.constructor !== Apheleia) what = what.aph.owner
  return what
}

// Auxiliary map function
function auxMap (overWhat, methodName, args) {
  const result = overWhat.map(i => i[methodName].apply(i, args))
  // If first and last items are null/undefined,
  // we assume the method returned nothing
  return result[0] != null && result[result.length - 1] != null
    ? result
    : getAphOwner(overWhat)
}

export function wrapPrototypeMethod (methodName, sample) {
  const curType = sample.constructor.name

  if (!hasKey(wrappedMethodsCache, curType)) {
    wrappedMethodsCache[curType] = {}
  }

  if (!hasKey(wrappedMethodsCache[curType], methodName)) {
    // Let's cache the wrapper function
    // If we're dealing with a set method,
    // should allow to pass a object as parameter

    wrappedMethodsCache[curType][methodName] = methodName.substr(0, 3) ===
      'set' && methodName[methodName.length - 1] !== 's'
      ? function () {
        const args = arguments
        // Received only one argument and it's a 'plain' object?
        if (args.length === 1 && args[0].constructor === Object) {
          return getAphOwner(
            this.forEach(item => {
              for (const objKey in args[0]) {
                item[methodName](objKey, args[0][objKey])
              }
            })
            // this.forEach returns 'this'
          )
        }
        return auxMap(this, methodName, args)
      }
      : function () {
        return auxMap(this, methodName, arguments)
      }
  }

  return wrappedMethodsCache[curType][methodName]
}
