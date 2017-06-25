[![Build Status](https://travis-ci.org/kaisermann/aph.svg?branch=master)](https://travis-ci.org/kaisermann/aph)

# Aph

A very lightweight (3.6 kbs minified and **1.53 kbs** gzipped), easy-to-use DOM manipulation library.

**'a', 'p', 'h'** are the first letters of **Apheleia**, the greek mythology spirit and personification of ease, simplicity and primitivity in the good sense.

**And what is simpler than writing all your code _almost_ as if you're doing it with Vanilla JS, without having to learn a new API and begin to depend on it?**

Yep, you read it right. Almost like Vanilla JS.

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

Any extended method with a name beginning with `set` and not ending with a `s`, such as `.setAttribute`/`.setProperty`, can be used by passing an object of key/value pairs.

```js
$$('div').setAttribute('oneAttribute','atAtime')
$$('div').setAttribute({
  multiple: 'attributes',
  at: 'aTime'
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
  aph x 1,076,394 ops/sec ±3.96% (54 runs sampled)
  cash x 196,640 ops/sec ±3.95% (53 runs sampled)
  jQuery x 716,224 ops/sec ±3.10% (55 runs sampled)
  Zepto x 394,620 ops/sec ±10.15% (55 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is cash

Benchmark: Complex div creation
  aph x 126,744 ops/sec ±8.94% (53 runs sampled)
  cash x 120,484 ops/sec ±4.06% (46 runs sampled)
  jQuery x 25,937 ops/sec ±11.68% (44 runs sampled)
  Zepto x 45,721 ops/sec ±4.18% (54 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is jQuery

Benchmark: Id selection
  aph x 1,899,029 ops/sec ±7.18% (56 runs sampled)
  cash x 2,077,583 ops/sec ±7.20% (56 runs sampled)
  jQuery x 1,953,833 ops/sec ±4.37% (57 runs sampled)
  Zepto x 1,753,189 ops/sec ±4.82% (56 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is Zepto

Benchmark: Class selection
  aph x 840,071 ops/sec ±6.45% (57 runs sampled)
  cash x 747,092 ops/sec ±2.93% (58 runs sampled)
  jQuery x 359,539 ops/sec ±3.27% (56 runs sampled)
  Zepto x 313,356 ops/sec ±5.32% (53 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is Zepto

Benchmark: Element selection
  aph x 1,544,708 ops/sec ±6.70% (50 runs sampled)
  cash x 1,198,909 ops/sec ±4.69% (56 runs sampled)
  jQuery x 686,590 ops/sec ±3.14% (56 runs sampled)
  Zepto x 1,046,541 ops/sec ±5.42% (53 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is jQuery

Benchmark: Complex selection
  aph x 644,871 ops/sec ±6.49% (45 runs sampled)
  cash x 582,920 ops/sec ±10.28% (46 runs sampled)
  jQuery x 305,232 ops/sec ±7.93% (49 runs sampled)
  Zepto x 453,024 ops/sec ±9.76% (44 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is jQuery

Benchmark: Adding one class
  aph x 272,719 ops/sec ±21.85% (52 runs sampled)
  cash x 398,615 ops/sec ±6.86% (51 runs sampled)
  jQuery x 112,916 ops/sec ±2.94% (56 runs sampled)
  Zepto x 87,249 ops/sec ±5.86% (52 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is Zepto

Benchmark: Adding multiple (3) class
  aph x 253,490 ops/sec ±8.13% (51 runs sampled)
  cash x 151,915 ops/sec ±4.61% (55 runs sampled)
  jQuery x 62,151 ops/sec ±4.53% (56 runs sampled)
  Zepto x 27,138 ops/sec ±2.54% (57 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is Zepto

Benchmark: Setting one attribute
  aph x 429,247 ops/sec ±5.48% (53 runs sampled)
  cash x 740,457 ops/sec ±5.90% (58 runs sampled)
  jQuery x 281,562 ops/sec ±9.79% (48 runs sampled)
  Zepto x 255,331 ops/sec ±3.60% (57 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is Zepto

Benchmark: Setting multiple (3) attribute
  aph x 205,203 ops/sec ±4.40% (53 runs sampled)
  cash x 206,640 ops/sec ±10.12% (52 runs sampled)
  jQuery x 98,979 ops/sec ±5.06% (56 runs sampled)
  Zepto x 161,420 ops/sec ±8.95% (55 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is jQuery

Benchmark: Getting computed css style (of all elements)
  aph x 31,863 ops/sec ±9.23% (42 runs sampled)
  cash x 32,169 ops/sec ±12.47% (42 runs sampled)
  jQuery x 29,888 ops/sec ±14.63% (43 runs sampled)
  Zepto x 32,122 ops/sec ±10.18% (44 runs sampled)
  ----------------------------
  Fastest is aph
  Slowest is jQuery

Benchmark: Getting css style (of all elements)
  aph x 316,422 ops/sec ±4.75% (56 runs sampled)
  cash x 456,598 ops/sec ±6.26% (51 runs sampled)
  jQuery x 346,909 ops/sec ±20.64% (52 runs sampled)
  Zepto x 258,296 ops/sec ±5.62% (53 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is Zepto

Benchmark: Setting css style - jQuery like
  aph x 79,805 ops/sec ±4.21% (55 runs sampled)
  cash x 94,811 ops/sec ±7.65% (54 runs sampled)
  jQuery x 79,720 ops/sec ±4.44% (55 runs sampled)
  Zepto x 38,916 ops/sec ±4.69% (53 runs sampled)
  ----------------------------
  Fastest is cash
  Slowest is Zepto

Benchmark: Setting css style - aph vanilla like
  aph x 76,324 ops/sec ±16.74% (51 runs sampled)
  cash x 93,216 ops/sec ±7.22% (51 runs sampled)
  jQuery x 81,776 ops/sec ±4.51% (54 runs sampled)
  Zepto x 36,264 ops/sec ±7.37% (49 runs sampled)
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
