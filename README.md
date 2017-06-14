[![Build Status](https://travis-ci.org/kaisermann/aph.svg?branch=master)](https://travis-ci.org/kaisermann/aph)

# Aph

A very lightweight (4.32 kbs minified and **1.7 kbs** gzipped), easy-to-use DOM manipulation library.

**'a', 'p', 'h'** are the first letters of **Apheleia**, the greek mythology spirit and personification of ease, simplicity and primitivity in the good sense.

**And what is simpler than writing all your code _almost_ as if you're doing it with Vanilla JS, without having to learn a new API and begin to depend on it?**

Yep, you read it right. Almost like Vanilla JS.

**Sample:**

```html
<html>
  <body>
    <span></span>
    <span></span>
    <span></span>
  </body>
  <script>
    // Behooooold
    $$('span')
      .classList.add('test-class')
      .setAttribute('custom-attr-1', 'test-value-1')
      .setAttribute({ // Passing a key/value object works as well
          'custom-attr-2': 'test-value-2',
          'custom-attr-3': 'test-value-3'
      })
      .style.setProperty({
          color: 'red',
          background: 'pink',
          padding: 10
      })
      .textContent = 'Ooooops'
  </script>
</html>
```

**Result:**

```html
...
  <span style="color: red; background: pink; padding: 10px;" class="test-class" custom-attr-1="test-value-1" custom-attr-2="test-value-2" custom-attr-3="test-value-3">
    Ooooops
  </span>
  <span style="color: red; background: pink; padding: 10px;" class="test-class" custom-attr-1="test-value-1" custom-attr-2="test-value-2" custom-attr-3="test-value-3">
    Ooooops
  </span>
  <span style="color: red; background: pink; padding: 10px;" class="test-class" custom-attr-1="test-value-1" custom-attr-2="test-value-2" custom-attr-3="test-value-3">
    Ooooops
  </span>
...
```

![](./misc/gladiator.gif)

### How does it work

`aph` initially extends all getters/setters/methods from `HTMLDivElement`. For each call to one of those methods/properties, `aph` creates a Proxy which allows you to access them as if you were dealing with the objects itself.

**Example**:
```js
1) $$('div')
Creates an Apheleia Collection around all divs

2) $$('div').classList
Returns the classList of all divs
[DOMTokenList(0), DOMTokenList(1), DOMTokenList(1)]

3) aph identifies the type of the first entry (DOMTokenList) and creates
a proxy which passes all functions to the DOMTokenList.prototype.
The array will now be considered an Apheleia Wrapper.

4) $$('div').classList.add('test-class','test-class-2')

5) *PROFIT*
```

---

Any extended method with a name beginning with `set` and not ending with a `s`, such as `.setAttribute`/`.setProperty`, can be used by passing an object of key/value pairs.

```js
$$('div').setAttribute('oneAttribute','atAtime')
$$('div').setAttribute({
  multiple: 'attributes',
  at: 'aTime'
})
```

---

All Apheleia Collections and Wrappers have these default methods:

```js
// Iterates through all items on the colleciton
// Can 'return false' to break
$$('div').style.forEach()

// Returns a mapped Apheleia Wrapper
$$('div').style.map(mapCallback)

// Returns a filtered Apheleia Wrapper
$$('div').style.filter(filterCallback)

// Generic get method for getting a property
$$('div').style.get(propName)

// Generic set method for setting properties
$$('div').style.set(propName, propValue)
$$('div').style.set({
  propName: propValue,
  propName2: propValue2,
})
```

Properties not available in `HTMLDivElement`, such as `href` on `<a>` elements, can be returned by using the `.get(propertyName)` method.

### But... what about performance?

By using Proxies, the performance hit is not that big (comparing with the old way `aph` did its thing... oh boy).

##### Let's see some benchmarks (_lower is better_)

```
Benchmark: Simple div creation
  aph x 959,167 ops/sec ±4.44% (57 runs sampled)
  cash x 193,441 ops/sec ±2.15% (52 runs sampled)
  jQuery x 620,170 ops/sec ±3.18% (57 runs sampled)
  Zepto x 387,367 ops/sec ±1.82% (58 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is cash

Benchmark: Complex div creation
  aph x 125,404 ops/sec ±2.98% (53 runs sampled)
  cash x 123,620 ops/sec ±4.23% (48 runs sampled)
  jQuery x 27,424 ops/sec ±9.45% (47 runs sampled)
  Zepto x 38,587 ops/sec ±8.82% (46 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is jQuery

Benchmark: Id selection
  aph x 1,381,814 ops/sec ±18.06% (48 runs sampled)
  cash x 1,990,307 ops/sec ±3.14% (56 runs sampled)
  jQuery x 1,561,118 ops/sec ±10.37% (56 runs sampled)
  Zepto x 1,840,907 ops/sec ±1.98% (58 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is aph

Benchmark: Class selection
  aph x 679,424 ops/sec ±7.84% (56 runs sampled)
  cash x 798,323 ops/sec ±2.84% (59 runs sampled)
  jQuery x 538,127 ops/sec ±6.58% (54 runs sampled)
  Zepto x 315,302 ops/sec ±3.01% (57 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is Zepto

Benchmark: Element selection
  aph x 1,851,634 ops/sec ±2.33% (59 runs sampled)
  cash x 1,299,823 ops/sec ±5.03% (59 runs sampled)
  jQuery x 966,448 ops/sec ±3.05% (54 runs sampled)
  Zepto x 1,170,820 ops/sec ±1.79% (58 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is jQuery

Benchmark: Complex selection
  aph x 658,141 ops/sec ±6.61% (46 runs sampled)
  cash x 675,468 ops/sec ±7.40% (51 runs sampled)
  jQuery x 500,321 ops/sec ±8.72% (53 runs sampled)
  Zepto x 515,826 ops/sec ±4.74% (50 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is jQuery

Benchmark: Adding one class
  aph x 305,814 ops/sec ±1.44% (60 runs sampled)
  cash x 521,141 ops/sec ±1.05% (61 runs sampled)
  jQuery x 150,981 ops/sec ±0.74% (61 runs sampled)
  Zepto x 93,624 ops/sec ±5.39% (56 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is Zepto

Benchmark: Adding multiple (3) class
  aph x 253,763 ops/sec ±1.31% (58 runs sampled)
  cash x 169,596 ops/sec ±1.95% (59 runs sampled)
  jQuery x 85,870 ops/sec ±0.83% (62 runs sampled)
  Zepto x 29,382 ops/sec ±0.79% (61 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is Zepto

Benchmark: Setting one attribute
  aph x 453,059 ops/sec ±1.97% (60 runs sampled)
  cash x 752,550 ops/sec ±5.99% (52 runs sampled)
  jQuery x 334,964 ops/sec ±2.81% (60 runs sampled)
  Zepto x 293,503 ops/sec ±0.69% (62 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is Zepto

Benchmark: Setting multiple (3) attribute
  aph x 229,103 ops/sec ±3.74% (58 runs sampled)
  cash x 248,571 ops/sec ±0.90% (62 runs sampled)
  jQuery x 101,650 ops/sec ±4.28% (59 runs sampled)
  Zepto x 182,067 ops/sec ±1.75% (61 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is jQuery

Benchmark: Getting css style (of all elements) - jQuery like
  aph x 34,608 ops/sec ±10.74% (45 runs sampled)
  cash x 475,026 ops/sec ±13.95% (58 runs sampled)
  jQuery x 436,623 ops/sec ±1.87% (57 runs sampled)
  Zepto x 297,087 ops/sec ±1.24% (58 runs sampled)
  ----------------------------
  Fastest is jQuery
  Slowest is aph

Benchmark: Getting css style (of all elements) - aph vanilla like
  aph x 261,804 ops/sec ±1.38% (58 runs sampled)
  cash x 509,581 ops/sec ±5.61% (59 runs sampled)
  jQuery x 449,553 ops/sec ±1.04% (60 runs sampled)
  Zepto x 275,834 ops/sec ±9.66% (62 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is Zepto

Benchmark: Setting css style - jQuery like
  aph x 135,642 ops/sec ±3.54% (56 runs sampled)
  cash x 107,408 ops/sec ±2.91% (57 runs sampled)
  jQuery x 84,212 ops/sec ±22.90% (59 runs sampled)
  Zepto x 24,581 ops/sec ±12.43% (35 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is Zepto

Benchmark: Setting css style - aph vanilla like
  aph x 62,570 ops/sec ±15.22% (42 runs sampled)
  cash x 106,431 ops/sec ±4.69% (58 runs sampled)
  jQuery x 95,453 ops/sec ±1.25% (59 runs sampled)
  Zepto x 43,774 ops/sec ±1.85% (60 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is Zepto
```

You can run the benchmarks by opening the `benchmark.html`. The benchmark results vary a little bit between executions, sometimes a library runs faster than the others.

Have some benchmarks to show me? I'll be more than thankful!
<br>
Have some suggestions or critics? Talk to me!
<br>

### [Go see the documentation!](https://github.com/kaisermann/aph/wiki)

## Browsers support <sub><sup><sub><sub>made by <a href="https://godban.github.io">godban</a></sub></sub></sup></sub>

| [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/edge.png" alt="IE / Edge" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/firefox.png" alt="Firefox" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome.png" alt="Chrome" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari.png" alt="Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/opera.png" alt="Opera" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Opera |
| --------- | --------- | --------- | --------- | --------- |
| 12+ | 18+ | 49+ | 10+ | 36+

## Credits and inspirations

- ['Cash'](https://github.com/kenwheeler/cash/)
- ['NodeList.js'](https://github.com/eorroe/NodeList.js)
- ['jQuery'](https://github.com/jquery/jquery)
