require('jsdom-global')()

const test = require('ava')
const aph = require('../dist/aph')

test('should create a .log() plugin that logs all the instance loaded elements', function (
  t
) {
  aph.fn.log = function () {
    this.forEach(item => console.log(item))
  }
  t.is(typeof aph().log, 'function')
})
