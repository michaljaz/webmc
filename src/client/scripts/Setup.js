import * as THREE from "three";
import Stats from "stats-js";
import * as dat from "dat.gui";
import { DistanceBasedFog } from "./DistanceBasedFog.js";
import { RandomNick } from "./RandomNick.js";
import { gpuInfo } from "./gpuInfo.js";

function preSetup(game) {
    game.canvas = document.querySelector("#c");
    game.pcanvas = document.querySelector("#c_player");
    game.renderer = new THREE.WebGLRenderer({
        canvas: game.canvas,
        PixelRatio: window.devicePixelRatio,
    });
    game.renderer.sortObjects = true;
    game.scene = new THREE.Scene();
    game.camera = new THREE.PerspectiveCamera(game.fov.normal, 2, 0.1, 1000);
    game.camera.rotation.order = "YXZ";
    game.camera.position.set(26, 26, 26);
    game.scene.add(new THREE.AmbientLight(0xffffff));
    game.stats = new Stats();
    game.drawcalls = game.stats.addPanel(
        new Stats.Panel("calls", "#ff8", "#221")
    );
    game.stats.showPanel(0);
    document.body.appendChild(game.stats.dom);
    game.distanceBasedFog = new DistanceBasedFog(game);
    RandomNick(game);
    console.warn(gpuInfo());
}
function postSetup(game) {
    var gui = new dat.GUI();
    game.params = {
        chunkdist: 3,
    };

    game.distanceBasedFog.farnear.x = (game.params.chunkdist - 1) * 16;
    game.distanceBasedFog.farnear.y = game.params.chunkdist * 16;
    gui.add(game.world.material, "wireframe").name("Wireframe").listen();
    var chunkDist = gui
        .add(game.params, "chunkdist", 0, 10, 1)
        .name("Render distance")
        .listen();
    chunkDist.onChange(function (val) {
        game.distanceBasedFog.farnear.x = (val - 1) * 16;
        game.distanceBasedFog.farnear.y = val * 16;
        console.log(val);
    });
}
export { preSetup, postSetup };
