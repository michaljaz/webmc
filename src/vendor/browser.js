/* global WebSocket,Blob,FileReader */
const stream = require('stream')
const util = require('util')
const http = require('http')
const timers = require('timers')

const debug = util.debuglog('net')

const proxy = {
  protocol: (window.location.protocol === 'https:') ? 'wss' : 'ws',
  hostname: window.location.hostname,
  port: window.location.port,
  path: '/api/vm/net'
}
function getProxy () {
  return proxy
}
function getProxyHost () {
  let host = getProxy().hostname
  if (getProxy().port) {
    host += ':' + getProxy().port
  }
  return host
}
function getProxyOrigin () {
  return getProxy().protocol + '://' + getProxyHost()
}
exports.setProxy = function (options) {
  options = options || {}

  if (options.protocol) {
    proxy.protocol = options.protocol
  }
  if (options.hostname) {
    proxy.hostname = options.hostname
  }
  if (options.port) {
    proxy.port = options.port
  }
  if (options.path) {
    proxy.path = options.path
  }
}

exports.createServer = function () {
  throw new Error('Cannot create server in a browser')
}

exports.connect = exports.createConnection = function (/* options, connectListener */) {
  const args = normalizeConnectArgs(arguments)
  debug('createConnection', args)
  const s = new Socket(args[0])
  return Socket.prototype.connect.apply(s, args)
}

function toNumber (x) { return (x = Number(x)) >= 0 ? x : false }

function isPipeName (s) {
  return typeof s === 'string' && toNumber(s) === false
}

// Returns an array [options] or [options, cb]
// It is the same as the argument of Socket.prototype.connect().
function normalizeConnectArgs (args) {
  let options = {}
  if (typeof args[0] === 'object') {
    // connect(options, [cb])
    options = args[0]
  } else if (isPipeName(args[0])) {
    // connect(path, [cb]);
    options.path = args[0]
  } else {
    // connect(port, [host], [cb])
    options.port = args[0]
    if (typeof args[1] === 'string') {
      options.host = args[1]
    }
  }
  const cb = args[args.length - 1]
  return typeof cb === 'function' ? [options, cb] : [options]
}
exports._normalizeConnectArgs = normalizeConnectArgs

function Socket (options) {
  if (!(this instanceof Socket)) return new Socket(options)

  this._connecting = false
  this._host = null

  if (typeof options === 'number') {
    options = { fd: options }
  } else if (typeof options === 'undefined') { options = {} }

  stream.Duplex.call(this, options)

  // these will be set once there is a connection
  this.readable = this.writable = false

  // handle strings directly
  this._writableState.decodeStrings = false

  // default to *not* allowing half open sockets
  this.allowHalfOpen = (options && options.allowHalfOpen) || false
}
util.inherits(Socket, stream.Duplex)

exports.Socket = Socket
exports.Stream = Socket // Legacy naming.

Socket.prototype.listen = function () {
  throw new Error('Cannot listen in a browser')
}

Socket.prototype.setTimeout = function (msecs, callback) {
  if (msecs > 0 && isFinite(msecs)) {
    timers.enroll(this, msecs)
    // timers._unrefActive(this);
    if (callback) {
      this.once('timeout', callback)
    }
  } else if (msecs === 0) {
    timers.unenroll(this)
    if (callback) {
      this.removeListener('timeout', callback)
    }
  }
}

Socket.prototype._onTimeout = function () {
  debug('_onTimeout')
  this.emit('timeout')
}

Socket.prototype.setNoDelay = function (enable) {}
Socket.prototype.setKeepAlive = function (setting, msecs) {}

Socket.prototype.address = function () {
  return {
    address: this.remoteAddress,
    port: this.remotePort,
    family: this.remoteFamily
  }
}

Object.defineProperty(Socket.prototype, 'readyState', {
  get: function () {
    if (this._connecting) {
      return 'opening'
    } else if (this.readable && this.writable) {
      return 'open'
    } else if (this.readable && !this.writable) {
      return 'readOnly'
    } else if (!this.readable && this.writable) {
      return 'writeOnly'
    } else {
      return 'closed'
    }
  }
})

Socket.prototype.bufferSize = undefined

Socket.prototype._read = function () {}

Socket.prototype.end = function (data, encoding) {
  stream.Duplex.prototype.end.call(this, data, encoding)
  this.writable = false

  if (this._ws) {
    this._ws.close()
  }

  // just in case we're waiting for an EOF.
  if (this.readable && !this._readableState.endEmitted) { this.read(0) } else { maybeDestroy(this) }
}

// Call whenever we set writable=false or readable=false
function maybeDestroy (socket) {
  if (!socket.readable &&
    !socket.writable &&
    !socket.destroyed &&
    !socket._connecting &&
    !socket._writableState.length) {
    socket.destroy()
  }
}

Socket.prototype.destroySoon = function () {
  if (this.writable) { this.end() }
  if (this._writableState.finished) { this.destroy() } else { this.once('finish', this.destroy) }
}

Socket.prototype.destroy = function (exception) {
  debug('destroy', exception)

  if (this.destroyed) {
    return
  }

  this._connecting = false

  this.readable = this.writable = false

  timers.unenroll(this)

  debug('close')

  this.destroyed = true
}

