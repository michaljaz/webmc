import { MeshStandardMaterial, TextureLoader, NearestFilter } from 'three'

class TextureAtlasCreator {
  constructor (options) {
    this.textureX = options.textureX
    this.textureMapping = options.textureMapping
    this.size = 36
    this.willSize = 27
  }

  gen (tick) {
    const multi = {}
    for (const i in this.textureMapping) {
      if (i.includes('@')) {
        const xd = this.decodeName(i)
        if (multi[xd.pref] === undefined) {
          multi[xd.pref] = xd
        } else {
          multi[xd.pref].x = Math.max(multi[xd.pref].x, xd.x)
          multi[xd.pref].y = Math.max(multi[xd.pref].y, xd.y)
        }
      }
    }
    const canvasx = document.createElement('canvas')
    const ctx = canvasx.getContext('2d')
    canvasx.width = this.willSize * 16
    canvasx.height = this.willSize * 16
    let toxelX = 1
    let toxelY = 1
    for (const i in this.textureMapping) {
      if (i.includes('@')) {
        const xd = this.decodeName(i)
        if (multi[xd.pref].loaded === undefined) {
          multi[xd.pref].loaded = true
          const lol = this.getToxelForTick(
            tick,
            multi[xd.pref].x + 1,
            multi[xd.pref].y + 1
          )
          const texmap = this.textureMapping[
                        `${xd.pref}@${lol.col}@${lol.row}`
          ]
          ctx.drawImage(
            this.textureX,
            (texmap.x - 1) * 16,
            (texmap.y - 1) * 16,
            16,
            16,
            (toxelX - 1) * 16,
            (toxelY - 1) * 16,
            16,
            16
          )
          toxelX++
          if (toxelX > this.willSize) {
            toxelX = 1
            toxelY++
          }
        }
      } else {
        ctx.drawImage(
          this.textureX,
          (this.textureMapping[i].x - 1) * 16,
          (this.textureMapping[i].y - 1) * 16,
          16,
          16,
          (toxelX - 1) * 16,
          (toxelY - 1) * 16,
          16,
          16
        )
        toxelX++
        if (toxelX > this.willSize) {
          toxelX = 1
          toxelY++
        }
      }
    }
    return canvasx
  }

  decodeName (i) {
    let m = null
    for (let j = 0; j < i.length; j++) {
      if (i[j] === '@') {
        m = j
        break
      }
    }
    const pref = i.substr(0, m)
    const sub = i.substr(m, i.length)
    let m2 = null
    for (let j = 0; j < sub.length; j++) {
      if (sub[j] === '@') {
        m2 = j
      }
    }
    const x = parseInt(sub.substr(1, m2 - 1))
    const y = parseInt(sub.substr(m2 + 1, sub.length))
    return { pref, x, y }
  }

  getToxelForTick (tick, w, h) {
    tick = (tick % (w * h)) + 1
    // option1
    let col = (tick - 1) % w
    let row = Math.ceil(tick / w) - 1
    // option2
    col = Math.ceil(tick / h) - 1
    row = (tick - 1) % h
    return { row, col }
  }
}

class AnimatedTextureAtlas {
  constructor (game) {
    this.game = game
    this.material = new MeshStandardMaterial({
      side: 0,
      map: null,
      vertexColors: true,
      transparent: true,
      alphaTest: 0.1
    })
    this.atlasCreator = new TextureAtlasCreator({
      textureX: this.game.al.get('blocksAtlasFull'),
      textureMapping: this.game.al.get('blocksMappingFull')
    })
    const savedTextures = []
    for (let i = 0; i < 10; i++) {
      const t = this.atlasCreator.gen(i).toDataURL()
      const tekstura = new TextureLoader().load(t)
      tekstura.magFilter = NearestFilter
      tekstura.minFilter = NearestFilter
      savedTextures.push(tekstura)
    }
    let tickq = 0
    setInterval(() => {
      tickq++
      const tekst = savedTextures[tickq % 9]
      this.material.map = tekst
      this.material.map.needsUpdate = true
    }, 100)
  }
}

export { AnimatedTextureAtlas, TextureAtlasCreator }
