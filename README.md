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

`aph` initially extends almost all methods from `Array.prototype` and all getters/setters/methods from `HTMLElement`. For each call to one of those methods/properties, `aph` creates a Proxy which allows you to access them as if you were dealing with the object itself.

**Example**:
```js
1) aph('div')
Creates an Apheleia Collection around all divs

2) aph('div').classList
Returns the classList of all divs
[DOMTokenList(0), DOMTokenList(1), DOMTokenList(1)]

3) aph identifies the type of the first entry (DOMTokenList) and creates a proxy which passes all functions to the DOMTokenList.prototype. The array will now be considered an Apheleia Wrapper.

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

All Apheleia Collections and Wrappers have these default methods:

```js
// Iterates through all items on the colleciton
// Can 'return false' to break
aph('div').style.forEach()

// Returns a mapped Apheleia Wrapper
aph('div').style.map(mapCallback)

// Returns a filtered Apheleia Wrapper
aph('div').style.filter(filterCallback)

// Generic get method for getting a property
aph('div').style.get(propName)

// Generic set method for setting properties
aph('div').style.set(propName, propValue)
aph('div').style.set({
  propName: propValue,
  propName2: propValue2,
})
```

Properties not available in `HTMLDivElement`, such as `href` on `<a>` elements, can be returned by using the `.get(propertyName)` method.

### But... what about performance?

As you could guess it, for you to be able to write code as I showed you up there, `aph` must do some heavy lifting behind the curtains. I have done/am doing my best to cache results and improve performance where I can. This is a trade-off you have to decide for yourself.

##### Let's see some benchmarks (_lower is better_)

```

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
