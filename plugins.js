/* global aph */

aph.fn.log = function () {
  return this.forEach(item => console.log(item))
}

aph.fn.repeat = function (numberOfClones) {
  let repeatedElements = []
  let cachedElements = this.get()
  for (let i = numberOfClones; i--;) {
    repeatedElements = repeatedElements.concat(
      cachedElements.map(item => item.cloneNode())
    )
  }
  return aph(repeatedElements, this.context, this)
}

aph.fn.concat = function () {
  function iterate (what, doing) {
    for (let i = 0, len = what.length; i < len; i++) {
      doing(what[i])
    }
  }
  let sum = this.get()
  iterate(arguments, arg => {
    if (arg instanceof Node) sum.push(arg)
    else if (arg && '' + arg !== arg && arg.length) {
      iterate(arg, subArg => {
        if (sum.indexOf(subArg) < 0) {
          sum.push(subArg)
        }
      })
    }
  })
  return aph(sum, this.meta.context, { parent: this })
}
