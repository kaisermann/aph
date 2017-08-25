[![Build Status](https://travis-ci.org/kaisermann/aph.svg?branch=master)](https://travis-ci.org/kaisermann/aph)

# Aph

A very lightweight (3.69 kbs minified and **1.58 kbs** gzipped), easy-to-use DOM manipulation library.

**'a', 'p', 'h'** are the first letters of **Apheleia**, the greek mythology spirit and personification of ease, simplicity and primitivity in the good sense.

### [Live samples](https://github.com/kaisermann/aph/wiki/Live-Samples)

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

### What for?

`aph` was developed with the following goals:
  1. Being an easy way to create elements without writing repeating code;
  2. Manipulate a collection of HTML Elements without writing lots of `for()`/`.forEach()`/`...`;
  3. Be, barely, API-Less. Vanilla JS is awesome,

### How does it work

`aph` creates a Proxy which allows you to access properties and methods of nodes inside a node collection as if you were dealing with the nodes itself.

**Example**:
```js
1) $$('div')
Creates an Apheleia Collection around all divs and returns a proxy.

2) $$('div').classList
Returns a proxy of the classList of all divs
[DOMTokenList(0), DOMTokenList(1), DOMTokenList(1)]

3) aph identifies the type of the first entry (DOMTokenList) and creates
a proxy which passes all functions to the DOMTokenList.prototype.

4) $$('div').classList.add('test-class','test-class-2')

5) *PROFIT*
```

---

Any extended method with a name beginning with `set`/`add`/`remove` and not ending with a `s`, such as `.setAttribute`/`.setProperty`/`.addEventListener`/`.removeEventListener`, can be used by passing an object of key/value pairs.

```js
$$('div').setAttribute('oneAttribute','atAtime')
$$('div').setAttribute({
  multiple: 'attributes',
  at: 'aTime'
})

$$(window).addEventListener({
  click() { ... },
  mousemove() { ... },
})
```

---

All Apheleia Collections and Proxies have these default methods:

```js
// Iterates through all items on the colleciton
// Can 'return false' to break
$$('div').style.forEach()

// Returns a mapped Apheleia Collection or Proxy
$$('div').style.map(mapCallback)

// Returns a filtered Apheleia Collection or Proxy
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

### But... what about performance?

By using Proxies, the performance hit is not that big (comparing with the old way `aph` did its thing... oh boy. Seriously, don't try to polyfill Proxies).

##### Let's see some benchmarks

```
Benchmark: Simple div creation
  aph x 697,095 ops/sec ±8.49% (52 runs sampled)
  cash x 175,625 ops/sec ±4.20% (53 runs sampled)
  jQuery x 623,124 ops/sec ±3.15% (56 runs sampled)
  Zepto x 326,565 ops/sec ±8.89% (46 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is cash

Benchmark: Complex div creation
  aph x 119,158 ops/sec ±4.57% (51 runs sampled)
  cash x 115,386 ops/sec ±7.91% (41 runs sampled)
  jQuery x 21,439 ops/sec ±15.99% (38 runs sampled)
  Zepto x 37,397 ops/sec ±7.12% (46 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is jQuery

Benchmark: Id selection
  aph x 1,492,274 ops/sec ±4.82% (55 runs sampled)
  cash x 1,991,370 ops/sec ±4.10% (55 runs sampled)
  jQuery x 1,851,096 ops/sec ±5.84% (52 runs sampled)
  Zepto x 1,835,254 ops/sec ±5.58% (55 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is aph

Benchmark: Class selection
  aph x 511,055 ops/sec ±8.88% (47 runs sampled)
  cash x 689,637 ops/sec ±4.79% (49 runs sampled)
  jQuery x 476,023 ops/sec ±6.22% (56 runs sampled)
  Zepto x 324,459 ops/sec ±8.25% (54 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is Zepto

Benchmark: Element selection
  aph x 1,233,570 ops/sec ±3.79% (60 runs sampled)
  cash x 1,302,730 ops/sec ±3.14% (57 runs sampled)
  jQuery x 806,562 ops/sec ±4.78% (57 runs sampled)
  Zepto x 1,155,462 ops/sec ±4.00% (60 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is jQuery

Benchmark: Complex selection
  aph x 589,983 ops/sec ±9.39% (42 runs sampled)
  cash x 593,743 ops/sec ±10.65% (42 runs sampled)
  jQuery x 343,410 ops/sec ±5.01% (49 runs sampled)
  Zepto x 429,005 ops/sec ±9.59% (48 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is jQuery

Benchmark: Adding one class
  aph x 236,713 ops/sec ±1.52% (58 runs sampled)
  cash x 407,568 ops/sec ±4.30% (56 runs sampled)
  jQuery x 115,311 ops/sec ±3.18% (58 runs sampled)
  Zepto x 91,990 ops/sec ±1.94% (58 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is Zepto

Benchmark: Adding multiple (3) class
  aph x 178,608 ops/sec ±5.62% (52 runs sampled)
  cash x 123,448 ops/sec ±15.10% (47 runs sampled)
  jQuery x 51,439 ops/sec ±7.52% (50 runs sampled)
  Zepto x 26,385 ops/sec ±6.18% (54 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is Zepto

Benchmark: Setting one attribute
  aph x 307,227 ops/sec ±7.05% (52 runs sampled)
  cash x 663,169 ops/sec ±8.20% (51 runs sampled)
  jQuery x 357,702 ops/sec ±3.47% (59 runs sampled)
  Zepto x 268,479 ops/sec ±4.15% (60 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is Zepto

Benchmark: Setting multiple (3) attribute
  aph x 153,532 ops/sec ±1.45% (59 runs sampled)
  cash x 237,046 ops/sec ±4.84% (57 runs sampled)
  jQuery x 110,607 ops/sec ±2.79% (59 runs sampled)
  Zepto x 186,123 ops/sec ±4.78% (59 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is jQuery

Benchmark: Getting computed css style (of all elements)
  aph x 32,477 ops/sec ±8.29% (45 runs sampled)
  cash x 32,312 ops/sec ±9.49% (45 runs sampled)
  jQuery x 31,029 ops/sec ±13.30% (41 runs sampled)
  Zepto x 32,971 ops/sec ±11.85% (44 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is jQuery

Benchmark: Getting css style (of all elements)
  aph x 202,870 ops/sec ±3.40% (55 runs sampled)
  cash x 409,659 ops/sec ±8.07% (48 runs sampled)
  jQuery x 406,826 ops/sec ±5.20% (54 runs sampled)
  Zepto x 257,879 ops/sec ±7.84% (54 runs sampled)
  ----------------------------
  Fastest is jQuery
  Slowest is aph

Benchmark: Setting css style - jQuery like
  aph x 131,163 ops/sec ±1.33% (60 runs sampled)
  cash x 99,860 ops/sec ±5.22% (55 runs sampled)
  jQuery x 97,377 ops/sec ±1.32% (59 runs sampled)
  Zepto x 38,479 ops/sec ±6.10% (50 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is Zepto

Benchmark: Setting css style - aph vanilla like
  aph x 70,945 ops/sec ±8.53% (49 runs sampled)
  cash x 89,154 ops/sec ±8.38% (53 runs sampled)
  jQuery x 90,009 ops/sec ±6.20% (56 runs sampled)
  Zepto x 46,101 ops/sec ±1.60% (59 runs sampled)
  ----------------------------
  Fastest is jQuery
  Slowest is Zepto
```

You can run the benchmarks by opening the `benchmark.html`. The benchmark results vary a little bit between executions, sometimes a library runs faster than the others.

Have some benchmarks to show me? I'll be more than thankful!
<br>
Have some suggestions or critics? Talk to me!
<br>

### [Go see the documentation!](https://github.com/kaisermann/aph/wiki)


#### Why the `dist` code is not transpiled?

We're already using Proxies, which cannot be polyfilled, so we're already stuck with ES6. Might as well write the rest of the code with ES6 too ;)


## Browsers support <sub><sup><sub><sub>made by <a href="https://godban.github.io">godban</a></sub></sub></sup></sub>

| [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/edge.png" alt="IE / Edge" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/firefox.png" alt="Firefox" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome.png" alt="Chrome" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari.png" alt="Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/opera.png" alt="Opera" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Opera |
| --------- | --------- | --------- | --------- | --------- |
| 12+ | 18+ | 49+ | 10+ | 36+


## Credits and inspirations

- [Cash](https://github.com/kenwheeler/cash/)
- [NodeList.js](https://github.com/eorroe/NodeList.js)
- [jQuery](https://github.com/jquery/jquery)
