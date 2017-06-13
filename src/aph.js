import Apheleia from './Apheleia.js'
import { arrayPrototype, wrap } from './shared.js'
import {
  wrapPrototypeMethod,
  createElement,
  aphParseContext,
  querySelector,
  hasKey,
  isFn,
} from './helpers.js'

export default function aph (elems, context, metaObj) {
  return new Apheleia(elems, context, metaObj)
}

aph.fn = Apheleia.prototype
aph.wrap = wrap
aph.querySelector = function (selector, context) {
  querySelector(selector, aphParseContext(context))
}

const irrelevantArrayMethods = [
  'concat',
  'copyWithin',
  'fill',
  'join',
  'reduce',
  'reduceRight',
  'splice',
  'sort',
  'slice',
]

// Extending the Array Prototype
// Irrelevant methods on the context of an Apheleia Collection
Object.getOwnPropertyNames(arrayPrototype).forEach(key => {
  if (!~irrelevantArrayMethods.indexOf(key) && !hasKey(aph.fn, key)) {
    aph.fn[key] = arrayPrototype[key]
  }
})

// Extending default HTMLDivElement methods and properties
let aDiv = createElement('<div>')
for (const propKey in aDiv) {
  if (!hasKey(aph.fn, propKey)) {
    if (isFn(aDiv[propKey])) {
      aph.fn[propKey] = wrapPrototypeMethod(propKey, aDiv)
    } else {
      Object.defineProperty(aph.fn, propKey, {
        get () {
          return this.get(propKey)
        },
        set (value) {
          this.set(propKey, value)
        },
      })
    }
  }
}
aDiv = null
