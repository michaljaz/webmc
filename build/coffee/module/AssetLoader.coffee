import * as THREE from './../module/build/three.module.js'
import {FBXLoader} from './../module/jsm/loaders/FBXLoader.js'

class AssetLoader
	constructor: (options)->
		@assets={}
	load: (assets,callback) ->
		_this=@
		textureLoader = new THREE.TextureLoader
		fbxl = new FBXLoader()
		assetsNumber=0
		assetsLoaded=0
		Object.keys(assets).forEach (p)->
			assetsNumber++
		Object.keys(assets).forEach (p)->
			type=assets[p].type
			path=assets[p].path
			dynamic=assets[p].dynamic;
			if dynamic
				path+="?"+THREE.MathUtils.generateUUID()
			if type is "texture"
				textureLoader.load path,(texture)->
					_this.assets[p]=texture
					assetsLoaded++;
					if assetsLoaded is assetsNumber
						callback()
			if type is "text"
				$.get path,(data)->
					_this.assets[p]=data
					assetsLoaded++;
					if assetsLoaded is assetsNumber
						callback()
			if type is "image"
				img = new Image
				img.onload= ->
					_this.assets[p]=img
					assetsLoaded++;
					if assetsLoaded is assetsNumber
						callback()
				img.src=path
			if type is "fbx"
				fbxl.load path,(fbx)->
					_this.assets[p]=fbx
					assetsLoaded++;
					if assetsLoaded is assetsNumber
						callback()
		return this;
	get: (assetName)->
		return @assets[assetName]

export {AssetLoader}