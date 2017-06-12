import Apheleia from './Apheleia.js'
import { arrayPrototype, wrap } from './shared.js'
import {
  assignMethodsAndProperties,
  createElement,
  aphParseContext,
  querySelector,
} from './helpers.js'

export default function aph (elems, context, metaObj) {
  return new Apheleia(elems, context, metaObj)
}

aph.fn = Apheleia.prototype
aph.wrap = wrap
aph.querySelector = function (selector, context) {
  querySelector(selector, aphParseContext(context))
}

// Extending the Array Prototype
// Irrelevant methods on the context of an Apheleia Collection
const ignoreMethods = [
  'concat',
  'copyWithin',
  'fill',
  'join',
  'reduce',
  'reduceRight',
  'slice',
  'splice',
  'sort',
]

Object.getOwnPropertyNames(arrayPrototype).forEach(key => {
  if (!~ignoreMethods.indexOf(key) && aph.fn[key] == null) {
    aph.fn[key] = arrayPrototype[key]
  }
})

// Extending default HTMLElement methods and properties
assignMethodsAndProperties(aph.fn, createElement('<div>'), instance => instance)
