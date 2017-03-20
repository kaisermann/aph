import Apheleia from './Apheleia'

// Apheleia wrapper
function aph (elems, context) {
  return new Apheleia(elems, context)
}

// Plugs in new methods to the Apheleia prototype
aph.plug = (key, fn) => { Apheleia.prototype[key] = fn }

export default aph
