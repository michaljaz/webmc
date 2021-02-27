import TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
var modulo = function (a, b) {
    return ((+a % (b = +b)) + b) % b;
};
class EventHandler {
    constructor(game) {
        var _this = this;
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
        //Mouse wheel change inventory
        var focus = 0;
        this.game.inv_bar.setFocus(focus);
        $(window).on("wheel", function (e) {
            if (_this.gameState === "gameLock") {
                if (e.originalEvent.deltaY > 0) {
                    focus++;
                } else {
                    focus--;
                }
                focus = modulo(focus, 9);
                _this.game.inv_bar.setFocus(focus);
            }
        });
        //Keydown
        $(document).on("keydown", function (z) {
            _this.keys[z.code] = true;
            //Digits
            for (var i = 1; i < 10; i++) {
                if (z.code === `Digit${i}` && _this.gameState === "gameLock") {
                    _this.game.inv_bar.setFocus(i - 1);
                    focus = i - 1;
                }
            }
            //Klawisz Escape
            if (z.code === "Escape" && _this.gameState === "inventory") {
                _this.setState("menu");
            }
            //Strzałki
            if (z.code === "ArrowUp" && _this.gameState === "chat") {
                _this.game.chat.chatGoBack();
            }
            if (z.code === "ArrowDown" && _this.gameState === "chat") {
                _this.game.chat.chatGoForward();
            }
            //Klawisz Enter
            if (z.code === "Enter" && _this.gameState === "chat") {
                _this.game.chat.command($(".com_i").val());
                $(".com_i").val("");
            }
            //Klawisz E
            if (
                z.code === "KeyE" &&
                _this.gameState !== "chat" &&
                _this.gameState !== "menu"
            ) {
                _this.setState("inventory");
            }
            //Klawisz T lub /
            if (
                (z.code === "KeyT" || z.code === "Slash") &&
                _this.gameState === "gameLock"
            ) {
                if (z.code === "Slash") {
                    $(".com_i").val("/");
                }
                _this.setState("chat");
                z.preventDefault();
            }
            //Klawisz `
            if (z.code === "Backquote") {
                z.preventDefault();
                if (
                    _this.gameState === "menu" ||
                    _this.gameState === "chat" ||
                    _this.gameState === "inventory"
                ) {
                    _this.setState("game");
                } else {
                    _this.setState("menu");
                }
            }
            if (z.code === "Escape" && _this.gameState === "chat") {
                _this.setState("menu");
            }

            //Flying
            if (z.code === "KeyF") {
                _this.game.flying = !_this.game.flying;
                _this.game.socket.emit("fly", _this.game.flying);
            }
            //Wysyłanie state'u do serwera
            if (
                _this.controls[z.code] !== undefined &&
                _this.gameState === "gameLock"
            ) {
                _this.game.socket.emit("move", _this.controls[z.code], true);
                switch (_this.controls[z.code]) {
                    case "sprint":
                        var to = {
                            fov: _this.game.fov,
                        };
                        new TWEEN.Tween(_this.game.camera)
                            .to(to, 200)
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .onUpdate(function () {
                                return _this.game.camera.updateProjectionMatrix();
                            })
                            .start();
                        break;

                    case "sneak":
                        _this.game.headHeight = 16.7;
                        _this.game.impulse();
                        break;
                }
            }
        });
        //Keyup
        $(document).on("keyup", function (z) {
            delete _this.keys[z.code];
            if (_this.controls[z.code] !== undefined) {
                _this.game.socket.emit("move", _this.controls[z.code], false);
                switch (_this.controls[z.code]) {
                    case "sprint":
                        var to = {
                            fov: _this.game.fov,
                        };
                        new TWEEN.Tween(_this.game.camera)
                            .to(to, 200)
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .onUpdate(function () {
                                return _this.game.camera.updateProjectionMatrix();
                            })
                            .start();
                        break;

                    case "sneak":
                        _this.game.headHeight = 17;
                        _this.game.impulse();
                        break;
                }
            }
        });
        //Play game button
        $(".gameOn").on("click", function () {
            _this.setState("game");
        });
        //Window onblur
        window.onblur = function () {
            Object.keys(_this.controls).forEach(function (el) {
                _this.game.socket.emit("move", _this.controls[el], false);
            });
        };
        //Pointerlock
        var lockChangeAlert = function () {
            if (
                document.pointerLockElement === _this.game.canvas ||
                document.mozPointerLockElement === _this.game.canvas
            ) {
                //Lock
                if (_this.gameState === "game") {
                    _this.setState("gameLock");
                }
            } else {
                //Unlock
                if (
                    _this.gameState === "gameLock" &&
                    _this.gameState !== "inventory"
                ) {
                    _this.setState("menu");
                }
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
            function (e) {
                return _this.updatePosition(e);
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
