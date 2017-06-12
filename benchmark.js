global.window = require('domino').createWindow('', '')
global.document = window.document

const aph = require('./dist/aph.js')
const jquery = require('jquery')
const cash = require('cash-dom')
const Benchmark = require('benchmark')
require('colors')

aph.fn.repeat = function (numberOfClones) {
  let repeatedElements = []
  let cachedElements = this.asArray()
  for (let i = numberOfClones; i--;) {
    repeatedElements = repeatedElements.concat(
      cachedElements.map(item => item.cloneNode())
    )
  }
  return aph(repeatedElements, this.context, this)
}

aph('body').append([
  aph('<div id="test-id">'),
  aph('<span class="test-class">').repeat(5),
  aph('<h1>Heading 1</h1>').repeat(2),
])

const scriptNames = ['aph', 'cash', 'jquery']
function profile (name, tests) {
  const suite = new Benchmark.Suite(name)
  tests.forEach((test, i) => suite.add(scriptNames[i], test))
  suite
    .on('start', function () {
      console.log(`Starting benchmark: ${this.name} \n`.green)
    })
    .on('cycle', event => console.log(String(event.target).yellow))
    .on('complete', function () {
      const fastest = this.filter('fastest').map('name')
      if (~fastest.indexOf('aph')) {
        console.log(`\nFastest is ${fastest}`.cyan)
      } else {
        console.log(`\nFastest is ${fastest}`.red)
      }
      console.log('\n------------------\n')
    })
    .run()
}

profile('id selection', [
  () => aph('#test-id'),
  () => cash('#test-id'),
  () => jquery('#test-id'),
])

profile('class selection', [
  () => aph('.test-class'),
  () => cash('.test-class'),
  () => jquery('.test-class'),
])

profile('element selection', [
  () => aph('h1'),
  () => cash('h1'),
  () => jquery('h1'),
])

process.exit()
