import { WebGLRenderer, Scene, PerspectiveCamera, AmbientLight } from "three";
import TWEEN from "@tweenjs/tween.js";
import Stats from "stats-js";
import * as dat from "dat.gui";
import { DistanceBasedFog } from "./DistanceBasedFog.js";
import { UrlParams } from "./UrlParams.js";
import { gpuInfo } from "./gpuInfo.js";
import { World } from "./World/World.js";
import { InventoryBar } from "./InventoryBar.js";
import { Chat } from "./Chat.js";
import { Entities } from "./Entities.js";
import { PlayerInInventory } from "./PlayerInInventory.js";
import { BlockBreak } from "./BlockBreak.js";
import { BlockPlace } from "./BlockPlace.js";
import { EventHandler } from "./EventHandler.js";
import { Socket } from "./Socket.js";

async function Setup(game) {
    return new Promise((resolve) => {
        game.canvas = document.querySelector("#c");
        game.pcanvas = document.querySelector("#c_player");
        game.renderer = new WebGLRenderer({
            canvas: game.canvas,
            PixelRatio: window.devicePixelRatio,
        });
        game.renderer.sortObjects = true;
        game.scene = new Scene();
        game.camera = new PerspectiveCamera(game.fov.normal, 2, 0.1, 1000);
        game.camera.rotation.order = "YXZ";
        game.camera.position.set(26, 26, 26);
        game.scene.add(new AmbientLight(0xdddddd));
        game.stats = new Stats();
        game.drawcalls = game.stats.addPanel(
            new Stats.Panel("calls", "#ff8", "#221")
        );
        game.stats.showPanel(0);
        document.body.appendChild(game.stats.dom);
        game.distanceBasedFog = new DistanceBasedFog(game);
        UrlParams(game, (password) => {
            console.warn(gpuInfo());
            let prefix;
            if (document.location.protocol === "https:") {
                prefix = "wss";
            } else {
                prefix = "ws";
            }
            game.socket = new Socket(
                game,
                `${prefix}://${document.location.host}?nick=${game.nick}&server=${game.server}&port=${game.serverPort}&password=${password}&premium=${game.premium}`
            );

            game.pii = new PlayerInInventory(game);
            game.bb = new BlockBreak(game);
            game.bp = new BlockPlace(game);
            game.world = new World(game);
            game.ent = new Entities(game);
            game.chat = new Chat(game);
            game.inv_bar = new InventoryBar(game);
            game.distanceBasedFog.addShaderToMaterial(game.world.material);
            game.distanceBasedFog.addShaderToMaterial(game.ent.mobMaterial);
            game.distanceBasedFog.addShaderToMaterial(game.ent.playerMaterial);
            const gui = new dat.GUI();
            game.params = {
                chunkdist: 3,
            };
            game.distanceBasedFog.farnear.x = (game.params.chunkdist - 2) * 16;
            game.distanceBasedFog.farnear.y = (game.params.chunkdist - 1) * 16;
            gui.add(game.world.material, "wireframe")
                .name("Wireframe")
                .listen();
            const chunkDist = gui
                .add(game.params, "chunkdist", 0, 10, 1)
                .name("Render distance")
                .listen();
            chunkDist.onChange(function (val) {
                game.distanceBasedFog.farnear.x = (val - 2) * 16;
                game.distanceBasedFog.farnear.y = (val - 1) * 16;
                console.log(val);
            });
            game.playerImpulse = function () {
                const to = {
                    x: game.playerPos[0],
                    y: game.playerPos[1] + game.headHeight,
                    z: game.playerPos[2],
                };
                new TWEEN.Tween(game.camera.position)
                    .to(to, 100)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .start();
            };

            game.socket.ws.onopen = () => {
                game.eh = new EventHandler(game);
                resolve();
            };
        });
    });
}

export { Setup };
