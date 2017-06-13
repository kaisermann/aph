const startProfiling = function (profile, libs) {
  const [aph, cash, jQuery, Zepto] = libs

  cash.fn.map = function (cb) {
    return cash(Array.prototype.map.call(this, cb))
  }

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

  profile('Simple div creation', [
    () => aph('<div>'),
    () => cash('<div>'),
    () => jQuery('<div>'),
    () => Zepto('<div>'),
  ])

  profile('Complex div creation', [
    () => aph('<div style="background-color: pink">Hello!!</div>'),
    () => cash('<div style="background-color: pink">Hello!!</div>'),
    () => jQuery('<div style="background-color: pink">Hello!!</div>'),
    () => Zepto('<div style="background-color: pink">Hello!!</div>'),
  ])

  profile('Id selection', [
    () => aph('#test-id'),
    () => cash('#test-id'),
    () => jQuery('#test-id'),
    () => Zepto('#test-id'),
  ])

  profile('Class selection', [
    () => aph('.test-class'),
    () => cash('.test-class'),
    () => jQuery('.test-class'),
    () => Zepto('.test-class'),
  ])

  profile('Element selection', [
    () => aph('h1'),
    () => cash('h1'),
    () => jQuery('h1'),
    () => Zepto('h1'),
  ])

  profile('Complex selection', [
    () => aph('body h2[data-attribute="test"]'),
    () => cash('body h2[data-attribute="test"]'),
    () => jQuery('body h2[data-attribute="test"]'),
    () => Zepto('body h2[data-attribute="test"]'),
  ])

  profile('Adding one class', [
    () => aphCache.classList.add('new-class-0'),
    () => cashCache.addClass('new-class-0'),
    () => jQueryCache.addClass('new-class-0'),
    () => ZeptoCache.addClass('new-class-0'),
  ])

  profile('Adding multiple (3) class', [
    () => aphCache.classList.add('new-class-1', 'new-class-2', 'new-class-3'),
    () => cashCache.addClass('new-class-1 new-class-2 new-class-3'),
    () => jQueryCache.addClass('new-class-1 new-class-2 new-class-3'),
    () => ZeptoCache.addClass('new-class-1 new-class-2 new-class-3'),
  ])

  profile('Setting one attribute', [
    () => aphCache.setAttribute('custom-attribute', 'test-value'),
    () => cashCache.attr('custom-attribute', 'test-value'),
    () => jQueryCache.attr('custom-attribute', 'test-value'),
    () => ZeptoCache.attr('custom-attribute', 'test-value'),
  ])

  profile('Setting multiple (3) attribute', [
    () =>
      aphCache.setAttribute({
        'custom-attribute-1': 'test-value-1',
        'custom-attribute-2': 'test-value-2',
        'custom-attribute-3': 'test-value-3',
      }),
    () =>
      cashCache.attr({
        'custom-attribute-1': 'test-value-1',
        'custom-attribute-2': 'test-value-2',
        'custom-attribute-3': 'test-value-3',
      }),
    () =>
      jQueryCache.attr({
        'custom-attribute-1': 'test-value-1',
        'custom-attribute-2': 'test-value-2',
        'custom-attribute-3': 'test-value-3',
      }),
    () =>
      ZeptoCache.attr({
        'custom-attribute-1': 'test-value-1',
        'custom-attribute-2': 'test-value-2',
        'custom-attribute-3': 'test-value-3',
      }),
  ])

  profile('Getting css style (jquery like)', [
    () => aphCache.css('background'),
    () => cashCache.map((item, i) => item.style.background),
    () => jQueryCache.map((i, item) => item.style.background),
    () => ZeptoCache.map((i, item) => item.style.background),
  ])

  profile('Getting css style (aph vanilla way)', [
    () => aphCache.style.background,
    () => cashCache.map((item, i) => item.style.background),
    () => jQueryCache.map((i, item) => item.style.background),
    () => ZeptoCache.map((i, item) => item.style.background),
  ])

  profile('Setting css style (jquery like)', [
    () => aphCache.css('background', 'green'),
    () => cashCache.css('background', 'green'),
    () => jQueryCache.css('background', 'green'),
    () => ZeptoCache.css('background', 'green'),
  ])

  profile('Setting css style (aph vanilla way)', [
    () => (aphCache.style.background = 'green'),
    () => cashCache.css('background', 'green'),
    () => jQueryCache.css('background', 'green'),
    () => ZeptoCache.css('background', 'green'),
  ])
}

if (typeof exports === 'object' && typeof module !== 'undefined') {
  module.exports = startProfiling
} else {
  window.startProfiling = startProfiling
}
