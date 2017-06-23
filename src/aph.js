import Apheleia from './Apheleia.js'
export default function aph (elems, context, meta) {
  return new Apheleia(elems, context, meta)
}

aph.fn = Apheleia.prototype
