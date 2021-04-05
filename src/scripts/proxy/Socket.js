import Proxy from './Proxy.worker.js'

class Socket {
  constructor (game) {
    this.game = game
    this.worker = new Proxy()
    this.handlers = new Map()
    let connection, hostname, port
    if (this.game.proxy === 'local') {
      connection = document.location.protocol === 'https:' ? 'wss' : 'ws'
      hostname = document.location.hostname
      port = document.location.port
    } else {
      const pars = this.game.proxy.split(':')
      connection = pars[0]
      hostname = pars[1]
      port = pars[2]
    }
    let server = this.game.server.split(':')
    if (server.length === 1) {
      server = [server[0], null]
    }
    this.emit('init', {
      connection,
      hostname,
      port,
      nick: this.game.nick,
      server: server[0],
      serverPort: server[1]
    })
    this.worker.onmessage = (msg) => {
      const type = msg.data.type
      const data = msg.data.params
      const handler = this.handlers.get(type)
      if (handler !== undefined) {
        if (data === undefined) {
          handler()
        } else {
          handler(...data)
        }
      }
    }
  }

  emit (type, ...data) {
    this.worker.postMessage({
      type,
      data
    })
  }

  on (type, handler) {
    this.handlers.set(type, handler)
  }
}
export { Socket }
