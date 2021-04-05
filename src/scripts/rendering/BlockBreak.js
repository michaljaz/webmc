import {
  NearestFilter,
  Mesh,
  BoxBufferGeometry,
  MeshBasicMaterial,
  LineSegments,
  EdgesGeometry,
  LineBasicMaterial
} from 'three'

class BlockBreak {
  constructor (game) {
    this.game = game
    this.texture = this.game.al.get('blocksAtlasSnap')
    this.texture.magFilter = NearestFilter
    this.cursor = new Mesh(
      new BoxBufferGeometry(1.001, 1.001, 1.001),
      new MeshBasicMaterial({
        map: this.texture,
        transparent: true
      })
    )
    this.lastPos = []
    this.cursorOut = new LineSegments(
      new EdgesGeometry(this.cursor.geometry),
      new LineBasicMaterial({
        color: 0x000000
      })
    )
    this.game.scene.add(this.cursor, this.cursorOut)
    this.uv = {}
    this.isDigging = false
    this.done = true
    this.setState(0)
  }

  setState (state) {
    if (state === 0) {
      return (this.cursor.material.visible = false)
    } else {
      this.cursor.material.visible = true
      const toxX = 6 + state
      const toxY = 8
      const q = 1 / 27
      for (let i = 0; i <= this.cursor.geometry.attributes.uv.array.length; i++) {
        if (this.uv[i] === undefined) {
          if (i % 2 === 0) {
            if (this.cursor.geometry.attributes.uv.array[i] === 0) {
              this.uv[i] = 0
            } else {
              this.uv[i] = 1
            }
          } else {
            if (this.cursor.geometry.attributes.uv.array[i] === 0) {
              this.uv[i] = 0
            } else {
              this.uv[i] = 1
            }
          }
        }
        if (i % 2 === 0) {
          if (this.uv[i] === 0) {
            this.cursor.geometry.attributes.uv.array[i] = q * toxX
          } else {
            this.cursor.geometry.attributes.uv.array[i] = q * toxX + q
          }
        } else {
          if (this.uv[i] === 0) {
            this.cursor.geometry.attributes.uv.array[i] = 1 - q * toxY - q
          } else {
            this.cursor.geometry.attributes.uv.array[i] = 1 - q * toxY
          }
        }
      }
      return (this.cursor.geometry.attributes.uv.needsUpdate = true)
    }
  }

  updatePos (cb) {
    const rayBlock = this.game.world.getRayBlock()
    if (JSON.stringify(this.lastPos) !== JSON.stringify(rayBlock)) {
      this.lastPos = rayBlock
      cb()
    }
    if (rayBlock) {
      const pos = rayBlock.posBreak
      this.cursor.position.set(...pos)
      this.cursor.visible = true
      this.cursorOut.position.set(...pos)
      return (this.cursorOut.visible = true)
    } else {
      this.cursor.visible = false
      return (this.cursorOut.visible = false)
    }
  }

  digRequest () {
    // console.log("REQUESTING DIGGING...");
    const pos = this.game.world.getRayBlock().posBreak
    if (pos !== undefined) {
      this.game.socket.emit('dig', pos)
      this.done = false
    }
  }

  startDigging (time) {
    let ile = 0
    if (this.isDigging === false) {
      this.isDigging = true
      this.int = setInterval(() => {
        if (ile === 11) {
          this.setState(0)
          clearInterval(this.int)
          this.isDigging = false
        } else {
          this.setState(ile)
        }
        ile++
      }, time / 10)
    }
  }

  stopDigging () {
    this.done = true
    this.isDigging = false
    // console.log("Digging Stopped!");
    this.game.socket.emit('stopDigging')
    this.setState(0)
    clearInterval(this.int)
  }
}

export { BlockBreak }
