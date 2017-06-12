require('jsdom-global')()
require('colors')

const test = require('ava')
const aph = require('../dist/aph')

test('should create an element when a string between <str> is passed', function (
  t
) {
  t.is(aph('<img>').tagName[0], 'IMG')
  t.is(aph('<div/>').tagName[0], 'DIV')
})

test('should append an aph object to an HTMLElement', function (t) {
  aph('<div>').appendTo(document.body)
  aph(document.body)
    .append(document.createElement('div'))
    .append([document.createElement('div'), document.createElement('div')])
  t.is(document.body.querySelectorAll('div').length, 4)
})

test('should append an aph object to the HTMLElements of another aph object', function (
  t
) {
  aph('<div>').appendTo(aph(document.body))
  aph(document.body).append(aph('<div>')).append([aph('<div>'), aph('<div>')])
  t.is(document.body.querySelectorAll('div').length, 8)
})

test('should prepend an aph object to an HTMLElement', function (t) {
  aph('<div>').prependTo(document.body)
  aph(document.body)
    .prepend(document.createElement('div'))
    .prepend([document.createElement('div'), document.createElement('div')])
  t.is(document.body.querySelectorAll('div').length, 12)
})

test('should prepend an aph object to the HTMLElements of another aph object', function (
  t
) {
  aph('<div>').prependTo(aph(document.body))
  aph(document.body).prepend(aph('<div>')).prepend([aph('<div>'), aph('<div>')])
  t.is(document.body.querySelectorAll('div').length, 16)
})

test('should delete all div elements', function (t) {
  aph('div').detach()
  t.is(document.body.querySelectorAll('div').length, 0)
})

test('should create a default page like structure with .html()', function (t) {
  aph(document.body).prepend(
    aph('<div>').append([
      document.createElement('header'),
      document.createElement('aside'),
      aph('<main>').append(aph('<div>')),
      aph('<footer>'),
    ])
  )

  t.is(aph('header').length, 1)
  t.is(aph('aside').length, 1)
  t.is(aph('main').length, 1)
  t.is(aph('footer').length, 1)
  aph('body *').detach()
})
