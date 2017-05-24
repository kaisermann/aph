/* global describe, it */
require('jsdom-global')()
const { assert } = require('chai')
const aph = require('../dist/aph')

let aElement = aph('<div>')
let aElement2 = aph('<div>')

describe('Creating and deleting items', function () {
  it('should create an element when a string between <str> is passed', function () {
    assert.equal(aph('<img>')[0].tagName, 'IMG')
    assert.equal(aph('<div/>')[0].tagName, 'DIV')
  })

  it('should append an element to a specified parent node', function () {
    aph('<div>').appendTo(document.body)
    assert.equal(document.body.querySelectorAll('div').length, 1)
  })

  it('should append an element to the first element of another Apheleia instance', function () {
    aph('<div>').appendTo(aph(document.body))
    assert.equal(document.body.querySelectorAll('div').length, 2)
  })

  it('should prepend an element to a specified parent node', function () {
    aph('<div>').prependTo(document.body)
    assert.equal(document.body.querySelectorAll('div').length, 3)
  })

  it('should prepend an element to the first element of another Apheleia instance', function () {
    aph('<div>').prependTo(aph(document.body))
    assert.equal(document.body.querySelectorAll('div').length, 4)
  })

  it('should delete all specified elements', function () {
    aph('div').delete()
    assert.equal(document.body.querySelectorAll('div').length, 0)
  })
})

describe('Selecting items', function () {
  it('should select existent elements by specified selector', function () {
    aElement.appendTo(document.body)
    aElement2.appendTo(document.body)
    assert.equal(aph('div').length, 2)
  })

  it('should create an Apheleia wrapper around a passed node', function () {
    assert.equal(aph(aElement).length, 1)
  })

  it('should find children itens of the first element with .find()', function () {
    aph('<span>').appendTo(aElement2)
    assert.equal(aph(aElement2).find('span')[0].tagName, 'SPAN')
  })

  it('should filter all elements and return only spans', function () {
    const aFilteredSpans = aph('*').filter(elem => elem.tagName === 'SPAN')
    assert.equal(aFilteredSpans[0].tagName, 'SPAN')
  })

  it('should find when passed an #id selector', function () {
    aph(aElement).attr('id', 'test-id')
    assert.equal(aph('#test-id')[0].tagName, 'DIV')
  })

  it('should find when passed an .class selector', function () {
    aph(aElement).attr('class', 'test-class')
    assert.equal(aph('.test-class')[0].tagName, 'DIV')
  })

  it('should find when passed an singlet selector', function () {
    aph(aElement).attr('class', 'test-class')
    assert.equal(aph('div')[0].tagName, 'DIV')
  })

  it('should find when passed another Apheleia instance', function () {
    aph(aElement).attr('class', 'test-class')
    assert.equal(aph(aph('div'))[0].tagName, 'DIV')
  })

  it('should return all elements when .get() with no parameter', function () {
    assert.equal(aph('*').get().length, 7)
  })

  it("should return null when the apheleia has no '.aphParent' property", function () {
    const aInstance = aph('*')
    assert.equal(aInstance.aphParent, null)
  })

  it("should return the parent Apheleia instance when '.aphParent' is not null", function () {
    const aInstance = aph('*')
    const aNotherInstance = aInstance.find('div')
    assert.equal(aNotherInstance.aphParent, aInstance)
  })

  it('should search for a context element when string passed as parameter', function () {
    const aInstance = aph('.test-class')
    aph('<span>').addClass('inside-class').appendTo(aInstance[0])
    assert.isTrue(
      aph('.inside-class', '.test-class').context.classList.contains(
        'test-class'
      )
    )
  })

  // TO-DO: need to create context test cases
})

describe('Element manipulation', function () {
  it('should accept an object as attributes setup', function () {
    aph(aElement).attr({ style: 'width: 400px' })
    assert.equal(aElement[0].style.width, '400px')
  })

  it('should accept an object as data setup', function () {
    aph(aElement).data({ slug: 'test-slug-2' })
    assert.equal(aElement[0].getAttribute('data-slug'), 'test-slug-2')
  })

  it('should accept an object as properties setup', function () {
    aph(aElement).prop({ testProperty: 11 })
    assert.equal(aElement[0].testProperty, 11)
  })
})

describe('Class manipulation', function () {
  it('should have added all classes passed as arguments', function () {
    aph('<div>').appendTo(document.body)
    aph('<div>')
      .addClass(['test-class', 'test-class-2'])
      .appendTo(document.body)
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
    aph(aElement).css('opacity', 0.5)
    assert.equal(aph(aElement)[0].style.opacity, 0.5)
  })

  it('should set multiple css attribute', function () {
    aph(aElement).css({ display: 'inline', width: '500px' })
    assert.equal(aph(aElement)[0].style.width, '500px')
    assert.equal(aph(aElement)[0].style.display, 'inline')
  })

  it('should get single css attribute from first element', function () {
    assert.equal(aph(aElement).css('opacity'), 0.5)
  })
})

describe('Apheleia plugins', function () {
  it('should create a .log() plugin that logs all the instance loaded elements', function () {
    aph.plug('log', function () {
      this.each(item => console.log(item))
    })
    assert.isFunction(aph().log)
  })
})

// TO-DO
