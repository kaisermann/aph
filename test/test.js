/* global describe, it */
require('jsdom-global')()
const { assert } = require('chai')
const aph = require('../dist/aph')

let aElement = aph('<div>')
let aElement2 = aph('<div>')

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

describe('Extending DOM types properties and methods', function () {
  it('should extend array methods', function () {
    const aInstance = aph()
    assert.isNotNull(aInstance.map)
    assert.isNotNull(aInstance.filter)
    assert.isNotNull(aInstance.shift)
  })

  it('should extend HTMLElement props and methods', function () {
    const aInstance = aph('<div>')
    assert.isNotNull(aInstance.classList)
    assert.isNotNull(aInstance.attributes)
    assert.isFunction(aInstance.click)
    assert.isFunction(aInstance.setAttribute)
    assert.isNotNull(aInstance.style)
  })

  it('should extend the current collection with default Apheleia methods', function () {
    const aInstance = aph('<div>')
    assert.isFunction(aInstance.classList.set)
    assert.isFunction(aInstance.classList.get)
    assert.isFunction(aInstance.classList.call)
    assert.isFunction(aInstance.classList.forEach)
    assert.isFunction(aInstance.classList.filter)
  })

  it('should recursively extend the current collection with its item prototype and methods', function () {
    const aInstance = aph('<div>')
    assert.isFunction(aInstance.classList.add)
    assert.isFunction(aInstance.style.setProperty)
    assert.isNotNull(aInstance.style.color)
    assert.isNotNull(aInstance.attributes.setNamedItem)
  })
})

describe('Creating and deleting items', function () {
  it('should create an element when a string between <str> is passed', function () {
    assert.equal(aph('<img>').tagName[0], 'IMG')
    assert.equal(aph('<div/>').tagName[0], 'DIV')
  })

  it('should append an aph object to an HTMLElement', function () {
    aph('<div>').appendTo(document.body)
    aph(document.body)
      .append(document.createElement('div'))
      .append([document.createElement('div'), document.createElement('div')])
    assert.equal(document.body.querySelectorAll('div').length, 4)
  })

  it('should append an aph object to the HTMLElements of another aph object', function () {
    aph('<div>').appendTo(aph(document.body))
    aph(document.body).append(aph('<div>')).append([aph('<div>'), aph('<div>')])
    assert.equal(document.body.querySelectorAll('div').length, 8)
  })

  it('should prepend an aph object to an HTMLElement', function () {
    aph('<div>').prependTo(document.body)
    aph(document.body)
      .prepend(document.createElement('div'))
      .prepend([document.createElement('div'), document.createElement('div')])
    assert.equal(document.body.querySelectorAll('div').length, 12)
  })

  it('should prepend an aph object to the HTMLElements of another aph object', function () {
    aph('<div>').prependTo(aph(document.body))
    aph(document.body)
      .prepend(aph('<div>'))
      .prepend([aph('<div>'), aph('<div>')])
    assert.equal(document.body.querySelectorAll('div').length, 16)
  })

  it('should delete all div elements', function () {
    aph('div').detach()
    assert.equal(document.body.querySelectorAll('div').length, 0)
  })

  it('should create a default page like structure with .html()', function () {
    aph(document.body).prepend(
      aph('<div>').append([
        document.createElement('header'),
        document.createElement('aside'),
        aph('<main>').append(aph('<div>')),
        aph('<footer>'),
      ])
    )

    assert.equal(aph('header').length, 1)
    assert.equal(aph('aside').length, 1)
    assert.equal(aph('main').length, 1)
    assert.equal(aph('footer').length, 1)
    aph('body *').detach()
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
    assert.equal(aph(aElement2).find('span').tagName[0], 'SPAN')
  })

  it('should filter all elements and return only spans', function () {
    const aFilteredSpans = aph('*').filter(elem => elem.tagName === 'SPAN')
    assert.equal(aFilteredSpans.tagName[0], 'SPAN')
  })

  it('should find when passed an #id selector', function () {
    aph(aElement).setAttribute('id', 'test-id')
    assert.equal(aph('#test-id').tagName[0], 'DIV')
  })

  it('should find when passed an .class selector', function () {
    aph(aElement).setAttribute('class', 'test-class')
    assert.equal(aph('.test-class').tagName[0], 'DIV')
  })

  it('should find when passed an singlet selector', function () {
    aph(aElement).setAttribute('class', 'test-class')
    assert.equal(aph('div').tagName[0], 'DIV')
  })

  it('should find when passed another Apheleia instance', function () {
    aph(aElement).setAttribute('class', 'test-class')
    assert.equal(aph(aph('div')).tagName[0], 'DIV')
  })

  it('should return all an array of items', function () {
    assert.equal(aph('*').asArray().length, 7)
  })

  it("should return null when the apheleia has no 'meta.owner' property", function () {
    const aInstance = aph('*')
    assert.equal(aInstance.aph.owner, null)
  })

  it("should return the parent Apheleia instance when 'meta.owner' is not null", function () {
    const aInstance = aph('*')
    const aNotherInstance = aInstance.find('div')
    assert.equal(aNotherInstance.aph.owner, aInstance)
  })

  it('should search for a context element when string passed as parameter', function () {
    const aInstance = aph('.test-class')
    aph('<span class="inside-class">').appendTo(aInstance[0])
    assert.isTrue(
      aph('.inside-class', '.test-class').aph.context.classList.contains(
        'test-class'
      )
    )
  })

  // TO-DO: need to create context test cases
})

describe('Element manipulation', function () {
  it('should accept an object as attributes setup', function () {
    aph(aElement).setAttribute({ style: 'width: 400px' })
    assert.equal(aElement[0].style.width, '400px')
  })

  it('should accept an object as properties setup', function () {
    aph(aElement).set({ testProperty: 11 })
    assert.equal(aElement[0].testProperty, 11)
  })
})

describe('Class manipulation', function () {
  it('should have added all classes passed as arguments', function () {
    aph('<div>').appendTo(document.body)
    aph('<div>').classList
      .add('test-class', 'test-class-2')
      .appendTo(document.body)
    assert.equal(
      aph('.test-class').classList.contains('test-class-2').some(i => i),
      true
    )
  })

  it('should return false if all divs has same class (for this test case)', function () {
    assert.equal(
      aph('div').classList.contains('test-class').every(i => i),
      false
    )
  })

  it('should return true if at least one div has the specified class', function () {
    assert.equal(aph('div').classList.contains('test-class').some(i => i), true)
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
    aph.fn.log = function () {
      this.forEach(item => console.log(item))
    }
    assert.isFunction(aph().log)
  })
})

// TO-DO
