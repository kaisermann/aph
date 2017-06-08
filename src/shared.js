import Apheleia from './Apheleia.js'
import { propGetSetWithProp, slice, aphParseContext, isRelevantCollection } from './helpers.js'

export const protoCache = {
  Array: Array.prototype,
}

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

      what.prop = protoCache.Apheleia.prop
      what.call = protoCache.Apheleia.call
      what.owner = owner

      if (!protoCache[constructorName]) {
        protoCache[constructorName] = Object.getPrototypeOf(what[0])
      }

      // Let's get all methods of this instance and wrap them
      Object.getOwnPropertyNames(protoCache[constructorName]).forEach(key => {
        if (what[key] == null) {
          try {
            if (protoCache[constructorName][key] instanceof Function) {
              what[key] = function () {
                const result = this.map(i => {
                  return protoCache[constructorName][key].apply(i, arguments)
                })
                // Return the Apheleia Owner
                // if the result is a list of undefined
                return isRelevantCollection(result)
                  ? result
                  : owner
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

      if (what.length != null) {
        what.map = protoCache.Apheleia.map
        what.forEach = protoCache.Apheleia.forEach
      }

      return what
    }
  }
  return new Apheleia(acc, document, { owner: owner })
}
