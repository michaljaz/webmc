import * as THREE from "three";

var TextureAtlasCreator = class TextureAtlasCreator {
    constructor(options) {
        this.textureX = options.textureX;
        this.textureMapping = options.textureMapping;
        this.size = 36;
        this.willSize = 27;
    }

    gen(tick) {
        var multi = {};
        for (let i in this.textureMapping) {
            if (i.includes("@")) {
                var xd = this.decodeName(i);
                if (multi[xd.pref] === void 0) {
                    multi[xd.pref] = xd;
                } else {
                    multi[xd.pref].x = Math.max(multi[xd.pref].x, xd.x);
                    multi[xd.pref].y = Math.max(multi[xd.pref].y, xd.y);
                }
            }
        }
        var canvasx = document.createElement("canvas");
        var ctx = canvasx.getContext("2d");
        canvasx.width = this.willSize * 16;
        canvasx.height = this.willSize * 16;
        var toxelX = 1;
        var toxelY = 1;
        for (let i in this.textureMapping) {
            if (i.includes("@")) {
                xd = this.decodeName(i);
                if (multi[xd.pref].loaded === void 0) {
                    multi[xd.pref].loaded = true;
                    var lol = this.getToxelForTick(
                        tick,
                        multi[xd.pref].x + 1,
                        multi[xd.pref].y + 1
                    );
                    var texmap = this.textureMapping[
                        `${xd.pref}@${lol.col}@${lol.row}`
                    ];
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
                    );
                    toxelX++;
                    if (toxelX > this.willSize) {
                        toxelX = 1;
                        toxelY++;
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
                );
                toxelX++;
                if (toxelX > this.willSize) {
                    toxelX = 1;
                    toxelY++;
                }
            }
        }
        return canvasx;
    }

    decodeName(i) {
        var m = null;
        for (let j = 0; j < i.length; j++) {
            if (i[j] === "@") {
                m = j;
                break;
            }
        }
        var pref = i.substr(0, m);
        var sub = i.substr(m, i.length);
        var m2 = null;
        for (let j = 0; j < sub.length; j++) {
            if (sub[j] === "@") {
                m2 = j;
            }
        }
        var x = parseInt(sub.substr(1, m2 - 1));
        var y = parseInt(sub.substr(m2 + 1, sub.length));
        return { pref, x, y };
    }

    getToxelForTick(tick, w, h) {
        tick = (tick % (w * h)) + 1;
        //option1
        var col = (tick - 1) % w;
        var row = Math.ceil(tick / w) - 1;
        //option2
        col = Math.ceil(tick / h) - 1;
        row = (tick - 1) % h;
        return { row, col };
    }
};

var AnimatedTextureAtlas = class AnimatedTextureAtlas {
    constructor(game) {
        var _this = this;
        this.game = game;
        this.material = new THREE.MeshStandardMaterial({
            side: 0,
            map: null,
            vertexColors: true,
            transparent: true,
        });
        this.atlasCreator = new TextureAtlasCreator({
            textureX: this.game.al.get("blocksAtlasFull"),
            textureMapping: this.game.al.get("blocksMappingFull"),
        });
        var savedTextures = [];
        for (var i = 0; i < 10; i++) {
            var t = this.atlasCreator.gen(i).toDataURL();
            var tekstura = new THREE.TextureLoader().load(t);
            tekstura.magFilter = THREE.NearestFilter;
            tekstura.minFilter = THREE.NearestFilter;
            savedTextures.push(tekstura);
        }
        var tickq = 0;
        setInterval(function () {
            var tekst;
            tickq++;
            tekst = savedTextures[tickq % 9];
            _this.material.map = tekst;
            _this.material.map.needsUpdate = true;
        }, 100);
    }
};

export { AnimatedTextureAtlas, TextureAtlasCreator };
