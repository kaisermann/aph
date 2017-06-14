import Apheleia from './Apheleia.js'
import { wrap } from './shared.js'
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

// Extending default HTMLDivElement methods and properties
let aDiv = createElement('<div>')
function propLoop (propKey) {
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

for (const propKey in aDiv) {
  if (!hasKey(aph.fn, propKey)) {
    propLoop(propKey)
  }
}
aDiv = null
