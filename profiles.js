const startProfiling = function (profile, libs) {
  const [aph, cash, jQuery, Zepto] = libs

  aph('body').append([
    aph('<div id="test-id">'),
    aph('<span class="test-class">').repeat(5),
    aph('<h1>Heading 1</h1>').repeat(2),
    aph('<h2 data-attribute="test">Heading 2</h2>').repeat(2),
  ])

  const aphCache = aph('span')
  const cashCache = cash('span')
  const jQueryCache = jQuery('span')
  const ZeptoCache = Zepto('span')

  profile('simple div creation', [
    () => aph('<div>'),
    () => cash('<div>'),
    () => jQuery('<div>'),
    () => Zepto('<div>'),
  ])

  profile('complex div creation', [
    () => aph('<div style="background-color: pink">Opa!!</div>'),
    () => cash('<div style="background-color: pink">Opa!!</div>'),
    () => jQuery('<div style="background-color: pink">Opa!!</div>'),
    () => Zepto('<div style="background-color: pink">Opa!!</div>'),
  ])

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

  profile('adding one class', [
    () => aphCache.classList.add('new-class-0'),
    () => cashCache.addClass('new-class-0'),
    () => jQueryCache.addClass('new-class-0'),
    () => ZeptoCache.addClass('new-class-0'),
  ])

  profile('adding multiple (3) class', [
    () => aphCache.classList.add('new-class-1', 'new-class-2', 'new-class-3'),
    () => cashCache.addClass('new-class-1 new-class-2 new-class-3'),
    () => jQueryCache.addClass('new-class-1 new-class-2 new-class-3'),
    () => ZeptoCache.addClass('new-class-1 new-class-2 new-class-3'),
  ])
}

if (typeof exports === 'object' && typeof module !== 'undefined') {
  module.exports = startProfiling
} else {
  window.startProfiling = startProfiling
}
