import { TextureLoader } from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import $ from 'jquery'
const Image = window.Image

class AssetLoader {
  constructor () {
    this.assets = new Map()
  }

  async init () {
    const assets = await $.get('assets/assetLoader.json')
    await this.load(assets)
    console.log('AssetLoader: done loading!')
  }

  async load (assets) {
    return new Promise((resolve) => {
      const textureLoader = new TextureLoader()
      const fbxl = new FBXLoader()
      const assetsNumber = Object.keys(assets).length
      let assetsLoaded = 0

      for (const assetName in assets) {
        // eslint-disable-next-line no-prototype-builtins
        if (!assets.hasOwnProperty(assetName)) continue

        const asset = assets[assetName]
        const img = new Image()
        switch (asset.type) {
          case 'texture':
            textureLoader.load(asset.path, (texture) => {
              this.assets.set(assetName, texture)
              assetsLoaded++
              if (assetsLoaded === assetsNumber) {
                return resolve()
              }
            })
            break
          case 'text':
            $.get(asset.path, (data) => {
              this.assets.set(assetName, data)
              assetsLoaded++
              if (assetsLoaded === assetsNumber) {
                return resolve()
              }
            })
            break
          case 'image':
            img.onload = () => {
              this.assets.set(assetName, img)
              assetsLoaded++
              if (assetsLoaded === assetsNumber) {
                return resolve()
              }
            }
            img.src = asset.path
            break
          case 'fbx':
            fbxl.load(asset.path, (fbx) => {
              this.assets.set(assetName, fbx)
              assetsLoaded++
              if (assetsLoaded === assetsNumber) {
                return resolve()
              }
            })
            break
        }
      }
    })
  }

  get (assetName) {
    return this.assets.get(assetName)
  }
}

export { AssetLoader }
