'use strict'

const uuid = require('uuid')
const utils = require('./utils')

const Client = {}

const defaultHost = 'https://authserver.mojang.com'

/**
 * Attempts to authenticate a user.
 * @param  {Object}   options Config object
 * @param  {Function} cb      Callback
 */
Client.auth = function (options, cb) {
  const host = this.host || defaultHost

  if (options.token === null) {
    delete options.token
  } else {
    options.token = options.token || uuid.v4()
  }

  options.agent = options.agent || 'Minecraft'
  utils.call(host, 'authenticate', {
    agent: {
      name: options.agent,
      version: options.agent === 'Minecraft' ? 1 : options.version
    },
    username: options.user,
    password: options.pass,
    clientToken: options.token,
    requestUser: options.requestUser === true
  }, this.agent, function (err, data) {
    cb(err, data)
  })
}

/**
 * Refreshes a accessToken.
 * @param  {String}   access Old Access Token
 * @param  {String}   client Client Token
 * @param  {Function} cb     (err, new token, full response body)
 */
Client.refresh = function (access, client, cb) {
  const host = this.host || defaultHost
  utils.call(host, 'refresh', {
    accessToken: access,
    clientToken: client
  }, this.agent, function (err, data) {
    if (data && data.clientToken !== client) {
      cb(new Error('clientToken assertion failed'))
    } else {
      cb(err, data ? data.accessToken : null, data)
    }
  })
}

/**
 * Validates an access token
 * @param  {String}   token Token to validate
 * @param  {Function} cb    (error)
 */
Client.validate = function (token, cb) {
  const host = this.host || defaultHost
  utils.call(host, 'validate', {
    accessToken: token
  }, this.agent, function (err, data) {
    cb(err)
  })
}

/**
 * Invalidates all access tokens.
 * @param  {String}   user User's user
 * @param  {String}   pass User's pass
 * @param  {Function} cb   (error)
 */
Client.signout = function (user, pass, cb) {
  const host = this.host || defaultHost
  utils.call(host, 'signout', {
    username: user,
    password: pass
  }, this.agent, function (err, data) {
    cb(err)
  })
}

module.exports = Client
