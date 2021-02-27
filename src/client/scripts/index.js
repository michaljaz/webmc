import * as THREE from "three";
import io from "socket.io-client";
import TWEEN from "@tweenjs/tween.js";
import swal from "sweetalert";
import { World } from "./World/World.js";
import { AssetLoader } from "./AssetLoader.js";
import { InventoryBar } from "./InventoryBar.js";
import { Chat } from "./Chat.js";
import { Entities } from "./Entities.js";
import { PlayerInInventory } from "./PlayerInInventory.js";
import { BlockBreak } from "./BlockBreak.js";
import { BlockPlace } from "./BlockPlace.js";
import { EventHandler } from "./EventHandler.js";
import { preSetup, postSetup } from "./Setup.js";

class Game {
    constructor() {
        var _this = this;
        this.al = new AssetLoader(function () {
            _this.init();
        });
        return;
    }

    init() {
        var _this = this;
        if (PRODUCTION) {
            console.log("Running in production mode");
        } else {
            console.log("Running in development mode");
        }
        this.fov = {
            normal: 70,
            sprint: 85,
        };
        this.toxelSize = 27;
        this.dimension = null;
        this.flying = false;
        this.playerPos = [0, 0, 0];
        this.dimBg = {
            "minecraft:overworld": [165 / 255, 192 / 255, 254 / 255],
            "minecraft:the_end": [1 / 255, 20 / 255, 51 / 255],
            "minecraft:the_nether": [133 / 255, 40 / 255, 15 / 255],
            "minecraft:end": [1 / 255, 20 / 255, 51 / 255],
            "minecraft:nether": [133 / 255, 40 / 255, 15 / 255],
        };
        this.headHeight = 17;

        preSetup(this);

        this.socket = io({
            query: {
                nick: this.nick,
            },
        });
        this.pii = new PlayerInInventory(this);
        this.bb = new BlockBreak(this);
        this.bp = new BlockPlace(this);
        this.world = new World(this);
        this.ent = new Entities(this);
        this.chat = new Chat(this);
        this.inv_bar = new InventoryBar(this);
        this.eh = new EventHandler(this);
        this.distanceBasedFog.addShaderToMaterial(this.world.material);

        postSetup(this);

        this.socket.on("connect", function () {
            console.log("Connected to server!");
            $(".loadingText").text("Joining server...");
            console.log(`User nick: ${_this.nick}`);
            _this.socket.emit("initClient", {
                nick: _this.nick,
            });
        });
        this.socket.on("blockUpdate", function (block) {
            _this.world.setBlock(block[0], block[1] + 16, block[2], block[3]);
        });
        this.socket.on("spawn", function (yaw, pitch) {
            console.log("Player joined the game!");
            $(".initLoading").css("display", "none");
            _this.camera.rotation.y = yaw;
            _this.camera.rotation.x = pitch;
        });
        this.socket.on("dimension", function (dim) {
            _this.dimension = dim;
            console.log(`Player dimension has been changed: ${dim}`);
            _this.world.resetWorld();
            if (_this.dimBg[dim] == undefined) {
                dim = "minecraft:overworld";
            }
            var bg = _this.dimBg[dim];
            _this.scene.background = new THREE.Color(...bg);
            _this.distanceBasedFog.color.x = bg[0];
            _this.distanceBasedFog.color.y = bg[1];
            _this.distanceBasedFog.color.z = bg[2];
            _this.distanceBasedFog.color.w = 1;
        });
        this.socket.on("mapChunk", function (sections, x, z) {
            _this.world.computeSections(sections, x, z);
        });
        this.socket.on("game", function (gameData) {
            _this.inv_bar.setGamemode(gameData.gameMode);
        });
        this.socket.on("hp", function (points) {
            _this.inv_bar.setHp(points);
        });
        this.socket.on("inventory", function (inv) {
            _this.inv_bar.updateInv(inv);
        });
        this.socket.on("food", function (points) {
            _this.inv_bar.setFood(points);
        });
        this.socket.on("msg", function (msg) {
            _this.chat.log(msg);
        });
        this.socket.on("kicked", function (reason) {
            console.log(reason);
            swal({
                title: "You've been kicked!",
                text: JSON.parse(reason).extra[0].text,
                icon: "error",
                button: "Rejoin",
            }).then(function () {
                document.location.reload();
            });
        });
        this.socket.on("xp", function (xp) {
            _this.inv_bar.setXp(xp.level, xp.progress);
        });
        this.socket.on("move", function (pos) {
            _this.playerPos = [pos.x - 0.5, pos.y, pos.z - 0.5];
            var to = {
                x: pos.x - 0.5,
                y: pos.y + _this.headHeight,
                z: pos.z - 0.5,
            };
            new TWEEN.Tween(_this.camera.position)
                .to(to, 100)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
        });
        this.impulse = function () {
            var to = {
                x: _this.playerPos[0],
                y: _this.playerPos[1] + _this.headHeight,
                z: _this.playerPos[2],
            };
            new TWEEN.Tween(_this.camera.position)
                .to(to, 100)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
        };
        this.socket.on("entities", function (entities) {
            _this.ent.update(entities);
        });
        this.socket.on("diggingCompleted", function () {
            _this.bb.done = true;
            console.warn("SERVER-DONE");
        });
        this.socket.on("diggingAborted", function () {
            console.warn("SERVER-ABORT");
        });
        this.socket.on("digTime", function (time) {
            console.warn("SERVER-START");
            _this.bb.startDigging(time);
        });

        this.mouse = false;
        $(document).on("mousedown", function (e) {
            if (e.which === 1) {
                _this.mouse = true;
                if (_this.eh.gameState === "gameLock") {
                    _this.bb.digRequest();
                }
            } else if (e.which === 3) {
                _this.bp.placeBlock();
            }
        });
        $(document).on("mouseup", function (e) {
            if (e.which === 1) {
                _this.mouse = false;
                return _this.bb.stopDigging();
            }
        });
        return this.animate();
    }

    animate() {
        var _this = this;
        if (this.stats !== null) {
            this.stats.begin();
            this.render();
            this.stats.end();
        }
        requestAnimationFrame(function () {
            _this.animate();
        });
    }

    render() {
        var _this = this;
        var width = window.innerWidth;
        var height = window.innerHeight;
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.renderer.setSize(width, height, false);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
        this.bb.updatePos(function () {
            if (_this.bb.isDigging) {
                _this.bb.stopDigging();
            }
            if (_this.mouse && _this.bb.done) {
                return _this.bb.digRequest();
            }
        });
        this.world.updateCellsAroundPlayer(this.params.chunkdist);
        TWEEN.update();
        this.drawcalls.update(this.renderer.info.render.calls, 100);
        if (this.eh.gameState === "inventory") {
            this.pii.render();
        }
        this.inv_bar.update();
        this.distanceBasedFog.update();
        this.renderer.render(this.scene, this.camera);
    }
}

new Game();
