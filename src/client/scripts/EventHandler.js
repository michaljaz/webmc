import TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
var modulo = function (a, b) {
    return ((+a % (b = +b)) + b) % b;
};
class EventHandler {
    constructor(game) {
        this.game = game;
        this.controls = {
            KeyW: "forward",
            KeyD: "right",
            KeyS: "back",
            KeyA: "left",
            Space: "jump",
            ShiftLeft: "sneak",
            KeyR: "sprint",
        };
        this.keys = {};
        this.gameState = null;
        this.setState("menu");
        document.exitPointerLock =
            document.exitPointerLock || document.mozExitPointerLock;
        var focus = 0;
        this.game.inv_bar.setFocus(focus);
        $(window).on("wheel", (e) => {
            if (this.gameState === "gameLock") {
                if (e.originalEvent.deltaY > 0) {
                    focus++;
                } else {
                    focus--;
                }
                focus = modulo(focus, 9);
                this.game.inv_bar.setFocus(focus);
            }
        });
        $(document).on("keydown", (z) => {
            this.keys[z.code] = true;
            for (var i = 1; i < 10; i++) {
                if (z.code === `Digit${i}` && this.gameState === "gameLock") {
                    this.game.inv_bar.setFocus(i - 1);
                    focus = i - 1;
                }
            }
            if (z.code === "Escape" && this.gameState === "inventory") {
                this.setState("menu");
            }
            if (z.code === "ArrowUp" && this.gameState === "chat") {
                this.game.chat.chatGoBack();
            }
            if (z.code === "ArrowDown" && this.gameState === "chat") {
                this.game.chat.chatGoForward();
            }
            if (z.code === "Enter" && this.gameState === "chat") {
                this.game.chat.command($(".com_i").val());
                $(".com_i").val("");
                this.setState("game")
            }
            if (
                z.code === "KeyE" &&
                this.gameState !== "chat" &&
                this.gameState !== "menu"
            ) {
                this.setState("inventory");
            }
            if (
                (z.code === "KeyT" || z.code === "Slash") &&
                this.gameState === "gameLock"
            ) {
                if (z.code === "Slash") {
                    $(".com_i").val("/");
                }
                this.setState("chat");
                z.preventDefault();
            }
            if (z.code === "Backquote") {
                z.preventDefault();
                if (
                    this.gameState === "menu" ||
                    this.gameState === "chat" ||
                    this.gameState === "inventory"
                ) {
                    this.setState("game");
                } else {
                    this.setState("menu");
                }
            }
            if (z.code === "Escape" && this.gameState === "chat") {
                this.setState("menu");
            }
            if (z.code === "KeyF") {
                this.game.flying = !this.game.flying;
                this.game.socket.emit("fly", this.game.flying);
            }
            if (
                this.controls[z.code] !== undefined &&
                this.gameState === "gameLock"
            ) {
                this.game.socket.emit("move", this.controls[z.code], true);
                switch (this.controls[z.code]) {
                    case "sprint":
                        var to = {
                            fov: this.game.fov.sprint,
                        };
                        new TWEEN.Tween(this.game.camera)
                            .to(to, 200)
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .onUpdate(() => {
                                return this.game.camera.updateProjectionMatrix();
                            })
                            .start();
                        break;

                    case "sneak":
                        this.game.headHeight = 16.7;
                        this.game.playerImpulse();
                        break;
                }
            }
        });
        $(document).on("keyup", (z) => {
            delete this.keys[z.code];
            if (this.controls[z.code] !== undefined) {
                this.game.socket.emit("move", this.controls[z.code], false);
                switch (this.controls[z.code]) {
                    case "sprint":
                        var to = {
                            fov: this.game.fov.normal,
                        };
                        new TWEEN.Tween(this.game.camera)
                            .to(to, 200)
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .onUpdate(() => {
                                return this.game.camera.updateProjectionMatrix();
                            })
                            .start();
                        break;

                    case "sneak":
                        this.game.headHeight = 17;
                        this.game.playerImpulse();
                        break;
                }
            }
        });
        $(".gameOn").on("click", () => {
            this.setState("game");
        });
        window.onblur = () => {
            Object.keys(this.controls).forEach((el) => {
                this.game.socket.emit("move", this.controls[el], false);
            });
        };
        var lockChangeAlert = () => {
            if (
                document.pointerLockElement === this.game.canvas ||
                document.mozPointerLockElement === this.game.canvas
            ) {
                if (this.gameState === "game") {
                    this.setState("gameLock");
                }
            } else if (
                this.gameState === "gameLock" &&
                this.gameState !== "inventory"
            ) {
                this.setState("menu");
            }
        };
        document.addEventListener("pointerlockchange", lockChangeAlert, false);
        document.addEventListener(
            "mozpointerlockchange",
            lockChangeAlert,
            false
        );
        document.addEventListener(
            "mousemove",
            (e) => {
                return this.updatePosition(e);
            },
            false
        );
    }
    updatePosition(e) {
        if (this.gameState === "gameLock") {
            this.game.camera.rotation.x -= THREE.MathUtils.degToRad(
                e.movementY / 10
            );
            this.game.camera.rotation.y -= THREE.MathUtils.degToRad(
                e.movementX / 10
            );
            if (THREE.MathUtils.radToDeg(this.game.camera.rotation.x) < -90) {
                this.game.camera.rotation.x = THREE.MathUtils.degToRad(-90);
            }
            if (THREE.MathUtils.radToDeg(this.game.camera.rotation.x) > 90) {
                this.game.camera.rotation.x = THREE.MathUtils.degToRad(90);
            }
            this.game.socket.emit("rotate", [
                this.game.camera.rotation.y,
                this.game.camera.rotation.x,
            ]);
        }
    }
    state(state) {
        this.gameState = state;
        if (state === "inventory") {
            return this.game.pii.show();
        } else {
            return this.game.pii.hide();
        }
    }
    resetState() {
        $(".chat").removeClass("focus");
        $(".chat").addClass("blur");
        $(".com_i").blur();
        $(".com").hide();
        return $(".inv_window").hide();
    }
    setState(state) {
        this.resetState();
        switch (state) {
            case "game":
                this.state("game");
                this.game.canvas.requestPointerLock();
                break;
            case "gameLock":
                this.state("gameLock");
                $(".gameMenu").hide();
                break;
            case "menu":
                this.state("menu");
                $(".gameMenu").show();
                document.exitPointerLock();
                break;
            case "chat":
                if (this.gameState === "gameLock") {
                    $(".chat").addClass("focus");
                    $(".chat").removeClass("blur");
                    $(".gameMenu").hide();
                    this.state("chat");
                    document.exitPointerLock();
                    $(".com").show();
                    return $(".com_i").focus();
                }
                break;
            case "inventory":
                if (this.gameState !== "menu") {
                    $(".gameMenu").hide();
                    if (this.gameState !== "inventory") {
                        this.state("inventory");
                        $(".inv_window").show();
                        document.exitPointerLock();
                    } else {
                        this.setState("game");
                    }
                }
                break;
        }
    }
}
export { EventHandler };
