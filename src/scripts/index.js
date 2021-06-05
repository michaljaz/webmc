import { Color, Mesh, Matrix4, Frustum } from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import swal from 'sweetalert'
import { AssetLoader } from './AssetLoader.js'
import { Setup } from './Setup.js'

class Game {
  constructor () {
    this.production = window.PRODUCTION
    if (this.production) {
      console.log('Running in production mode')
    } else {
      console.log('Running in development mode')
    }
    this.fov = {
      normal: 70,
      sprint: 80
    }
    this.al = new AssetLoader()
    this.toxelSize = 27
    this.dimension = null
    this.flying = false
    this.playerPos = [0, 0, 0]
    this.dimBg = {
      'minecraft:overworld': [165 / 255, 192 / 255, 254 / 255],
      'minecraft:the_end': [1 / 255, 20 / 255, 51 / 255],
      'minecraft:the_nether': [133 / 255, 40 / 255, 15 / 255],
      'minecraft:end': [1 / 255, 20 / 255, 51 / 255],
      'minecraft:nether': [133 / 255, 40 / 255, 15 / 255]
    }
    this.headHeight = 17
    this.gamemode = null
    this.mouse = false
  }

  async init () {
    await this.al.init()
    Setup(this)
    this.socket.on('blockUpdate', (block) => {
      this.world.setBlock(block[0], block[1] + 16, block[2], block[3])
    })
    this.socket.on('spawn', (yaw, pitch) => {
      console.log('Player spawned')
      this.ls.hide()
      this.camera.rotation.y = yaw
      this.camera.rotation.x = pitch
    })
    this.socket.on('players', (players) => {
      this.tl.update(players)
    })
    this.socket.on('dimension', (dim) => {
      this.dimension = dim
      console.log(`Player dimension has been changed: ${dim}`)
      this.world.resetWorld()
      if (this.dimBg[dim] === undefined) {
        dim = 'minecraft:overworld'
      }
      const bg = this.dimBg[dim]
      this.scene.background = new Color(...bg)
      this.distanceBasedFog.color.x = bg[0]
      this.distanceBasedFog.color.y = bg[1]
      this.distanceBasedFog.color.z = bg[2]
      this.distanceBasedFog.color.w = 1

      this.ls.show('Loading terrain...')
    })
    this.socket.on('mapChunk', (sections, biomes, x, z) => {
      this.world.computeSections(sections, biomes, x, z)
    })
    this.socket.on('game', (gameData) => {
      this.inv_bar.updateGamemode(gameData.gameMode)
    })
    this.socket.on('hp', (points) => {
      this.inv_bar.setHp(points)
    })
    this.socket.on('inventory', (inv) => {
      this.inv_bar.updateInv(inv)
    })
    this.socket.on('food', (points) => {
      this.inv_bar.setFood(points)
    })
    this.socket.on('msg', (msg) => {
      this.chat.log(msg)
    })
    this.socket.on('kicked', (reason) => {
      document.exitPointerLock()
      console.log(reason)
      reason = JSON.parse(reason)
      swal({
        title: "You've been kicked!",
        text:
          reason.extra !== undefined
            ? reason.extra[0].text
            : reason.text,
        icon: 'error',
        button: 'Rejoin'
      }).then(function () {
        document.location.reload()
      })
    })
    this.socket.on('xp', (xp) => {
      this.inv_bar.setXp(xp.level, xp.progress)
    })
    this.socket.on('move', (pos) => {
      this.playerPos = [pos.x - 0.5, pos.y, pos.z - 0.5]
      const to = {
        x: pos.x - 0.5,
        y: pos.y + this.headHeight,
        z: pos.z - 0.5
      }
      new TWEEN.Tween(this.camera.position)
        .to(to, 100)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
    })
    this.socket.on('entities', (entities) => {
      this.ent.update(entities)
    })
    this.socket.on('diggingCompleted', () => {
      this.bb.done = true
    })
    this.socket.on('digTime', (time) => {
      this.bb.startDigging(time)
    })
    setInterval(() => {
      if (this.params.frustumtest) {
        const frustum = new Frustum()
        const cameraViewProjectionMatrix = new Matrix4()

        this.camera.updateMatrixWorld()
        this.camera.matrixWorldInverse.copy(this.camera.matrixWorld).invert()
        cameraViewProjectionMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse)
        frustum.setFromProjectionMatrix(cameraViewProjectionMatrix)

        this.scene.traverse((node) => {
          if (node instanceof Mesh) {
            if (frustum.intersectsObject(node)) {
              node.visible = true
            } else {
              node.visible = false
            }
          }
        })
      }
    }, 2000)
    return this.animate()
  }

  animate () {
    try {
      this.stats.begin()
      this.render()
      this.stats.end()
    } catch (e) {
      this.render()
    }

    window.requestAnimationFrame(() => {
      this.animate()
    })
  }

  render () {
    const width = window.innerWidth
    const height = window.innerHeight
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width
      this.canvas.height = height
      this.renderer.setSize(width, height, false)
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
    }
    this.bb.updatePos(() => {
      if (this.bb.isDigging) {
        this.bb.stopDigging()
      }
      if (this.mouse && this.bb.done) {
        return this.bb.digRequest()
      }
    })
    this.world.updateChunksAroundPlayer(this.params.chunkdist)
    this.inv_bar.updateItems()
    this.distanceBasedFog.update()
    TWEEN.update()
    if (!this.production) {
      this.drawcalls.update(this.renderer.info.render.calls, 100)
    }
    if (this.eh.gameState === 'inventory') {
      this.pii.render()
    }

    this.renderer.render(this.scene, this.camera)
  }
}

window.onload = () => {
  const game = new Game()
  game.init()
}
