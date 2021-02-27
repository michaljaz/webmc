import * as THREE from "three";
import Stats from "stats-js";
import * as dat from "dat.gui";
import io from "socket.io-client";
import TWEEN from "@tweenjs/tween.js";
import { World } from "./World/World.js";
import { gpuInfo } from "./gpuInfo.js";
import { AssetLoader } from "./AssetLoader.js";
import { InventoryBar } from "./InventoryBar.js";
import { RandomNick } from "./RandomNick.js";
import { Chat } from "./Chat.js";
import { Entities } from "./Entities.js";
import { PlayerInInventory } from "./PlayerInInventory.js";
import { BlockBreak } from "./BlockBreak.js";
import { BlockPlace } from "./BlockPlace.js";
import { DistanceBasedFog } from "./DistanceBasedFog.js";
import { EventHandler } from "./EventHandler.js";

const dimNamesInt = {
    "-1": "minecraft:nether",
    0: "minecraft:overworld",
    1: "minecraft:end",
};

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
        this.fov = 70;
        this.toxelSize = 27;
        this.cellSize = 16;
        this.canvas = document.querySelector("#c");
        this.pcanvas = document.querySelector("#c_player");
        this.dimension = null;
        this.flying = false;
        if (PRODUCTION) {
            console.log("Running in production mode");
        } else {
            console.log("Running in development mode");
        }
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            PixelRatio: window.devicePixelRatio,
        });
        this.renderer.sortObjects = true;
        this.scene = new THREE.Scene();
        this.playerPos = [0, 0, 0];
        this.dimBg = {
            "minecraft:overworld": [165 / 255, 192 / 255, 254 / 255],
            "minecraft:the_end": [1 / 255, 20 / 255, 51 / 255],
            "minecraft:the_nether": [133 / 255, 40 / 255, 15 / 255],

            "minecraft:end": [1 / 255, 20 / 255, 51 / 255],
            "minecraft:nether": [133 / 255, 40 / 255, 15 / 255],
        };
        this.camera = new THREE.PerspectiveCamera(this.fov, 2, 0.1, 1000);
        this.camera.rotation.order = "YXZ";
        this.camera.position.set(26, 26, 26);
        this.scene.add(new THREE.AmbientLight(0xffffff));
        this.distanceBasedFog = new DistanceBasedFog();
        console.warn(gpuInfo());
        this.nick = document.location.hash.substring(
            1,
            document.location.hash.length
        );
        if (this.nick === "") {
            this.nick = RandomNick();
            document.location.href = `#${this.nick}`;
        }
        this.socket = io({
            query: {
                nick: this.nick,
            },
        });
        this.stats = new Stats();
        this.drawcalls = this.stats.addPanel(
            new Stats.Panel("calls", "#ff8", "#221")
        );
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
        this.headHeight = 17;
        this.pii = new PlayerInInventory(this);
        this.bb = new BlockBreak(this);
        this.bp = new BlockPlace(this);
        this.world = new World(this);
        this.ent = new Entities(this);
        this.chat = new Chat(this);
        this.inv_bar = new InventoryBar(this);
        this.eh = new EventHandler(this);
        this.distanceBasedFog.addShaderToMaterial(this.world.material);
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
        this.socket.on("dimension", function (dim, format) {
            switch (format) {
                case "int":
                    dim = dimNamesInt[dim];
                    break;

                case "world":
                    // idk what this is yet
                    break;
            }

            _this.dimension = dim;
            console.log(`Player dimension has been changed: ${dim}`);
            _this.world.resetWorld();

            var bg = _this.dimBg[dim];
            if (bg === undefined) {
                bg = _this.dimBg["minecraft:overworld"];

                _this.scene.background = new THREE.Color(
                    ..._this.dimBg["minecraft:overworld"]
                );
            } else {
                _this.scene.background = new THREE.Color(...bg);
            }

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
            _this.chat.log(
                "You have been kicked! Reason: " + JSON.parse(reason).text
            );
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
        var gui = new dat.GUI();
        this.params = {
            chunkdist: 3,
        };
        this.distanceBasedFog.farnear.x = (this.params.chunkdist - 1) * 16;
        this.distanceBasedFog.farnear.y = this.params.chunkdist * 16;
        gui.add(this.world.material, "wireframe").name("Wireframe").listen();
        var chunkDist = gui
            .add(this.params, "chunkdist", 0, 10, 1)
            .name("Render distance")
            .listen();
        chunkDist.onChange(function (val) {
            _this.distanceBasedFog.farnear.x = (val - 1) * 16;
            _this.distanceBasedFog.farnear.y = val * 16;
            console.log(val);
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
        this.inv_bar.tick();
        this.distanceBasedFog.view
            .copy(this.camera.position)
            .applyMatrix4(this.camera.matrixWorldInverse);
        this.renderer.render(this.scene, this.camera);
    }
}

new Game();
