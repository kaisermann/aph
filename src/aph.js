import Apheleia from './Apheleia.js'
import { flatWrap, querySelector } from './shared.js'

export default function aph (elems, context, metaObj) {
  return new Apheleia(elems, context, metaObj)
}

// Plugs in new methods to the Apheleia prototype
aph.fn = Apheleia.prototype
aph.flatWrap = flatWrap
aph.querySelector = querySelector
