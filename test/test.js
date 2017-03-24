/* global describe, it */
require('jsdom-global')()
const assert = require('chai').assert
const aph = require('../dist/aph')

let element  // eslint-disable-line
let element2 // eslint-disable-line

describe('Apheleia plugins', function () {
  it('should expose aph.fn', function () {
    assert.isNotNull(aph.fn)
  })

  it('should create a .log() plugin that logs all the instance loaded elements', function () {
    aph.plug('log', function () {
      this.each(item => console.log(item))
    })
    assert.isFunction(aph().log)
  })
})

describe('Creating and selecting items', function () {
  it('should create an element when a string between <str> is passed', function () {
    element = aph('<div>').appendTo(document.body).get(0)
    element2 = aph('<div>').appendTo(document.body).get(0)
    assert.equal(element.tagName.toLowerCase(), 'div')
    assert.equal(aph('<img>').get(0).tagName.toLowerCase(), 'img')
    assert.equal(aph('<div/>').get(0).tagName.toLowerCase(), 'div')
  })

  it('should create an Apheleia wrapper around a passed node', function () {
    assert.equal(aph(element).elements.length, 1)
  })

  it('should find children itens of the first element with .find()', function () {
    aph('<span>').appendTo(element2)
    assert.equal(aph(element2).find('span').get(0).tagName.toLowerCase(), 'span')
  })

  it('should find when passed an #id selector', function () {
    aph(element).attr('id', 'test-id')
    assert.equal(aph('#test-id').get(0).tagName.toLowerCase(), 'div')
  })

  it('should find when passed an .class selector', function () {
    aph(element).attr('class', 'test-class')
    assert.equal(aph('.test-class').get(0).tagName.toLowerCase(), 'div')
  })

  it('should find when passed an singlet selector', function () {
    aph(element).attr('class', 'test-class')
    assert.equal(aph('div').get(0).tagName.toLowerCase(), 'div')
  })

  it('should find when passed another Apheleia instance', function () {
    aph(element).attr('class', 'test-class')
    assert.equal(aph(aph('div')).get(0).tagName.toLowerCase(), 'div')
  })

  it('should return all elements when .get() with no parameter', function () {
    assert.equal(aph('*').get().length, 7)
  })

  // TO-DO: need to create context test cases
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
  it('should accept an object as attributes setup', function () {
    aph(element).attr({ style: 'width: 400px' })
    assert.equal(element.style.width, '400px')
  })

  it('should accept an object as data setup', function () {
    aph(element).data({ slug: 'test-slug-2' })
    assert.equal(element.getAttribute('data-slug'), 'test-slug-2')
  })

  it('should accept an object as properties setup', function () {
    aph(element).prop({ testProperty: 11 })
    assert.equal(element.testProperty, 11)
  })
})

describe('Class manipulation', function () {
  it('should have added all classes passed as arguments', function () {
    aph('<div>').appendTo(document.body).get(0)
    aph('<div>').addClass(['test-class', 'test-class-2']).appendTo(document.body).get(0)
    assert.equal(aph('.test-class').hasClass('test-class-2'), true)
  })

  it('should return false if all divs has same class (for this test case)', function () {
    assert.equal(aph('div').hasClass('test-class', true), false)
  })

  it('should return true if at least one div has the specified class', function () {
    assert.equal(aph('div').hasClass('test-class'), true)
  })
})

describe('CSS manipulation', function () {
  it('should set single css attribute', function () {
    aph(element).css('opacity', 0.5)
    assert.equal(aph(element).get(0).style.opacity, 0.5)
  })

  it('should set multiple css attribute', function () {
    aph(element).css({display: 'inline', width: '500px'})
    assert.equal(aph(element).get(0).style.width, '500px')
    assert.equal(aph(element).get(0).style.display, 'inline')
  })

  it('should get single css attribute from first element', function () {
    assert.equal(aph(element).css('opacity'), 0.5)
  })
})

// TO-DO
// TO-DO
// TO-DO
// TO-DO
// TO-DO
// TO-DO
// TO-DO
