// We use 'domino' here because
// 'jsdom-global' doesn't work for some reason :()
global.window = require('domino').createWindow('', '')
global.document = global.window.document
require('colors')

const aph = require('./dist/aph.js')
const jQuery = require('jquery')
const cash = require('cash-dom')
const Zepto = require('zepto-node')(window)
const Benchmark = require('benchmark')

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
  aph('<h2 data-attribute="test">Heading 2</h2>').repeat(2),
])

const scriptNames = ['aph', 'cash', 'jQuery', 'Zepto']
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
      const slowest = this.filter('slowest').map('name')
      console.log(
        `\nFastest is ${fastest}`[~fastest.indexOf('aph') ? 'bgCyan' : 'bgRed']
      )
      console.log(`Slowest is ${slowest}`)
      console.log('\n------------------\n')
    })
    .run()
}

profile('id selection', [
  () => aph('#test-id'),
  () => cash('#test-id'),
  () => jQuery('#test-id'),
  () => Zepto('#test-id'),
])

profile('class selection', [
  () => aph('.test-class'),
  () => cash('.test-class'),
  () => jQuery('.test-class'),
  () => Zepto('.test-class'),
])

profile('element selection', [
  () => aph('h1'),
  () => cash('h1'),
  () => jQuery('h1'),
  () => Zepto('h1'),
])

profile('complex selection', [
  () => aph('body h2[data-attribute="test"]'),
  () => cash('body h2[data-attribute="test"]'),
  () => jQuery('body h2[data-attribute="test"]'),
  () => Zepto('body h2[data-attribute="test"]'),
])

process.exit()