Socket.prototype.remoteAddress = null
Socket.prototype.remoteFamily = null
Socket.prototype.remotePort = null

// Used for servers only - not here
Socket.prototype.localAddress = null
Socket.prototype.localPort = null

Socket.prototype.bytesRead = 0
Socket.prototype.bytesWritten = 0

Socket.prototype._write = function (data, encoding, cb) {
  const self = this
  cb = cb || function () {}

  // If we are still connecting, then buffer this for later.
  // The Writable logic will buffer up any more writes while
  // waiting for this one to be done.
  if (this._connecting) {
    this._pendingData = data
    this._pendingEncoding = encoding
    this.once('connect', function () {
      this._write(data, encoding, cb)
    })
    return
  }
  this._pendingData = null
  this._pendingEncoding = ''

  if (encoding === 'binary' && typeof data === 'string') { // TODO: maybe apply this for all string inputs?
    // Setting encoding is very important for binary data - otherwise the data gets modified
    data = Buffer.alloc(data, encoding)
  }

  // Send the data
  this._ws.send(data)

  process.nextTick(function () {
    // console.log('[tcp] sent: ', data.toString(), data.length);
    self.bytesWritten += data.length
    cb()
  })
}

Socket.prototype.write = function (chunk, encoding, cb) {
  if (typeof chunk !== 'string' && !Buffer.isBuffer(chunk)) { throw new TypeError('invalid data') }
  return stream.Duplex.prototype.write.apply(this, arguments)
}

Socket.prototype.connect = function (options, cb) {
  const self = this

  if (typeof options !== 'object') {
    // Old API:
    // connect(port, [host], [cb])
    // connect(path, [cb]);
    const args = normalizeConnectArgs(arguments)
    return Socket.prototype.connect.apply(this, args)
  }

  cb = cb || function () {}

  if (this.write !== Socket.prototype.write) { this.write = Socket.prototype.write }

  if (options.path) {
    throw new Error('options.path not supported in the browser')
  }

  self._connecting = true
  self.writable = true
  self._host = options.host

  const req = http.request({
    hostname: getProxy().hostname,
    port: getProxy().port,
    path: getProxy().path + '/connect',
    method: 'POST',
    withCredentials: false
  }, function (res) {
    let json = ''
    res.on('data', function (buf) {
      json += buf
    })
    res.on('end', function () {
      let data = null
      try {
        data = JSON.parse(json)
      } catch (e) {
        data = {
          code: res.statusCode,
          error: json
        }
      }

      if (data.error) {
        self.emit('error', 'Cannot open TCP connection [' + res.statusCode + ']: ' + data.error)
        self.destroy()
        return
      }

      self.remoteAddress = data.remote.address
      self.remoteFamily = data.remote.family
      self.remotePort = data.remote.port

      self._connectWebSocket(data.token, function (err) {
        if (err) {
          cb(err)
          return
        }

        cb()
      })
    })
  })

  req.setHeader('Content-Type', 'application/json')
  req.write(JSON.stringify(options))
  req.end()

  return this
}

Socket.prototype._connectWebSocket = function (token, cb) {
  const self = this

  if (self._ws) {
    process.nextTick(function () {
      cb()
    })
    return
  }

  this._ws = new WebSocket(getProxyOrigin() + getProxy().path + '/socket?token=' + token)
  this._handleWebsocket()

  if (cb) {
    self.on('connect', cb)
  }
}

Socket.prototype._handleWebsocket = function () {
  const self = this

  this._ws.addEventListener('open', function () {
    // console.log('TCP OK');

    self._connecting = false
    self.readable = true

    self.emit('connect')

    self.read(0)
  })
  this._ws.addEventListener('error', function (e) {
    // `e` doesn't contain anything useful (https://developer.mozilla.org/en/docs/WebSockets/Writing_WebSocket_client_applications#Connection_errors)
    console.warn('TCP error', e)
    self.emit('error', 'An error occured with the WebSocket')
  })
  this._ws.addEventListener('message', function (e) {
    const contents = e.data

    const gotBuffer = function (buffer) {
      // console.log('[tcp] received: ' + buffer.toString(), buffer.length);
      self.bytesRead += buffer.length
      self.push(buffer)
    }

    if (typeof contents === 'string') {
      const buffer = Buffer.alloc(contents)
      gotBuffer(buffer)
    } else if (window.Blob && contents instanceof Blob) {
      const fileReader = new FileReader()
      fileReader.addEventListener('load', function (e) {
        const buf = fileReader.result
        const arr = new Uint8Array(buf)
        gotBuffer(Buffer.from(arr))
      })
      fileReader.readAsArrayBuffer(contents)
    } else {
      console.warn('Cannot read TCP stream: unsupported message type', contents)
    }
  })
  this._ws.addEventListener('close', function () {
    if (self.readyState === 'open') {
      // console.log('TCP closed');
      self.destroy()
    }
  })
}

exports.isIP = function (input) {
  if (exports.isIPv4(input)) {
    return 4
  } else if (exports.isIPv6(input)) {
    return 6
  } else {
    return 0
  }
}
exports.isIPv4 = function (input) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(input)
}
exports.isIPv6 = function (input) {
  return /^(([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))$/.test(input)
}
