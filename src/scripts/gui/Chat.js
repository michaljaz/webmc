import $ from 'jquery'

class Chat {
  constructor (game) {
    this.game = game
    this.chatDiv = document.querySelector('.chat')
    this.listen()
    this.history = ['']
    this.histState = 0
    this.fadeTimeout = 10000
  }

  chatGoBack () {
    if (this.histState > 0) {
      this.histState--
      $('.com_i').val(this.history[this.histState])
    }
  }

  chatGoForward () {
    if (this.histState < this.history.length - 1) {
      this.histState++
      $('.com_i').val(this.history[this.histState])
    }
  }

  listen () {
    window.addEventListener(
      'wheel',
      (e) => {
        if (this.game.eh.gameState !== 'chat') {
          e.preventDefault()
        }
      },
      {
        passive: false
      }
    )
    return this
  }

  isElementScrolledToBottom (el) {
    if (el.scrollTop >= el.scrollHeight - el.offsetHeight) {
      return true
    }
    return false
  }

  scrollToBottom (el) {
    el.scrollTop = el.scrollHeight
  }

  log (message) {
    const elem = document.createElement('div')
    elem.innerHTML = message + '<br>'
    this.chatDiv.append(elem)
    this.scrollToBottom(this.chatDiv)
    setTimeout(() => {
      if (this.game.eh.gameState === 'chat') {
        elem.hidd = true
      } else {
        $(elem).fadeOut(1000, () => {
          elem.hidd = true
          this.scrollToBottom(this.chatDiv)
        })
      }
    }, this.fadeTimeout)
  }

  show () {
    const children = [].slice.call(this.chatDiv.children)
    for (let i = 0; i < children.length; i++) {
      $(children[i]).show()
    }
    this.scrollToBottom(this.chatDiv)
  }

  hide () {
    const children = [].slice.call(this.chatDiv.children)
    for (let i = 0; i < children.length; i++) {
      if (children[i].hidd) {
        $(children[i]).hide()
      }
    }
  }

  command (com) {
    if (com !== '') {
      this.history[this.history.length - 1] = com
      this.history.push('')
      this.histState = this.history.length - 1
      console.log(this.history)
      return this.game.socket.emit('command', com)
    }
  }
}

export { Chat }
