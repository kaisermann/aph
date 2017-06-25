require('jsdom-global')()

const test = require('ava')
const aph = require('../dist/aph')

let aElement = aph('<div>')
let aElement2 = aph('<div>')

test('should select existent elements by specified selector', function (t) {
  aElement.appendTo(document.body)
  aElement2.appendTo(document.body)
  t.is(aph('div').length, 2)
})

test('should create an Apheleia wrapper around a passed node', function (t) {
  t.is(aph(aElement).length, 1)
})

test('should find children itens of the first element with .find()', function (
  t
) {
  aph('<span>').appendTo(aElement2)
  t.is(aph(aElement2).find('span').tagName[0], 'SPAN')
})

test('should filter all elements and return only spans', function (t) {
  const aFilteredSpans = aph('*').filter(elem => elem.tagName === 'SPAN')
  t.is(aFilteredSpans.tagName[0], 'SPAN')
})

test('should find when passed an #id selector', function (t) {
  aph(aElement).setAttribute('id', 'test-id')
  t.is(aph('#test-id').tagName[0], 'DIV')
})

test('should find when passed an .class selector', function (t) {
  aph(aElement).setAttribute('class', 'test-class')
  t.is(aph('.test-class').tagName[0], 'DIV')
})

test('should find when passed an singlet selector', function (t) {
  aph(aElement).setAttribute('class', 'test-class')
  t.is(aph('div').tagName[0], 'DIV')
})

test('should find when passed another Apheleia instance', function (t) {
  aph(aElement).setAttribute('class', 'test-class')
  t.is(aph(aph('div')).tagName[0], 'DIV')
})

test('should return all an array of items', function (t) {
  t.is(aph('*').asArray().length, 7)
})

test("should return null when the apheleia has no 'aph.owner' property", function (
  t
) {
  const aInstance = aph('*')
  t.falsy(aInstance.aph.owner)
})

test("should return the parent Apheleia instance when 'meta.owner' is not null", function (
  t
) {
  const aInstance = aph('*')
  const aNotherInstance = aInstance.find('div')
  t.is(aNotherInstance.aph.owner, aInstance._target)
})

test('should search for a context element when string passed as parameter', function (
  t
) {
  const aInstance = aph('.test-class')
  aph('<span class="inside-class">').appendTo(aInstance)
  t.true(
    aph('.inside-class', '.test-class').aph.context.classList.contains(
      'test-class'
    )
  )
})
