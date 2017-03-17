import Apheleia from './Apheleia'

// Apheleia wrapper
function aph (elems, contextOrAttrKey, nothingOrAttrVal) {
  return new Apheleia(elems, contextOrAttrKey, nothingOrAttrVal)
}
aph.fn = Apheleia.prototype

// Plugs in new methods to the aph() prototype
aph.plug = (key, fn) => { aph.fn[key] = fn }
// querySelector shortcut
aph.find = (str, ctx) => (ctx || document).querySelector(str)
// querySelectorAll shortcut
aph.findAll = (str, ctx) => (ctx || document).querySelectorAll(str)

// Helpers
export default aph
