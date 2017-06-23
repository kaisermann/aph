/* global $$ */

$$.fn.log = function () {
  return this.forEach(item => console.log(item))
}

$$.fn.repeat = function (numberOfClones) {
  let repeatedElements = []
  let cachedElements = this.asArray()
  for (let i = numberOfClones; i--;) {
    repeatedElements = repeatedElements.concat(
      cachedElements.map(item => item.cloneNode(true))
    )
  }
  return $$(repeatedElements, this.context, this)
}

$$.fn.clone = function () {
  return this.repeat(1)
}

$$.fn.concat = function () {
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
  return $$(sum, this.meta.context, { parent: this })
}
