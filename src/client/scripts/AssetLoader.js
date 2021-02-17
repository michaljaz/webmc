import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

var AssetLoader = class AssetLoader {
    constructor(init) {
        var _this = this;
        this.assets = {};
        $.get("assets/assetLoader.json", function (assets) {
            _this.load(assets, function () {
                console.log("AssetLoader: done loading!");
                if (init !== null) {
                    init(_this);
                }
            });
        });
        return;
    }

    load(assets, callback) {
        var _this = this;
        var textureLoader = new THREE.TextureLoader();
        var fbxl = new FBXLoader();
        var assetsNumber = 0;
        var assetsLoaded = 0;
        Object.keys(assets).forEach(function () {
            return assetsNumber++;
        });
        Object.keys(assets).forEach(function (p) {
            var img, path, type;
            type = assets[p].type;
            path = assets[p].path;
            if (type === "texture") {
                textureLoader.load(path, function (texture) {
                    _this.assets[p] = texture;
                    assetsLoaded++;
                    if (assetsLoaded === assetsNumber) {
                        return callback();
                    }
                });
            }
            if (type === "text") {
                $.get(path, function (data) {
                    _this.assets[p] = data;
                    assetsLoaded++;
                    if (assetsLoaded === assetsNumber) {
                        return callback();
                    }
                });
            }
            if (type === "image") {
                img = new Image();
                img.onload = function () {
                    _this.assets[p] = img;
                    assetsLoaded++;
                    if (assetsLoaded === assetsNumber) {
                        return callback();
                    }
                };
                img.src = path;
            }
            if (type === "fbx") {
                return fbxl.load(path, function (fbx) {
                    _this.assets[p] = fbx;
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
};

export { AssetLoader };
