import Apheleia from './Apheleia.js'
import { wrapPrototypeMethod, hasKey, isFn } from './helpers.js'

export const arrayPrototype = Array.prototype
export const doc = document

function aphSetWrapper (objOrKey, nothingOrValue) {
  Apheleia.prototype.set.call(this, objOrKey, nothingOrValue)
  return this.aph.owner
}

export function wrap (what, owner) {
  let acc = []

  for (let i = 0, len = what.length, item; i < len; i++) {
    item = what[i]

    if (item == null) continue

    if (item.nodeType === 1) {
      // If we received a single node
      if (acc.indexOf(item) < 0) {
        acc.push(item)
      }
    } else if (
      ((item instanceof NodeList || item.constructor instanceof Array) &&
        item[0].nodeType === 1) ||
      item.constructor === Apheleia ||
      item instanceof HTMLCollection
    ) {
      // If we received a node list/collection
      for (let j = 0, len2 = item.length; j < len2; j++) {
        if (acc.indexOf(item[j]) < 0) {
          acc.push(item[j])
        }
      }
    } else {
      what.map = Apheleia.prototype.map
      what.filter = Apheleia.prototype.filter
      what.forEach = Apheleia.prototype.forEach
      what.get = Apheleia.prototype.get
      what.set = aphSetWrapper
      what.aph = { owner: owner }

      // Returns a proxy which allows to access
      // the items methods and properties
      return new Proxy(what, {
        set (target, propKey, val) {
          target.set(propKey, val)
        },
        get (target, propKey) {
          if (hasKey(target, propKey)) {
            return target[propKey]
          }

          if (isFn(target[0][propKey])) {
            return wrapPrototypeMethod(propKey, target[0]).bind(target)
          }

          if (hasKey(target[0], propKey)) {
            return target.map(i => i[propKey])
          }

          return undefined
        },
      })
    }
  }

  return new Apheleia(acc, owner ? owner.aph.context : null, { owner: owner })
}
