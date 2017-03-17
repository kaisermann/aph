/* global describe, it */
require('jsdom-global')()
const assert = require('chai').assert
const aph = require('../dist/aph')

let element
let element2

describe('Apheleia plugins', function () {
  it('should expose aph.fn', function () {
    assert.isNotNull(aph.fn)
  })

  it('should create a .log() plugin that logs all the instance loaded elements', function () {
    aph.plug('log', function () {
      this.each(item => console.log(item))
    })
    assert.isFunction(aph.fn.log)
  })
})

describe('Creating and selecting items', function () {
  it('should create an element when a string between <str> is passed', function () {
    element = aph('<div>').appendTo(document.body).get(0)
    element2 = aph('<div>', 'class', 'test-class').appendTo(document.body).get(0)
    assert.equal(element.tagName.toLowerCase(), 'div')
    assert.equal(aph('<img>').get(0).tagName.toLowerCase(), 'img')
    assert.equal(aph('<div/>').get(0).tagName.toLowerCase(), 'div')
  })

  it('should create an Apheleia wrapper around a passed node', function () {
    assert.equal(aph(element).elements.length, 1)
  })
})

describe('DOM Manipulation', function () {
  it('should append an element to a specified parent node', function () {
    aph('<div>').appendTo(document.body)
    assert.equal(document.body.querySelectorAll('div').length, 3)
  })

  it('should prepend an element to a specified parent node', function () {
    aph('<div>').prependTo(document.body)
    assert.equal(document.body.querySelectorAll('div').length, 4)
  })

  it('should select existent elements by specified selector', function () {
    assert.equal(aph('div').elements.length, 4)
  })

  it('should delete all specified elements', function () {
    aph('div').delete()
    assert.equal(document.body.querySelectorAll('div').length, 0)
  })
})

describe('Element manipulation', function () {
  it('should accept inline attribute setup', function () {
    aph(element, 'style', 'width: 100px')
    assert.equal(element.style.width, '100px')

    aph(element).attr('style', 'width: 200px')
    assert.equal(element.style.width, '200px')
  })

  it('should accept an object as attributes setup', function () {
    aph(element, { style: 'width: 300px' })
    assert.equal(element.style.width, '300px')

    aph(element).attr({ style: 'width: 400px' })
    assert.equal(element.style.width, '400px')
  })

  it('should accept inline data setup', function () {
    aph(element).data('slug', 'test-slug')
    assert.equal(element.getAttribute('data-slug'), 'test-slug')
  })

  it('should accept an object as data setup', function () {
    aph(element).data({ slug: 'test-slug-2' })
    assert.equal(element.getAttribute('data-slug'), 'test-slug-2')
  })

  it('should accept inline property setup', function () {
    aph(element).prop('testProperty', 10)
    assert.equal(element.testProperty, 10)
  })

  it('should accept an object as properties setup', function () {
    aph(element).prop({ testProperty: 11 })
    assert.equal(element.testProperty, 11)
  })
})

describe('Class manipulation', function () {
  it('should return false if all divs has same class (for this test case)', function () {
    aph('<div>').appendTo(document.body).get(0)
    aph('<div>', 'class', 'test-class').appendTo(document.body).get(0)
    assert.equal(aph('div').hasClass('test-class', true), false)
  })

  it('should return true if at least one div has the specified class', function () {
    assert.equal(aph('div').hasClass('test-class'), true)
  })
})

// TO-DO
// TO-DO
// TO-DO
// TO-DO
// TO-DO
// TO-DO
// TO-DO
