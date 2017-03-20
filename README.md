# Aph

A very lightweight (**837 bytes** minified and gzipped), easy and simple DOM manipulation library.

**'a', 'p', 'h'** are the first letters of **Apheleia**, the greek mythology spirit and personification of ease, simplicity and primitivity in the good sense.

The goal of this library is to be a versatile and lightweight way of doing some simple DOM manipulations with vanilla JS. In no way it tries to replace any other manipulation framework such as jQuery, Zepto, Cash, etc.

**aph** uses ES6 module syntax for ease of importing it inside your code. For those concatenating scripts or including directly into the HTML, there's also an [Universal Module Definition version available](https://github.com/kaisermann/aph/tree/master/dist/aph.js).

*<span style="color: red;">This project is in active development and it's still being changed very frequently. </span>*

## Support
* **Chrome** >= 8
* **Firefox** >= 4
* **IE** >= 10
* **Edge** >= 12
* **Opera** >= 12
* **Safari** >= 5.1

## aph() Methods

### aph()

```javascript
aph(elementsOrSelector[, context])
```

Initializes a new instance of Apheleia with the specified or created elements.

If creating an element, a attribute object can be passed (pairs of attribute names and values) to assign them to the recently created element.

If the first argument is a string between `<` and `>`, aph will create the element, otherwise, it will search for it on the passed context (second parameter).

**Examples:**

```javascript
// Creates an an empty <img> element
aph('<img>')

// Search for all img elements
aph('img')

// Search for all img elements inside the <main> tag
aph('img', document.querySelector('main'))

// Search for all img elements inside the <main> tag (passing other apheleia instance)
aph('img', aph('main'))

// Search for all img elements in the document since the context does not exist
aph('img', document.querySelector('non-existent'))

// Wraps a single image Node object with aph
const singleImg = document.querySelector('img')
aph(singleImg)

// Wraps all image nodes in a NodeList with aph (can be used with arrays as well)
const allImgs = document.querySelectorAll('img')
aph(allImgs)
```

### Manipulating aph()
```javascript
// Iterates through all loaded elements
aph(...).each(function(element, index) { ... })

// Returns a new filtered Apheleia instance
aph(...).filter(function(item) { ... })

// Returns a new Apheleia instance with the discovered elements
// If single = true, returns only the first element.
// Otherwise, it returns all found elements.
aph(...).find(selector, single = false)

// Returns all elements. If index is defined, returns only the specified item.
aph(...).get([index])
```

### Manipulating the element

#### Data and properties
```javascript
// Gets the specified attribute value (first element only)
aph(...).attr(key)

// Sets the specified attribute (all elements)
aph(...).attr(key, value)

// Sets the specified attribute key/value pairs (all elements)
aph(...).attr({ key: value, key: value})

// Same as .attr(...), but with data-attributes
aph(...).data(key)
aph(...).data(key, value)
aph(...).data({key: value, key: value})

// Gets the specified node property (first element only)
aph(...).prop(key)

// Sets the specified property (all elements)
aph(...).prop(key, value)

// Sets the specified properties key/value pairs (all elements)
aph(...).prop({key: value, key: value})
```
#### Classes

```javascript
// Toggles the specified class
aph(...).toggleClass(className)

// Adds the specified class(es)
aph(...).addClass(className1[, className2[, className3[...]]])

// Removes the specified class(es)
aph(...).removeClass(className1[, className2[, className3[...]]])

// Checks if at least one element has the specified class.
// If every = true, checks if all elements have the specified class
aph(...).hasClass(className, every = false)
```
### Manipulating the DOM
```javascript
// Appends the elements to a specified node
aph(...).appendTo(HTMLElement)

// Prepends the elements to a specified node
aph(...).prependTo(HTMLElement)

// Deletes all elements from the DOM
aph(...).delete()
```

### Methods and Events
```javascript
// Calls a HTML Node function. Same as node.functionName(arg1, arg2, arg3...)
aph(...).exec(functionName, ...args)

// Makes all elements listen for the specified events (separated by spaces)
aph(...).on(events, callbackFn)

// Makes all elements remove the listener for the specified events (separated by spaces)
aph(...).off(events, callbackFn)

// Same as .on but fires only once
aph(...).once(events, callbackFn)
```

## Chaining
Almost all methods can be chained for a more fluid code.
```javascript
const aImg = aph('<img>')
  .attr({ src: 'https://lorempixel.com/500/500', id: 'test-img' })
  .addClass('img-responsive')
  .toggleClass('is-active')
  .prop('isControlled', false)
  .on('load', () => {
    console.log('Image loaded! Let\'s put it in the body.')
    aImg.appendTo(document.body))
  })
```

## aph() Static Methods

### Extending

```javascript
// Plugs in new methods to the Apheleia prototype
aph.plug(key, function(){
  ...
})
```

Extends the `Apheleia` prototype with the passed method. `this` references the Apheleia object.

**Example - a chainable log function:**

```javascript
aph.plug('log', function() {
    this.each((item, index) => {
      console.log(index, item)
    })
    return this
  })
```
