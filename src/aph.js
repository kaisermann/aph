import Apheleia from './Apheleia'

// Apheleia wrapper
function aph (elems, context, metaObj) {
  return new Apheleia(elems, context, metaObj)
}

// Plugs in new methods to the Apheleia prototype
aph.plug = function (key, fn) {
  Apheleia.prototype[key] = fn
}

export default aph
