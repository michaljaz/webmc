import * as THREE from "three";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader.js";

class AssetLoader {
    constructor() {
        this.assets = new Map();
    }

    async init() {
        return new Promise(async (resolve) => {
            let assets = await $.get("assets/assetLoader.json");
            await this.load(assets, () => {
                console.log("AssetLoader: done loading!");
                resolve()
            });
        })
    }

    async load(assets, callback) {

        var textureLoader = new THREE.TextureLoader();
        var fbxl = new FBXLoader();
        var assetsNumber = Object.keys(assets).length;
        var assetsLoaded = 0;

        for (const assetName in assets) {
            if(!assets.hasOwnProperty(assetName))
                continue;

            let asset = assets[assetName];
            var img;

            switch (asset.type) {
                case "texture":
                    textureLoader.load(asset.path, (texture) => {
                        this.assets[assetName] = texture;
                        assetsLoaded++;
                        if (assetsLoaded === assetsNumber) {
                            return callback();
                        }
                    });
                    break;
                case "text":
                    $.get(asset.path, (data) => {
                        this.assets[assetName] = data;
                        assetsLoaded++;
                        if (assetsLoaded === assetsNumber) {
                            return callback();
                        }
                    });
                    break;
                case "image":
                    img = new Image();
                    img.onload = () => {
                        this.assets[assetName] = img;
                        assetsLoaded++;
                        if (assetsLoaded === assetsNumber) {
                            return callback();
                        }
                    };
                    img.src = asset.path;
                    break;
                case "fbx":
                    fbxl.load(asset.path, (fbx) => {
                        this.assets[assetName] = fbx;
                        assetsLoaded++;
                        if (assetsLoaded === assetsNumber) {
                            return callback();
                        }
                    });
                    break;
            }
        }
        return this;
    }

    get(assetName) {
        return this.assets[assetName];
    }
}

export {AssetLoader};
