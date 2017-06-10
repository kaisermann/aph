[![Build Status](https://travis-ci.org/kaisermann/aph.svg?branch=master)](https://travis-ci.org/kaisermann/aph)

# Aph

A very lightweight (**1654 bytes** minified and gzipped), easy-to-use DOM manipulation library.

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
