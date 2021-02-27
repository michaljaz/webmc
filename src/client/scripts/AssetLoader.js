import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

class AssetLoader {
    constructor(init) {
        this.assets = {};
        $.get("assets/assetLoader.json", (assets) => {
            this.load(assets, function () {
                console.log("AssetLoader: done loading!");
                if (init !== null) {
                    init(this);
                }
            });
        });
        return;
    }

    load(assets, callback) {
        var textureLoader = new THREE.TextureLoader();
        var fbxl = new FBXLoader();
        var assetsNumber = 0;
        var assetsLoaded = 0;
        Object.keys(assets).forEach(function () {
            return assetsNumber++;
        });
        Object.keys(assets).forEach((p) => {
            var img, path, type;
            type = assets[p].type;
            path = assets[p].path;
            if (type === "texture") {
                textureLoader.load(path, (texture) => {
                    this.assets[p] = texture;
                    assetsLoaded++;
                    if (assetsLoaded === assetsNumber) {
                        return callback();
                    }
                });
            }
            if (type === "text") {
                $.get(path, (data) => {
                    this.assets[p] = data;
                    assetsLoaded++;
                    if (assetsLoaded === assetsNumber) {
                        return callback();
                    }
                });
            }
            if (type === "image") {
                img = new Image();
                img.onload = () => {
                    this.assets[p] = img;
                    assetsLoaded++;
                    if (assetsLoaded === assetsNumber) {
                        return callback();
                    }
                };
                img.src = path;
            }
            if (type === "fbx") {
                return fbxl.load(path, (fbx) => {
                    this.assets[p] = fbx;
                    assetsLoaded++;
                    if (assetsLoaded === assetsNumber) {
                        return callback();
                    }
                });
            }
        });
        return this;
    }

    get(assetName) {
        return this.assets[assetName];
    }
}

export { AssetLoader };
