import { doc } from './shared.js'

export const hasKey = (what, key) => typeof what[key] !== 'undefined'
export const isStr = maybeStr => typeof maybeStr === 'string'
export const isFn = maybeFn => typeof maybeFn === 'function'

export function flattenArrayLike (what) {
  let flat = []
  for (let i = 0, len = what.length; i < len; i++) {
    if (isArrayLike(what[i])) {
      flat = flat.concat(flattenArrayLike(what[i]))
    } else {
      if (flat.indexOf(what[i]) < 0) {
        flat.push(what[i])
      }
    }
  }
  return flat
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
  if ((regTest = simpleSelectorPattern.exec(selector))) {
    if (regTest[3]) {
      return ctx.getElementsByClassName(regTest[3])
    }

    if (regTest[2]) {
      return ctx.getElementsByTagName(regTest[2])
    }

    if (regTest[1]) {
      return doc.getElementById(regTest[1])
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

const singleTagRegEx = /^<(\w+)\/?>(?:$|<\/\1>)/
const newlineRegEx = /\r|\n/
let auxDoc
export function createElement (str, match) {
  // We check if there's any newline
  // if yes, we assume it's a complex html element creation
  // if not, we check if it's a simple tag
  if (!newlineRegEx.test(str) && (match = singleTagRegEx.exec(str))) {
    return doc.createElement(match[1])
  }

  if (!auxDoc) {
    auxDoc = doc.implementation.createHTMLDocument()
    const base = auxDoc.createElement('base')
    base.href = document.location.href
    auxDoc.head.appendChild(base)
  }

  auxDoc.body.innerHTML = str
  return auxDoc.body.childNodes[0]
}

// Searches for an apheleia collection on the ownership hierarchy
export function getAphOwner (what) {
  while (!what.aph) what = what.owner
  return proxify(what)
}

// Auxiliary map function
function auxMap (overWhat, methodName, args) {
  const result = overWhat.map(i => i[methodName](...args))
  // If first and last items are null/undefined,
  // we assume the method returned nothing
  return result && result[0] != null && result[result.length - 1] != null
    ? result
    : getAphOwner(overWhat)
}

export function proxify (what) {
  return new Proxy(what, {
    set (target, propKey, val) {
      target.set(propKey, val)
    },
    get (target, propKey) {
      if (hasKey(target, propKey)) {
        return isFn(target[propKey])
          ? target[propKey].bind(target)
          : target[propKey]
      }

      if (target.length) {
        if (isFn(target[0][propKey])) {
          return wrapPrototypeMethod(propKey, target[0]).bind(target)
        }

        if (hasKey(target[0], propKey)) {
          return target.map(i => i[propKey])
        }
      }

      // If key is '_target' let's return the target itself
      if (propKey === '_target') {
        return target
      }

      return undefined
    },
  })
}

// Wraps a object method making it work with collections natively and caches it
const wrappedMethodsCache = {}
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
      ? function (...args) {
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
      : function (...args) {
        return auxMap(this, methodName, args)
      }
  }

  return wrappedMethodsCache[curType][methodName]
}
