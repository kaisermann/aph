[![Build Status](https://travis-ci.org/kaisermann/aph.svg?branch=master)](https://travis-ci.org/kaisermann/aph)

## Aph

A very lightweight (**1539 bytes** minified and gzipped), easy-to-use DOM manipulation library.

**'a', 'p', 'h'** are the first letters of **Apheleia**, the greek mythology spirit and personification of ease, simplicity and primitivity in the good sense.

**And what is simpler than writing all your code *almost* as if you're doing it with Vanilla JS?**

Yep, you read it right. Almost like Vanilla JS.

**Sample:**
```html
<html>
  <body>
    <span></span>
  </body>
  <script>
    // Behooooold
    aph('span')
      .classList.add('test-class')
      .setAttribute('id', 'test-id')
      .style.setProperty('color', 'red')
      .textContent = 'Ops'
  </script>
</html>
```

**Result:**
```html
...
  <span style="color: red" class="test-class" id="test-id">
    Ops
  </span>
...
```

<p align="center">
  <img src="./misc/gladiator.gif">
</p>

#### [Go check the Documentation!](https://github.com/kaisermann/aph/wiki)

### Support
* Chrome >= 28
* Edge >= 12
* Firefox >= 26
* Firefox for Android 49
* IE >= 10
* iOS Safari >= 7.0
* Opera >= 15
* Safari >= 7


### Credits and inspirations
* ['NodeList.js'](https://github.com/eorroe/NodeList.js)
