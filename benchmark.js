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

require('./profiles.js')(profile, [aph, cash, jQuery, Zepto])

process.exit()
