import {
    WebGLRenderer,
    Scene,
    Color,
    AmbientLight,
    NearestFilter,
    PerspectiveCamera,
} from "three";

class PlayerInInventory {
    constructor(game) {
        this.game = game;
        this.renderer = new WebGLRenderer({
            canvas: this.game.pcanvas,
            PixelRatio: window.devicePixelRatio,
        });
        this.scene = new Scene();
        this.scene.background = new Color("black");
        const light = new AmbientLight(0xffffff);
        this.scene.add(light);
        const player = this.game.al.get("player");
        const playerTex = this.game.al.get("playerTex");
        playerTex.magFilter = NearestFilter;
        player.children[0].material.map = playerTex;
        this.scene.add(player);
        this.camera = new PerspectiveCamera(70, 140 / 204, 0.1, 1000);
        this.camera.rotation.order = "YXZ";
        this.camera.position.z = 210;
        this.camera.position.y = 120;
        $(window).mousemove(function (z) {
            const xoff = z.pageX - window.innerWidth / 2 + 112;
            const yoff = z.pageY - window.innerHeight / 2 + 170;
            const left = xoff / (window.innerWidth / 2 - 112);
            const right = xoff / (window.innerWidth / 2 + 112);
            const top = yoff / (window.innerHeight / 2 - 170);
            const bottom = yoff / (window.innerHeight / 2 + 170);
            const wych_x = Math.PI / 3;
            const wych_y = Math.PI / 4;
            if (xoff > 0) {
                player.rotation.y = wych_x * right;
            } else {
                player.rotation.y = wych_x * left;
            }
            if (yoff > 0) {
                return (player.children[1].children[0].children[2].children[0].children[0].rotation.x =
                    wych_y * bottom);
            } else {
                return (player.children[1].children[0].children[2].children[0].children[0].rotation.x =
                    wych_y * top);
            }
        });
    }

    render() {
        return this.renderer.render(this.scene, this.camera);
    }

    show() {
        return (this.game.pcanvas.style.display = "block");
    }

    hide() {
        return (this.game.pcanvas.style.display = "none");
    }
}

export { PlayerInInventory };
