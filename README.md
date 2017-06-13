[![Build Status](https://travis-ci.org/kaisermann/aph.svg?branch=master)](https://travis-ci.org/kaisermann/aph)

# Aph

A very lightweight (4.45 kbs minified and **1.6 kbs** gzipped), easy-to-use DOM manipulation library.

**'a', 'p', 'h'** are the first letters of **Apheleia**, the greek mythology spirit and personification of ease, simplicity and primitivity in the good sense.

**And what is simpler than writing all your code _almost_ as if you're doing it with Vanilla JS?**

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
    aph('span')
      .classList.add('test-class')
      .setAttribute('custom-attr', 'test-attr')
      .setAttribute({
          'custom-attr-2': 'test-attr-2',
          'custom-attr-3': 'test-attr-3'
      })
      .style.setProperty({
          color: 'red',
          background: 'pink',
          padding: 10
      })
      .set('textContent', 'Ooooops') // I said 'almost like vanilla', right
  </script>
</html>
```

**Result:**

```html
...
  <span style="color: red; background: pink; padding: 10px;" class="test-class" custom-attr="test-attr" custom-attr-2="test-attr-2" custom-attr-3="test-attr-3">
    Ooooops
  </span>
  <span style="color: red; background: pink; padding: 10px;" class="test-class" custom-attr="test-attr" custom-attr-2="test-attr-2" custom-attr-3="test-attr-3">
    Ooooops
  </span>
  <span style="color: red; background: pink; padding: 10px;" class="test-class" custom-attr="test-attr" custom-attr-2="test-attr-2" custom-attr-3="test-attr-3">
    Ooooops
  </span>
...
```

![](./misc/gladiator.gif)

### How does it work

`aph` initially extends almost all methods from `Array.prototype` and all getters/setters/methods from `HTMLElement`. For each call to one of those methods/properties, `aph` detects the methods and properties of the returned value and extends the current context with it.

**Example**:
```js
1) aph('div')
Creates an Apheleia Collection around all divs

2) aph('div').classList
Returns the classList of all divs
[DOMTokenList(0), DOMTokenList(1), DOMTokenList(1)]

3) aph identifies the type of the first entry (DOMTokenList), reads and caches its prototype methods and extends the array returned in step 2. The array will now be considered an Apheleia Wrapper.

4) aph('div').classList.add('test-class','test-class-2')

5) *PROFIT*
```

---

Any extended method with a name beginning with `set` and not ending with a `s`, such as `.setAttribute`/`.setProperty`, can be used by passing an object of key/value pairs.

```js
aph('div').setAttribute('oneAttribute','atAtime')
aph('div').setAttribute({
  multiple: 'attributes',
  at: 'aTime'
})
```

---

All Apheleia Collection or Wrapper have these default methods:

```js
// Iterates through all items on the colleciton
// Can 'return false' to break
aph('div').style.forEach()

// Returns a mapped Apheleia Wrapper
aph('div').style.map(mapCallback)

// Returns a filtered Apheleia Wrapper
aph('div').style.filter(filterCallback)

// Executes a function on all items on the collection
aph('div').style.call(functionName)

// Generic get method for getting a property
aph('div').style.get(propName)

// Generic set method for setting properties
aph('div').style.set(propName, propValue)
aph('div').style.set({
  propName: propValue,
  propName2: propValue2,
})
```

Properties not available in `HTMLElement`, such as `href` on `<a>` elements, can be returned by using the `.get(propertyName)` method.

### But... what about performance?

As you could guess it, for you to be able to write code as I showed you up there, `aph` must do some heavy lifting behind the curtains. I have done/am doing my best to cache results and improve performance where I can. This is a trade-off you have to decide for yourself.

##### Let's see some benchmarks (_lower is better_)

```
Simple div creation
  aph - 7.424999999999997 msecs
  jQuery - 7.5800000000000125 msecs
  Zepto - 14.754999999999995 msecs
  cash - 27.539999999999978 msecs
  ----------------------------------
  Average:  14.324999999999996 msecs

