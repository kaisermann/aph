import { wrapPrototypeMethod, createElement, hasKey, isFn } from './helpers.js'

import aph from './Apheleia.js'
export default aph

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
