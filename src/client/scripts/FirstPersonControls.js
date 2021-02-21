import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
var FirstPersonControls = class FirstPersonControls {
    constructor(game) {
        this.game = game;
        this.kc = {
            KeyW: "forward",
            KeyD: "right",
            KeyS: "back",
            KeyA: "left",
            Space: "jump",
            ShiftLeft: "sneak",
            KeyR: "sprint",
        };
        this.keys = {};
        this.setState("menu");
        this.listen();
    }

    updatePosition(e) {
        //Updatowanie kursora
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

    listen() {
        var _this, lockChangeAlert;
        _this = this;
        $(document).keydown(function (z) {
            var to;
            //Kliknięcie
            _this.keys[z.code] = true;
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
            if (_this.kc[z.code] !== void 0 && _this.gameState === "gameLock") {
                _this.game.socket.emit("move", _this.kc[z.code], true);
                if (_this.kc[z.code] === "sprint") {
                    to = {
                        fov: _this.game.fov + 10,
                    };
                    new TWEEN.Tween(_this.game.camera)
                        .to(to, 200)
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .onUpdate(function () {
                            return _this.game.camera.updateProjectionMatrix();
                        })
                        .start();
                }
            }
        });
        $(document).keyup(function (z) {
            var to;
            //Odkliknięcie
            delete _this.keys[z.code];
            //Wysyłanie state'u do serwera
            if (_this.kc[z.code] !== void 0) {
                _this.game.socket.emit("move", _this.kc[z.code], false);
                if (_this.kc[z.code] === "sprint") {
                    to = {
                        fov: _this.game.fov,
                    };
                    new TWEEN.Tween(_this.game.camera)
                        .to(to, 200)
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .onUpdate(function () {
                            return _this.game.camera.updateProjectionMatrix();
                        })
                        .start();
                }
            }
        });
        $(".gameOn").click(function () {
            _this.setState("game");
        });
        window.onblur = function () {
            Object.keys(_this.kc).forEach(function (el) {
                _this.game.socket.emit("move", _this.kc[el], false);
            });
        };
        lockChangeAlert = function () {
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
        return this;
    }

    reqLock() {
        return this.game.canvas.requestPointerLock();
    }

    unLock() {
        document.exitPointerLock =
            document.exitPointerLock || document.mozExitPointerLock;
        return document.exitPointerLock();
    }

    state(state) {
        this.gameState = state;
        if (state === "inventory") {
            return this.game.pii.show();
        } else {
            return this.game.pii.hide();
        }
    }

    // console.log "Game state: "+state
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
                return this.reqLock();
            case "gameLock":
                this.state("gameLock");
                return $(".gameMenu").hide();
            case "menu":
                this.state("menu");
                $(".gameMenu").show();
                return this.unLock();
            case "chat":
                if (this.gameState === "gameLock") {
                    $(".chat").addClass("focus");
                    $(".chat").removeClass("blur");
                    $(".gameMenu").hide();
                    this.state("chat");
                    this.unLock();
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
                        return this.unLock();
                    } else {
                        return this.setState("game");
                    }
                }
        }
    }
};

export { FirstPersonControls };
