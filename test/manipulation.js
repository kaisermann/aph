require('jsdom-global')()

const test = require('ava')
const aph = require('../dist/aph')

let aElement = aph('<div>')

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

test('should accept an object as attributes setup', function (t) {
  aph(aElement).setAttribute({ style: 'width: 400px' })
  t.is(aElement.style.get('width')[0], '400px')
})

test('should accept an object as properties setup', function (t) {
  aph(aElement).set({ testProperty: 11, testProperty2: 12 })
  t.is(aElement.get('testProperty')[0], 11)
  t.is(aElement.get('testProperty2')[0], 12)
})

test('should have added all classes passed as arguments', function (t) {
  aph('<div>').appendTo(document.body)
  aph('<div>').classList
    .add('test-class', 'test-class-2')
    .appendTo(document.body)
  t.is(aph('.test-class').classList.contains('test-class-2').some(i => i), true)
})

test('should return false if all divs has same class (for this test case)', function (
  t
) {
  t.is(aph('div').classList.contains('test-class').every(i => i), false)
})

test('should return true if at least one div has the specified class', function (
  t
) {
  t.is(aph('div').classList.contains('test-class').some(i => i), true)
})

test('should set single css attribute', function (t) {
  aph(aElement).css('opacity', 0.5)
  t.is(aph(aElement).style.get('opacity')[0], '0.5')
})

test('should set multiple css attribute', function (t) {
  aph(aElement).css({ display: 'inline', width: '500px' })
  t.is(aph(aElement).style.get('width')[0], '500px')
  t.is(aph(aElement).style.get('display')[0], 'inline')
})

test('should get single css attribute from first element', function (t) {
  t.is(aph(aElement).css('opacity')[0], '0.5')
})
