import Apheleia from './Apheleia.js'
import {
  propGetSetWithProp,
  slice,
  aphParseContext,
  isRelevantCollection,
} from './helpers.js'

export const protoCache = {
  Array: Array.prototype,
}

export const protoPropsCache = {}

export function querySelector (selector, ctx) {
  ctx = aphParseContext(ctx)
  return /^#[\w-]*$/.test(selector) // if #id
    ? [window[selector.slice(1)]]
    : slice(
        /^\.[\w-]*$/.test(selector) // if .class
          ? ctx.getElementsByClassName(selector.slice(1))
          : /^\w+$/.test(selector) // if tag (a, span, div, ...)
              ? ctx.getElementsByTagName(selector)
              : ctx.querySelectorAll(selector) // anything else
      )
}

export function flatWrap (what, owner) {
  let acc = []
  for (let i = 0, item; i < what.length; i++) {
    item = what[i]
    if (item instanceof Node || item == null) {
      // If we received a single node
      if (!~acc.indexOf(item)) {
        acc.push(item)
      }
    } else if (
      item instanceof NodeList ||
      item instanceof HTMLCollection ||
      item instanceof Apheleia ||
      item instanceof Array
    ) {
      // If we received a node list/collection
      for (let j = 0, len2 = item.length; j < len2; j++) {
        if (!~acc.indexOf(item[j])) {
          acc.push(item[j])
        }
      }
    } else {
      const constructorName = what[0].constructor.name
      const aphPrototype = protoCache.Apheleia

      what.prop = aphPrototype.prop
      what.call = aphPrototype.call
      what.map = aphPrototype.map
      what.forEach = aphPrototype.forEach
      what.owner = owner

      if (!protoCache[constructorName]) {
        protoCache[constructorName] = Object.getPrototypeOf(what[0])
      }

      if (!protoPropsCache[constructorName]) {
        protoPropsCache[constructorName] = Object.getOwnPropertyNames(
          protoCache[constructorName]
        )
      }

      // Let's get all methods of this instance and wrap them
      protoPropsCache[constructorName].forEach(key => {
        if (what[key] == null) {
          try {
            if (protoCache[constructorName][key] instanceof Function) {
              what[key] = function () {
                const args = arguments
                const result = this.map(i =>
                  protoCache[constructorName][key].apply(i, args)
                )
                return isRelevantCollection(result) ? result : this.owner
              }
            } else {
              propGetSetWithProp(what, key)
            }
          } catch (ex) {
            // If we reach this exception, we are probably dealing with a property / getter / setter
            propGetSetWithProp(what, key)
          }
        }
      })

      return what
    }
  }
  return new Apheleia(acc, document, { owner: owner })
}
