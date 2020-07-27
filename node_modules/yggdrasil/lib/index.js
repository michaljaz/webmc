'use strict'

/**
 * Shim the library to make the API 100% backwards compatible with the old version.
 */

const Client = require('./Client')
const Server = require('./Server')

const Yggdrasil = function (options) {
  return Object.assign({}, Client, options)
}

Yggdrasil.server = function (options) {
  return Object.assign({}, Server, options)
}

module.exports = Yggdrasil
