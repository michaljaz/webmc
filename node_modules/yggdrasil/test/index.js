/* eslint-env mocha */
'use strict'

const crypto = require('crypto')
const assert = require('assert')
const nock = require('nock')

const utils = require('../lib/utils')

describe('utils', function () {
  describe('call', function () {
    const google = 'https://google.com'
    const uscope = nock(google)

    it('should work when given valid data', function (done) {
      const bsdata = {
        cake: true,
        username: 'someone'
      }

      uscope.post('/test', {}).reply(200, bsdata)
      utils.call(google, 'test', {}, undefined, function (err, data) {
        assert.ifError(err)
        assert.deepStrictEqual(data, bsdata)
        done()
      })
    })

    it('should error on an error', function (done) {
      uscope.post('/test2', {}).reply(200, {
        error: 'ThisBeAError',
        errorMessage: 'Yep, you failed.'
      })
      utils.call(google, 'test2', {}, undefined, function (err, data) {
        assert.strictEqual(data, undefined)
        assert.ok(err instanceof Error)
        assert.strictEqual(err.message, 'Yep, you failed.')
        done()
      })
    })

    afterEach(function () {
      uscope.done()
    })
  })

  // mcHexDigest(sha1('catcatcat')) => -af59e5b1d5d92e5c2c2776ed0e65e90be181f2a
  describe('mcHexDigest', function () {
    it('should work against test data', function () {
      // circa http://wiki.vg/Protocol_Encryption#Client
      const testdata = {
        Notch: '4ed1f46bbe04bc756bcb17c0c7ce3e4632f06a48',
        jeb_: '-7c9d5b0044c130109a5d7b5fb5c317c02b4e28c1',
        simon: '88e16a1019277b15d58faf0541e11910eb756f6',
        dummy697: '-aa2358520428804697026992cf6035d7f096a00' // triggers 2's complement bug
      }

      Object.keys(testdata).forEach(function (name) {
        const hash = crypto.createHash('sha1').update(name).digest()
        assert.strictEqual(utils.mcHexDigest(hash), testdata[name])
      })
    })

    it('should handle negative hashes ending with a zero byte without crashing', function () {
      assert.strictEqual(utils.mcHexDigest(Buffer.from([-1, 0])), '-100')
    })
  })
})

const cscope = nock('https://authserver.mojang.com')
const ygg = require('../lib/index')({})

describe('Yggdrasil', function () {
  describe('auth', function () {
    it('should work correctly', function (done) {
      cscope.post('/authenticate', {
        agent: {
          version: 1,
          name: 'Minecraft'
        },
        username: 'cake',
        password: 'hunter2',
        clientToken: 'bacon',
        requestUser: false
      }).reply(200, {
        worked: true
      })
      ygg.auth({
        user: 'cake',
        pass: 'hunter2',
        token: 'bacon'
      }, function (err, data) { // eslint-disable-line handle-callback-err
        assert.deepStrictEqual(data, {
          worked: true
        })
        done()
      })
    })
    it('should work correctly with requestUser true', function (done) {
      cscope.post('/authenticate', {
        agent: {
          version: 1,
          name: 'Minecraft'
        },
        username: 'cake',
        password: 'hunter2',
        clientToken: 'bacon',
        requestUser: true
      }).reply(200, {
        worked: true
      })
      ygg.auth({
        user: 'cake',
        pass: 'hunter2',
        token: 'bacon',
        requestUser: true
      }, function (err, data) { // eslint-disable-line handle-callback-err
        assert.deepStrictEqual(data, {
          worked: true
        })
        done()
      })
    })
  })
  describe('refresh', function () {
    it('should work correctly', function (done) {
      cscope.post('/refresh', {
        accessToken: 'bacon',
        clientToken: 'not bacon'
      }).reply(200, {
        accessToken: 'different bacon',
        clientToken: 'not bacon'
      })
      ygg.refresh('bacon', 'not bacon', function (err, token) {
        assert.ifError(err)
        assert.strictEqual(token, 'different bacon')
        done()
      })
    })
    it('should error on invalid clientToken', function (done) {
      cscope.post('/refresh', {
        accessToken: 'bacon',
        clientToken: 'not bacon'
      }).reply(200, {
        accessToken: 'different bacon',
        clientToken: 'bacon'
      })
      ygg.refresh('bacon', 'not bacon', function (err, token) {
        assert.notStrictEqual(err, null)
        assert.ok(err instanceof Error)
        assert.strictEqual(err.message, 'clientToken assertion failed')
        done()
      })
    })
  })
  describe('validate', function () {
    it('should return undefined on valid response', function (done) {
      cscope.post('/validate', {
        accessToken: 'a magical key'
      }).reply(200)
      ygg.validate('a magical key', function (err) {
        assert.ifError(err)
        done()
      })
    })
    it('should return Error on error', function (done) {
      cscope.post('/validate', {
        accessToken: 'a magical key'
      }).reply(403, {
        error: 'UserEggError',
        errorMessage: 'User is an egg'
      })
      ygg.validate('a magical key', function (err) {
        assert.ok(err instanceof Error)
        assert.strictEqual(err.message, 'User is an egg')
        done()
      })
    })
  })
  afterEach(function () {
    cscope.done()
  })
})

const sscope = nock('https://sessionserver.mojang.com')
const yggserver = require('../lib/index').server({})

describe('Yggdrasil.server', function () {
  describe('join', function () {
    it('should work correctly', function (done) {
      sscope.post('/session/minecraft/join', {
        accessToken: 'anAccessToken',
        selectedProfile: 'aSelectedProfile',
        serverId: '-af59e5b1d5d92e5c2c2776ed0e65e90be181f2a'
      }).reply(200, {
        worked: true
      })

      yggserver.join('anAccessToken', 'aSelectedProfile', 'cat', 'cat', 'cat', function (err, data) { // eslint-disable-line handle-callback-err
        assert.deepStrictEqual(data, {
          worked: true
        })
        done()
      })
    })
  })

  describe('hasJoined', function () {
    it('should work correctly', function (done) {
      sscope.get('/session/minecraft/hasJoined?username=ausername&serverId=-af59e5b1d5d92e5c2c2776ed0e65e90be181f2a').reply(200, {
        id: 'cat',
        worked: true
      })

      yggserver.hasJoined('ausername', 'cat', 'cat', 'cat', function (err, data) {
        if (err) return done(err)
        assert.deepStrictEqual(data, {
          id: 'cat',
          worked: true
        })
        done()
      })
    })
    it('should fail on a 200 empty response', function (done) {
      sscope.get('/session/minecraft/hasJoined?username=ausername&serverId=-af59e5b1d5d92e5c2c2776ed0e65e90be181f2a').reply(200)

      yggserver.hasJoined('ausername', 'cat', 'cat', 'cat', function (err, data) {
        assert.ok(err instanceof Error)
        done()
      })
    })
  })
  afterEach(function () {
    sscope.done()
  })
})
