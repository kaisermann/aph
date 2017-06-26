require('jsdom-global')()

const test = require('ava')
const $$ = require('../dist/aph')

test('should chain every non-relevant-returned calls', function (t) {
  t.notThrows(function () {
    $$('body').append(
      $$('<div>')
        .setAttribute({
          attr1: 'value1',
          attr2: 'value2',
        })
        .style.setProperty({
          background: 'red',
          color: 'white',
          width: '200px',
          height: '200px',
        })
        .set({
          prop1: 'value1',
          prop2: 'value2',
        })
        .classList.add('single-class')
        .classList.add('multiple', 'classes')
        .addEventListener({
          click () {
            console.log('click')
          },
          mousemove () {
            console.log('mouse move')
          },
        })
    )
  })
  t.is($$('div').length, 1)

  const div = $$('div')[0]
  t.is(div.getAttribute('attr1'), 'value1')
  t.is(div.getAttribute('attr2'), 'value2')
  t.is(div.style.background, 'red')
  t.is(div.style.color, 'white')
  t.is(div.style.width, '200px')
  t.is(div.style.height, '200px')
  t.is(div.prop1, 'value1')
  t.is(div.prop2, 'value2')
  t.is(div.classList.contains('single-class'), true)
  t.is(div.classList.contains('multiple'), true)
  t.is(div.classList.contains('classes'), true)
})
