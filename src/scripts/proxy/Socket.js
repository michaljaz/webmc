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
    this.emit('init', {
      connection,
      hostname,
      port,
      nick: this.game.nick,
      server: this.game.server,
      serverPort: this.game.serverPort,
      password: this.game.password
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
