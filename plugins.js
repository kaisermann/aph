/* global aph */

aph.plug('log', function () {
  return this.each(item => console.log(item))
})

aph.plug('repeat', function (numberOfClones) {
  let repeatedElements = []
  let cachedElements = this.get()
  for (let i = numberOfClones; i--;) {
    repeatedElements = repeatedElements.concat(
      cachedElements.map(item => item.cloneNode())
    )
  }
  return aph(repeatedElements, this.context, this)
})