Complex div creation
  aph - 8.33499999999998 msecs
  cash - 33 msecs
  Zepto - 82.27999999999997 msecs
  jQuery - 135.61999999999998 msecs
  ----------------------------------
  Average:  64.80874999999997 msecs

Id selection
  cash - 4.2549999999999955 msecs
  Zepto - 4.649999999999977 msecs
  jQuery - 4.784999999999968 msecs
  aph - 10.879999999999995 msecs
  ----------------------------------
  Average:  6.142499999999984 msecs

Class selection
  cash - 6.795000000000016 msecs
  aph - 8.670000000000016 msecs
  Zepto - 12.715000000000032 msecs
  jQuery - 13.539999999999964 msecs
  ----------------------------------
  Average:  10.430000000000007 msecs

Element selection
  cash - 5.639999999999986 msecs
  aph - 7.065000000000055 msecs
  Zepto - 10.769999999999982 msecs
  jQuery - 19.160000000000082 msecs
  ----------------------------------
  Average:  10.658750000000026 msecs

Complex selection
  cash - 6.860000000000014 msecs
  Zepto - 8.389999999999986 msecs
  aph - 9.649999999999977 msecs
  jQuery - 11.470000000000027 msecs
  ----------------------------------
  Average:  9.092500000000001 msecs

Adding one class
  cash - 10.114999999999895 msecs
  jQuery - 22.264999999999986 msecs
  Zepto - 39.49499999999989 msecs
  aph - 155.14499999999998 msecs
  ----------------------------------
  Average:  56.75499999999994 msecs

Adding multiple (3) class
  cash - 22.850000000000136 msecs
  jQuery - 30.82000000000005 msecs
  Zepto - 98.30499999999984 msecs
  aph - 149.765 msecs
  ----------------------------------
  Average:  75.435 msecs

Setting one attribute
  cash - 6.875000000000227 msecs
  jQuery - 15.88000000000011 msecs
  Zepto - 17.60499999999979 msecs
  aph - 21.940000000000055 msecs
  ----------------------------------
  Average:  15.575000000000045 msecs

Setting multiple (3) attribute
  cash - 19.49000000000001 msecs
  aph - 24.804999999999836 msecs
  Zepto - 31.560000000000173 msecs
  jQuery - 53.409999999999854 msecs
  ----------------------------------
  Average:  32.31624999999997 msecs

Setting css style (jquery like)
  cash - 43.29500000000007 msecs
  aph - 52.5 msecs
  jQuery - 52.87999999999988 msecs
  Zepto - 87.31500000000005 msecs
  ----------------------------------
  Average:  58.9975 msecs

Setting css style (aph semi-vanilla way)
  aph - 371.4399999999998 msecs
  ----------------------------------
  Average:  371.4399999999998 msecs

Getting css style (jquery like)
  Zepto - 3.875 msecs
  jQuery - 23.799999999999727 msecs
  cash - 26.184999999999945 msecs
  aph - 166.31000000000017 msecs
  ----------------------------------
  Average:  55.04249999999996 msecs

Getting css style (aph semi-vanilla way)
  aph - 408.66499999999996 msecs
  ----------------------------------
  Average:  408.66499999999996 msecs
```

You can run the benchmarks by opening the `benchmark.html` for the browser benchmark or by using `yarn run benchmark` for the node benchmark.

Obs¹: The benchmark results vary a little bit between executions, sometimes a library runs faster than the others.

Obs²: for some reason, the node benchmark does not complete the class and style profiles.

Have some benchmarks to show me? I'll be more than thankful!
<br>
Have some suggestions or critics? Talk to me!
<br>

### [Go see the documentation!](https://github.com/kaisermann/aph/wiki)

## Support

- Chrome 13+
- Firefox 4+
- IE 10+
- Edge 12+
- Safari 5.1+
- Opera 12+
- Android Browser 4.4.4+
- iOS Safari 7.0-7.1+
- Blackberry Browser 7+
- Chrome for Android 53+
- Firefox for Android 49+

## Credits and inspirations

- ['Cash'](https://github.com/kenwheeler/cash/)
- ['NodeList.js'](https://github.com/eorroe/NodeList.js)
