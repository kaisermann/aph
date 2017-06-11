[![Build Status](https://travis-ci.org/kaisermann/aph.svg?branch=master)](https://travis-ci.org/kaisermann/aph)

# Aph

A very lightweight (**1674 bytes** minified and gzipped), easy-to-use DOM manipulation library.

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
      .textContent = 'Ooooops'
  </script>
</html>
```

**Result:**

```html
...
  <span style="color: red; font-size: 18px; background: pink; padding: 10px;" class="test-class" custom-attr="test-attr" custom-attr-2="test-attr-2" custom-attr-3="test-attr-3">
    Ooooops
  </span>
  <span style="color: red; font-size: 18px; background: pink; padding: 10px;" class="test-class" custom-attr="test-attr" custom-attr-2="test-attr-2" custom-attr-3="test-attr-3">
    Ooooops
  </span>
  <span style="color: red; font-size: 18px; background: pink; padding: 10px;" class="test-class" custom-attr="test-attr" custom-attr-2="test-attr-2" custom-attr-3="test-attr-3">
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

3) aph identifies the type of the first entry (DOMTokenList), reads and caches its methods and properties and extends the array returned in step 2. The array will now be considered an Apheleia Wrapper.

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
// Returns an Apheleia Wrapper of its nodes styles
aph('div').style

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

As you could guess it, for you to be able to write code as I showed you up there, `aph` must do some heavy lifting behind the curtains. I have done/am doing my best to cache results and improve performance where I can. This is something you decide for yourself.

Wanna see benchmarks? I'm gonna make them some day.
<br>
Have some benchmarks for me? I'll be more than thankful!
<br>
Have some suggestions or critics? Talk to me!

### [Go see the documentation!](https://github.com/kaisermann/aph/wiki)

## Support

- Chrome >= 28
- Edge >= 12
- Firefox >= 26
- Firefox for Android 49
- IE >= 10
- iOS Safari >= 7.0
- Opera >= 15
- Safari >= 7

## Credits and inspirations

- ['Cash'](https://github.com/kenwheeler/cash/)
- ['NodeList.js'](https://github.com/eorroe/NodeList.js)
