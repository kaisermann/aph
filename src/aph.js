import Apheleia from './Apheleia'

// Apheleia wrapper
function aph (elems, contextOrAttrKey, nothingOrAttrVal) {
  return new Apheleia(elems, contextOrAttrKey, nothingOrAttrVal)
}

// Plugs in new methods to the Apheleia prototype
aph.plug = (key, fn) => { Apheleia.prototype[key] = fn }

// querySelector shortcut
aph.find = (str, ctx) => (ctx || document).querySelector(str)

// querySelectorAll shortcut
aph.findAll = (str, ctx) => (ctx || document).querySelectorAll(str)

export default aph
