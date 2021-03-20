import { MeshStandardMaterial, TextureLoader, NearestFilter, NearestMipmapLinearFilter } from 'three'

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
        const block = this.decodeName(i)
        if (multi[block.pref] === undefined) {
          multi[block.pref] = block
        } else {
          multi[block.pref].x = Math.max(multi[block.pref].x, block.x)
          multi[block.pref].y = Math.max(multi[block.pref].y, block.y)
        }
      }
    }
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const size = this.willSize * (16 + 32)
    canvas.width = size
    canvas.height = size
    const toxelCoord = { x: 1, y: 1 }
    for (const i in this.textureMapping) {
      if (i.includes('@')) {
        const block = this.decodeName(i)
        if (multi[block.pref].loaded === undefined) {
          multi[block.pref].loaded = true
          const toxel = this.getToxelForTick(
            tick,
            multi[block.pref].x + 1,
            multi[block.pref].y + 1
          )
          const texmap = this.textureMapping[`${block.pref}@${toxel.col}@${toxel.row}`]
          this.addToxel(ctx, texmap, toxelCoord)
        }
      } else {
        this.addToxel(ctx, this.textureMapping[i], toxelCoord)
      }
    }
    // console.log(canvas.toDataURL())
    return canvas
  }

  addToxel (ctx, coord, toxelCoord) {
    ctx.drawImage(
      this.textureX,
      (coord.x - 1) * 16,
      (coord.y - 1) * 16,
      16,
      16,
      16 + (toxelCoord.x - 1) * (16 + 32),
      16 + (toxelCoord.y - 1) * (16 + 32),
      16,
      16
    )
    const b = ctx.getImageData(16 + (toxelCoord.x - 1) * (16 + 32), 16 + (toxelCoord.y - 1) * (16 + 32), 16, 16)
    for (let j = 16; j > 0; j--) {
      ctx.putImageData(b, 16 + (toxelCoord.x - 1) * (16 + 32), 16 + (toxelCoord.y - 1) * (16 + 32) - j)
      ctx.putImageData(b, 16 + (toxelCoord.x - 1) * (16 + 32) - j, 16 + (toxelCoord.y - 1) * (16 + 32))
      ctx.putImageData(b, 16 + (toxelCoord.x - 1) * (16 + 32) + j, 16 + (toxelCoord.y - 1) * (16 + 32))
      ctx.putImageData(b, 16 + (toxelCoord.x - 1) * (16 + 32), 16 + (toxelCoord.y - 1) * (16 + 32) + j)
    }
    ctx.putImageData(b, 16 + (toxelCoord.x - 1) * (16 + 32), 16 + (toxelCoord.y - 1) * (16 + 32))
    toxelCoord.x++
    if (toxelCoord.x > this.willSize) {
      toxelCoord.x = 1
      toxelCoord.y++
    }
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
    // let col = (tick - 1) % w
    // let row = Math.ceil(tick / w) - 1
    // option2
    const col = Math.ceil(tick / h) - 1
    const row = (tick - 1) % h
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
      const c = this.atlasCreator.gen(i)
      const t = c.toDataURL()
      const tekstura = new TextureLoader().load(t)
      tekstura.magFilter = NearestFilter
      tekstura.minFilter = NearestMipmapLinearFilter
      savedTextures.push(tekstura)
    }
    let tickq = 0
    tickq++
    const tekst = savedTextures[tickq % 9]
    this.material.map = tekst
    this.material.map.needsUpdate = true
  }
}

export { AnimatedTextureAtlas, TextureAtlasCreator }
