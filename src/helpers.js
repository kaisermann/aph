import { doc } from './shared.js'

export const hasKey = (what, key) => typeof what[key] !== 'undefined'
export const isStr = maybeStr => typeof maybeStr === 'string'
export const isFn = maybeFn => typeof maybeFn === 'function'
export const isArrayLike = maybeCollection =>
  typeof maybeCollection === 'object' &&
  typeof maybeCollection.length === 'number'

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

// Queries a selector
const simpleSelectorPattern = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/
export function querySelector (selector, ctx) {
  let regTest
  if ((regTest = simpleSelectorPattern.exec(selector))) {
    if (regTest[1]) {
      return doc.getElementById(regTest[1])
    }

    if (regTest[2]) {
      return ctx.getElementsByTagName(regTest[2])
    }

    if (regTest[3]) {
      return ctx.getElementsByClassName(regTest[3])
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

const singleTagRegEx = /^<(\w+)\/?>[^\n\r\S]*(?:$|<\/\1>)/
let auxDoc
export function createElement (str, match) {
  if ((match = singleTagRegEx.exec(str))) {
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
export function getAphProxy (what) {
  while (!what.aph) what = what.owner
  return what.aph.proxy
}

// Auxiliary map function
function auxMap (overWhat, methodName, args) {
  const result = overWhat.map(i => i[methodName](...args))
  // If first and last items are null/undefined,
  // we assume the method returned nothing
  return typeof result !== 'undefined' &&
    (typeof result !== 'object' ||
      (result[0] != null && result[result.length - 1] != null))
    ? result
    : getAphProxy(overWhat)
}

export function proxify (what) {
  return new Proxy(what, {
    set (target, propKey, val) {
      target.set(propKey, val)
    },
    get (target, propKey) {
      if (isFn(target[propKey])) {
        return target[propKey].bind(target)
      }

      if (hasKey(target, propKey)) {
        return target[propKey]
      }

      if (isFn(target[0][propKey])) {
        return wrapPrototypeMethod(propKey, target[0]).bind(target)
      }

      if (hasKey(target[0], propKey)) {
        return target.get(propKey)
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

    const methodPrefix = methodName.substr(0, 3)
    wrappedMethodsCache[curType][methodName] = ['set', 'add', 'remove'].some(
      pref => methodPrefix === pref && methodName.length > pref.length
    ) && methodName[methodName.length - 1] !== 's'
      ? function (...args) {
        // Received a 'plain' object as the first parameter?
        if (args[0].constructor === Object) {
          const [argObj, ...rest] = args
          return getAphProxy(
            this.forEach(item => {
              for (const objKey in argObj) {
                item[methodName](objKey, argObj[objKey], ...rest)
              }
            })
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
