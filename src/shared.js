import Apheleia from './Apheleia.js'
import {
  slice,
  aphParseContext,
  assignMethodsAndProperties,
} from './helpers.js'

export const arrayProto = Array.prototype

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
  for (let i = 0, len = what.length, item; i < len; i++) {
    item = what[i]
    if (item != null) {
      if (item instanceof Node) {
        // If we received a single node
        if (!~acc.indexOf(item)) {
          acc.push(item)
        }
      } else if (
        item instanceof NodeList ||
        item instanceof HTMLCollection ||
        item instanceof Apheleia ||
        (item instanceof Array && item[0] instanceof Node)
      ) {
        // If we received a node list/collection
        for (let j = 0, len2 = item.length; j < len2; j++) {
          if (!~acc.indexOf(item[j])) {
            acc.push(item[j])
          }
        }
      } else {
        let sampleEntry
        // Iterate through the result to find a non-null value
        for (
          let counter = 0;
          sampleEntry == null && counter < what.length;
          sampleEntry = what[counter++]
        );

        const methodsToBeCopied = ['map', 'filter', 'forEach', 'get']
        methodsToBeCopied.forEach(function (key) {
          what[key] = Apheleia.prototype[key]
        })
        what.set = function () {
          Apheleia.prototype.set.apply(this, arguments)
          return this.aph.owner
        }
        what.aph = { owner: owner }

        // If we're dealing with objects, let's iterate through it's methods
        // If not, we're dealing with primitibe types and
        // we should use it's prototype instead
        assignMethodsAndProperties(
          what,
          sampleEntry,
          instance => instance.aph.owner
        )

        return what
      }
    }
  }

  return new Apheleia(acc, owner.aph.context, { owner: owner })
}
