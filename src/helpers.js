export function profile (fn, name, nTimes) {
  nTimes = nTimes || 1000
  const t0 = performance.now()
  for (var p = 0; p < nTimes; p++) {
    fn()
  }
  const t1 = performance.now()
  return {
    elapsed: t1 - t0,
    name: name,
  }
}

export function test (name, arr) {
  console.group(name)
  arr.sort((a, b) => a.elapsed > b.elapsed).forEach(item => {
    console.log(`${item.name} - ${item.elapsed} msecs`)
  })
  console.groupEnd(name)
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
  const regTest = simpleSelectorPattern.exec(selector)
  let matched
  return (matched = regTest[1]) // if #id
    ? document.getElementById(matched)
    : (matched = regTest[2]) // if tag (a, span, div, ...)
      ? ctx.getElementsByTagName(matched)
      : (matched = regTest[3]) // if .class
        ? ctx.getElementsByClassName(matched)
        : ctx.querySelectorAll(selector) // anything else
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
