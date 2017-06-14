require('jsdom-global')()
require('colors')

const test = require('ava')
const aph = require('../dist/aph')

aph.fn['repeat'] = function (numberOfClones) {
  let repeatedElements = []
  let cachedElements = this.get()
  for (let i = numberOfClones; i--;) {
    repeatedElements = repeatedElements.concat(
      cachedElements.map(item => item.cloneNode())
    )
  }
  return aph(repeatedElements, this.aph.context, this)
}

test('should have map and filter methods', function (t) {
  const aInstance = aph()
  t.truthy(aInstance.map)
  t.truthy(aInstance.filter)
})

test('should extend HTMLElement props and methods', function (t) {
  const aInstance = aph('<div>')
  t.truthy(aInstance.classList)
  t.truthy(aInstance.attributes)
  t.is(typeof aInstance.click, 'function')
  t.is(typeof aInstance.setAttribute, 'function')
  t.truthy(aInstance.style)
})

test('should extend the current collection with default Apheleia methods', function (
  t
) {
  const aInstance = aph('<div>')
  t.is(typeof aInstance.classList.set, 'function')
  t.is(typeof aInstance.classList.get, 'function')
  t.is(typeof aInstance.classList.forEach, 'function')
  t.is(typeof aInstance.classList.filter, 'function')
  t.is(typeof aInstance.classList.aph, 'object')
})

test('should recursively extend the current collection with its item prototype and methods', function (
  t
) {
  const aInstance = aph('<div>')
  t.is(typeof aInstance.classList.add, 'function')
  t.is(typeof aInstance.style.setProperty, 'function')
  t.not(aInstance.style.color, null)
  t.not(aInstance.attributes.setNamedItem, null)
})
