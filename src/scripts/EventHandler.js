import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { MathUtils } from 'three'
import $ from 'jquery'
const modulo = function (a, b) {
  return ((+a % (b = +b)) + b) % b
}

class EventHandler {
  constructor (game) {
    this.game = game
    this.controls = {
      KeyW: 'forward',
      KeyD: 'right',
      KeyS: 'back',
      KeyA: 'left',
      Space: 'jump',
      ShiftLeft: 'sneak',
      KeyR: 'sprint'
    }
    this.keys = {}
    this.gameState = null
    this.setState('menu')
    document.exitPointerLock =
            document.exitPointerLock || document.mozExitPointerLock
    let focus = 0
    this.game.inv_bar.setFocus(focus)
    $(window).on('wheel', (e) => {
      if (this.gameState === 'gameLock') {
        if (e.originalEvent.deltaY > 0) {
          focus++
        } else {
          focus--
        }
        focus = modulo(focus, 9)
        this.game.inv_bar.setFocus(focus)
      }
    })
    const playerUpdateHeight = () => {
      const to = {
        x: this.game.playerPos[0],
        y: this.game.playerPos[1] + this.game.headHeight,
        z: this.game.playerPos[2]
      }
      new TWEEN.Tween(this.game.camera.position)
        .to(to, 100)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
    }
    $(document).on('keydown', (z) => {
      this.keys[z.code] = true
      for (let i = 1; i < 10; i++) {
        if (z.code === `Digit${i}` && this.gameState === 'gameLock') {
          this.game.inv_bar.setFocus(i - 1)
          focus = i - 1
        }
      }
      if (z.code === 'Tab') {
        z.preventDefault()
        if (this.gameState === 'gameLock') {
          $('.tab_list').show()
        }
      }
      if (z.code === 'KeyQ') {
        this.game.socket.emit('drop')
      }
      if (z.code === 'Escape' && this.gameState === 'inventory') {
        this.setState('menu')
      }
      if (z.code === 'ArrowUp' && this.gameState === 'chat') {
        this.game.chat.chatGoBack()
      }
      if (z.code === 'ArrowDown' && this.gameState === 'chat') {
        this.game.chat.chatGoForward()
      }
      if (z.code === 'Enter' && this.gameState === 'chat') {
        this.game.chat.command($('.com_i').val())
        $('.com_i').val('')
        this.setState('game')
      }
      if (
        z.code === 'KeyE' &&
                this.gameState !== 'chat' &&
                this.gameState !== 'menu'
      ) {
        this.setState('inventory')
      }
      if (
        (z.code === 'KeyT' || z.code === 'Slash') &&
                this.gameState === 'gameLock'
      ) {
        if (z.code === 'Slash') {
          $('.com_i').val('/')
        }
        this.setState('chat')
        z.preventDefault()
      }
      if (z.code === 'Backquote') {
        z.preventDefault()
        if (
          this.gameState === 'menu' ||
                    this.gameState === 'chat' ||
                    this.gameState === 'inventory'
        ) {
          this.setState('game')
        } else {
          this.setState('menu')
        }
      }
      if (z.code === 'Escape' && this.gameState === 'chat') {
        this.setState('menu')
      }
      if (z.code === 'KeyF') {
        this.game.flying = !this.game.flying
        this.game.socket.emit('fly', this.game.flying)
      }
      if (
        this.controls[z.code] !== undefined &&
                this.gameState === 'gameLock'
      ) {
        this.game.socket.emit('move', this.controls[z.code], true)
        const to = {
          fov: this.game.fov.sprint
        }
        switch (this.controls[z.code]) {
          case 'sprint':
            new TWEEN.Tween(this.game.camera)
              .to(to, 200)
              .easing(TWEEN.Easing.Quadratic.Out)
              .onUpdate(() => {
                return this.game.camera.updateProjectionMatrix()
              })
              .start()
            break

          case 'sneak':
            this.game.headHeight = 16.7
            playerUpdateHeight()
            break
        }
      }
    })
    $(document).on('keyup', (z) => {
      delete this.keys[z.code]
      if (z.code === 'Tab') {
        $('.tab_list').hide()
      }
      if (this.controls[z.code] !== undefined) {
        this.game.socket.emit('move', this.controls[z.code], false)
        const to = {
          fov: this.game.fov.normal
        }
        switch (this.controls[z.code]) {
          case 'sprint':
            new TWEEN.Tween(this.game.camera)
              .to(to, 200)
              .easing(TWEEN.Easing.Quadratic.Out)
              .onUpdate(() => {
                return this.game.camera.updateProjectionMatrix()
              })
              .start()
            break

          case 'sneak':
            this.game.headHeight = 17
            playerUpdateHeight()
            break
        }
      }
    })
    $(document).on('mousedown', (e) => {
      if (e.which === 1) {
        this.game.mouse = true
        if (this.game.eh.gameState === 'gameLock') {
          this.game.bb.digRequest()
        }
      } else if (e.which === 3) {
        this.game.bp.placeBlock()
      }
    })
    $(document).on('mouseup', (e) => {
      if (e.which === 1) {
        this.game.mouse = false
        return this.game.bb.stopDigging()
      }
    })
    $('.gameOn').on('click', () => {
      this.setState('game')
    })
    window.onblur = () => {
      Object.keys(this.controls).forEach((el) => {
        this.game.socket.emit('move', this.controls[el], false)
      })
    }
    const lockChangeAlert = () => {
      if (document.pointerLockElement === this.game.canvas || document.mozPointerLockElement === this.game.canvas) {
        if (this.gameState === 'game') {
          this.setState('gameLock')
        }
      } else if (this.gameState === 'gameLock' && this.gameState !== 'inventory') {
        this.setState('menu')
      }
    }
    document.addEventListener('pointerlockchange', lockChangeAlert, false)
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false)
    document.addEventListener('mousemove', (e) => { return this.updatePosition(e) }, false)
  }

  updatePosition (e) {
    if (this.gameState === 'gameLock') {
      this.game.camera.rotation.x -= MathUtils.degToRad(e.movementY / 10)
      this.game.camera.rotation.y -= MathUtils.degToRad(e.movementX / 10)
      if (MathUtils.radToDeg(this.game.camera.rotation.x) < -90) {
        this.game.camera.rotation.x = MathUtils.degToRad(-90)
      }
      if (MathUtils.radToDeg(this.game.camera.rotation.x) > 90) {
        this.game.camera.rotation.x = MathUtils.degToRad(90)
      }
      this.game.socket.emit('rotate', [
        this.game.camera.rotation.y,
        this.game.camera.rotation.x
      ])
    }
  }

  state (state) {
    this.gameState = state
    if (state === 'inventory') {
      return this.game.pii.show()
    } else {
      return this.game.pii.hide()
    }
  }

  resetState () {
    $('.chat').removeClass('focus')
    $('.chat').addClass('blur')
    $('.com_i').blur()
    $('.com').hide()
    this.game.chat.hide()
    return $('.inv_window').hide()
  }

  setState (state) {
    this.resetState()
    switch (state) {
      case 'game':
        this.state('game')
        this.game.canvas.requestPointerLock()
        break
      case 'gameLock':
        this.state('gameLock')
        $('.gameMenu').hide()
        break
      case 'menu':
        this.state('menu')
        $('.gameMenu').show()
        document.exitPointerLock()
        break
      case 'chat':
        if (this.gameState === 'gameLock') {
          this.game.chat.show()
          $('.chat').addClass('focus')
          $('.chat').removeClass('blur')
          $('.gameMenu').hide()
          this.state('chat')
          document.exitPointerLock()
          $('.com').show()
          $('.com_i').focus()
        }
        break
      case 'inventory':
        if (this.gameState !== 'menu') {
          $('.gameMenu').hide()
          if (this.gameState !== 'inventory') {
            this.state('inventory')
            $('.inv_window').show()
            document.exitPointerLock()
          } else {
            this.setState('game')
          }
        }
        break
    }
  }
}
export { EventHandler }
