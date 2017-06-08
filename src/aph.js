import Apheleia from './Apheleia.js'

export default function aph (elems, context, metaObj) {
  return new Apheleia(elems, context, metaObj)
}

// Plugs in new methods to the Apheleia prototype
aph.plug = function (key, fn) {
  Apheleia.prototype[key] = fn
}

Object.getOwnPropertyNames(Apheleia).forEach(function (prop) {
  if (Apheleia[prop] instanceof Function) {
    aph[prop] = Apheleia[prop]
  }
})
