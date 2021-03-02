import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

class AssetLoader {
    constructor() {
        this.assets = new Map();
    }

    async init() {
        let assets = await $.get("assets/assetLoader.json");
        await this.load(assets);
        console.log("AssetLoader: done loading!");
    }

    async load(assets) {
        return new Promise((resolve) => {
            var textureLoader = new THREE.TextureLoader();
            var fbxl = new FBXLoader();
            var assetsNumber = Object.keys(assets).length;
            var assetsLoaded = 0;

            for (const assetName in assets) {
                if (!assets.hasOwnProperty(assetName)) continue;

                let asset = assets[assetName];

                switch (asset.type) {
                    case "texture":
                        textureLoader.load(asset.path, (texture) => {
                            this.assets.set(assetName, texture);
                            assetsLoaded++;
                            if (assetsLoaded === assetsNumber) {
                                return resolve();
                            }
                        });
                        break;
                    case "text":
                        $.get(asset.path, (data) => {
                            this.assets.set(assetName, data);
                            assetsLoaded++;
                            if (assetsLoaded === assetsNumber) {
                                return resolve();
                            }
                        });
                        break;
                    case "image":
                        var img = new Image();
                        img.onload = () => {
                            this.assets.set(assetName, img);
                            assetsLoaded++;
                            if (assetsLoaded === assetsNumber) {
                                return resolve();
                            }
                        };
                        img.src = asset.path;
                        break;
                    case "fbx":
                        fbxl.load(asset.path, (fbx) => {
                            this.assets.set(assetName, fbx);
                            assetsLoaded++;
                            if (assetsLoaded === assetsNumber) {
                                return resolve();
                            }
                        });
                        break;
                }
            }
        });
    }

    get(assetName) {
        return this.assets.get(assetName);
    }
}

export { AssetLoader };
