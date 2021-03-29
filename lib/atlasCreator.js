const path = require('path')
const fs = require('fs')
const Canvas = require('canvas')

const AtlasCreator = class AtlasCreator {
  constructor (options) {
    this.pref = options.pref
    this.oneFrame = options.oneFrame
    this.toxelSize = options.toxelSize
    this.loadPath = options.loadPath
    this.buildPath = options.buildPath
    this.atlasSize = options.atlasSize
    this.canvas = Canvas.createCanvas(
      this.atlasSize * this.toxelSize,
      this.atlasSize * this.toxelSize
    )
    this.ctx = this.canvas.getContext('2d')
    this.toxelX = 1
    this.toxelY = 1
    this.loadedImages = 0
    this.images = {}
    this.textureMapping = {}
    this.emptyDir()
    this.firstLoad()
  }

  emptyDir () {
    if (!fs.existsSync(this.buildPath)) {
      fs.mkdirSync(this.buildPath)
    }
  }

  firstLoad () {
    fs.readdir(this.loadPath, (_err, files) => {
      let totalImages = 0
      files.forEach((file) => {
        if (path.extname(file) === '.png') {
          totalImages += 1
        }
      })
      this.totalImages = totalImages
      files.forEach((file) => {
        const filePath = `${this.loadPath}/${file}`
        if (path.extname(file) === '.png') {
          // console.log filePath
          this.addImageToLoad(filePath, file)
        }
      })
    })
  }

  addImageToLoad (filePath, name) {
    const img = new Canvas.Image()
    img.onload = () => {
      this.images[name] = img
      this.loadedImages++
      if (this.loadedImages === this.totalImages) {
        return this.forEachToxel()
      }
    }
    img.src = filePath
  }

  forEachToxel () {
    Object.keys(this.images).forEach((name) => {
      const img = this.images[name]
      this.addToxelToAtlas(img, name)
    })
    return this.updateAtlas()
  }

  addToxelToAtlas (img, name) {
    const w = img.width / this.toxelSize
    const h = img.height / this.toxelSize
    if (this.oneFrame) {
      this.ctx.drawImage(
        img,
        0,
        0,
        this.toxelSize,
        this.toxelSize,
        (this.toxelX - 1) * this.toxelSize,
        (this.toxelY - 1) * this.toxelSize,
        this.toxelSize,
        this.toxelSize
      )
      this.textureMapping[`${name.substr(0, name.length - 4)}`] = {
        x: this.toxelX,
        y: this.toxelY
      }
      this.moveToxel()
    } else {
      if (w > 1 || h > 1) {
        for (let _i = 0; _i < w; _i++) {
          for (let _j = 0; _j < h; _j++) {
            this.ctx.drawImage(
              img,
              _i * this.toxelSize,
              _j * this.toxelSize,
              this.toxelSize,
              this.toxelSize,
              (this.toxelX - 1) * this.toxelSize,
              (this.toxelY - 1) * this.toxelSize,
              this.toxelSize,
              this.toxelSize
            )
            this.textureMapping[
                            `${name.substr(0, name.length - 4)}@${_i}@${_j}`
            ] = {
              x: this.toxelX,
              y: this.toxelY
            }
            this.moveToxel()
          }
        }
      } else {
        this.ctx.drawImage(
          img,
          (this.toxelX - 1) * this.toxelSize,
          (this.toxelY - 1) * this.toxelSize,
          this.toxelSize,
          this.toxelSize
        )
        this.textureMapping[name.substr(0, name.length - 4)] = {
          x: this.toxelX,
          y: this.toxelY
        }
        this.moveToxel()
      }
    }
  }

  moveToxel () {
    if (this.toxelX === this.atlasSize) {
      this.toxelX = 1
      this.toxelY += 1
    } else {
      this.toxelX += 1
    }
  }

  updateAtlas () {
    console.log(`\x1b[33m[${this.pref} Atlas]`)
    console.log(`\x1b[32mTotal images: ${this.totalImages}`)
    fs.writeFileSync(
            `${this.buildPath}/${this.pref}-Atlas.png`,
            this.canvas.toBuffer('image/png')
    )
    console.log(`\x1b[33mFull atlas: ${this.buildPath}/${this.pref}-Atlas.png`)
    fs.writeFileSync(`${this.buildPath}/${this.pref}-Mapping.json`, JSON.stringify(this.textureMapping, null, 2))
    console.log(`\x1b[33mFull atlas mapping: ${this.buildPath}/${this.pref}-Mapping.json`)
    console.log(`\x1b[32mSuccessfully generated ${this.canvas.width}x${this.canvas.height} Texture Atlas!\n\x1b[0m`)
  }
}

module.exports = AtlasCreator
