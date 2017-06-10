import { arrayProto, querySelector } from './shared'

// Check if what's passed is a string
export function isStr (maybeStr) {
  return '' + maybeStr === maybeStr
}

// Check if what's passed is to be considered a colletion
export function isArrayLike (maybeCollection) {
  return (
    maybeCollection && !isStr(maybeCollection) && maybeCollection.length != null
  )
}

export function isRelevantCollection (collection) {
  return collection[0] != null || collection[collection.length - 1] != null
}

// Slice a array-like collection
export function slice (what, from) {
  return arrayProto.slice.call(what, from || 0)
}

// Parses the passed context
export function aphParseContext (elemOrAphOrStr) {
  return elemOrAphOrStr instanceof Node
    ? elemOrAphOrStr // If already a html element
    : isStr(elemOrAphOrStr)
        ? querySelector(elemOrAphOrStr, document)[0] // If string passed let's search for the element on the DOM
        : isArrayLike(elemOrAphOrStr)
            ? elemOrAphOrStr[0] // If already an collection
            : document // Return the document.
}

// Parses the elements passed to aph()
let documentFragment
export function createElement (str) {
  if (!documentFragment) {
    documentFragment = document.implementation.createHTMLDocument()
  }
  documentFragment.body.innerHTML = str
  return documentFragment.body.childNodes[0]
}

export function aphParseElements (strOrCollectionOrElem, ctx) {
  // If string passed
  if (isStr(strOrCollectionOrElem)) {
    // If creation string, create the element
    if (/<.+>/.test(strOrCollectionOrElem)) {
      return [createElement(strOrCollectionOrElem)]
    }
    // If not a creation string, let's search for the elements
    return querySelector(strOrCollectionOrElem, ctx)
  }

  // If html element / window / document passed
  if (
    strOrCollectionOrElem instanceof Node ||
    strOrCollectionOrElem === window
  ) {
    return [strOrCollectionOrElem]
  }

  // If collection passed
  if (isArrayLike(strOrCollectionOrElem)) {
    return strOrCollectionOrElem
  }

  return []
}

const methodCache = {}
export function assignMethodsAndProperties (
  what,
  propCollection,
  undefinedResultCallback,
  ignoreList
) {
  ignoreList = ignoreList || []
  const typeBeingDealtWith = propCollection.constructor.name

  // If the wrapped methods cache doesn't exist for this variable type
  // Let's create it
  if (!methodCache[typeBeingDealtWith]) {
    methodCache[typeBeingDealtWith] = {}
  }

  function setProp (collection, key) {
    if (what[key] == null && !~ignoreList.indexOf(key)) {
      try {
        if (collection[key] instanceof Function) {
          if (!methodCache[typeBeingDealtWith][key]) {
            methodCache[typeBeingDealtWith][key] = function () {
              const args = arguments
              // If the method name begins with 'set' and
              // there's only one argument and it's a plain object
              // we assume we're dealing with a set method.
              // Therefore, we make a method call for each object entry
              if (
                /^set/i.test(key) && // if method starts with 'set'
                key.slice(-1) !== 's' && // and doesn't end with an 's'
                args.length === 1 && // and there's only one argument (object with pair of property keys and values)
                args[0].constructor === Object // and the argument is a plain object
              ) {
                // We return nothing as this is a 'set' method call

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
          }
          what[key] = methodCache[typeBeingDealtWith][key]
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
  const proto = Object.getPrototypeOf(propCollection)
  Object.getOwnPropertyNames(proto).forEach(function (methodName) {
    setProp(proto, methodName)
  })

  // And now the properties
  for (let key in propCollection) {
    if (isNaN(key)) {
      setProp(propCollection, key)
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
