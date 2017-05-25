import Apheleia from './Apheleia'

// Apheleia wrapper
function aph (elems, context, aphParent) {
  return new Apheleia(elems, context, aphParent)
}

// Plugs in new methods to the Apheleia prototype
aph.plug = function (key, fn) {
  Apheleia.prototype[key] = fn
}

// Executes a especified callback when the DOM is loaded
aph.onDOMLoaded = function (cb) {
  if (
    document.readyState === 'complete' ||
    (document.readyState !== 'loading' && !document.documentElement.doScroll)
  ) {
    cb()
  } else {
    document.addEventListener('DOMContentLoaded', () => cb(), false)
  }
}

export default aph
