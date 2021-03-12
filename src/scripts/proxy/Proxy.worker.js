import vec3 from "vec3";
import Convert from "ansi-to-html";
const convert = new Convert();

global.window = self;
global.importScripts("../../assets/mineflayer.js");
let bot = null;

const emit = (type, ...params) => {
    postMessage({ type, params });
};

addEventListener("message", function (e) {
    const type = e.data.type;
    let data = e.data.data;
    let block, state;
    let inv = "";
    switch (type) {
        case "init":
            data = data[0];
            bot = self.mineflayer(data.hostname, data.port, {
                host: data.server,
                port: data.serverPort,
                username: data.nick,
            });
            bot.heldItem = null;
            bot.on("chunkColumnLoad", (p) => {
                emit(
                    "mapChunk",
                    bot.world.getColumn(p.x / 16, p.z / 16).sections,
                    p.x / 16,
                    p.z / 16
                );
            });
            bot._client.on("respawn", function (packet) {
                emit("dimension", packet.dimension.value.effects.value);
            });
            bot.on("heldItemChanged", function (item) {
                bot.heldItem = item;
            });
            bot.on("login", function () {
                emit("login");
                emit("dimension", bot.game.dimension);
            });
            bot.on("move", function () {
                emit("move", bot.entity.position);
            });
            bot.on("health", function () {
                emit("hp", bot.health);
                emit("food", bot.food);
            });
            bot.on("spawn", function () {
                emit("spawn", bot.entity.yaw, bot.entity.pitch);
            });
            bot.on("kicked", function (reason) {
                emit("kicked", reason);
            });
            bot.on("message", function (msg) {
                let message = msg.toAnsi();

                const replacements = [
                    [/&/g, "&amp;"],
                    [/</g, "&lt;"],
                    [/>/g, "&gt;"],
                    [/"/g, "&quot;"],
                ];
                for (const replacement of replacements)
                    message = message.replace(replacement[0], replacement[1]);

                emit("msg", convert.toHtml(message));
            });
            bot.on("experience", function () {
                emit("xp", bot.experience);
            });
            bot.on("blockUpdate", function (oldb, newb) {
                emit("blockUpdate", [
                    newb.position.x,
                    newb.position.y,
                    newb.position.z,
                    newb.stateId,
                ]);
            });
            bot.on("diggingCompleted", function (block) {
                emit("diggingCompleted", block);
            });
            bot.on("diggingAborted", function (block) {
                emit("diggingAborted", block);
            });
            bot.on("game", function () {
                emit("game", bot.game);
            });
            setInterval(function () {
                if (bot.inventory !== undefined) {
                    const inv_new = JSON.stringify(bot.inventory.slots);
                    if (inv !== inv_new) {
                        inv = inv_new;
                        emit("inventory", bot.inventory.slots);
                    }
                }
                let entities = {
                    mobs: [],
                    players: [],
                };
                for (let k in bot.entities) {
                    const v = bot.entities[k];
                    if (v.type === "mob") {
                        entities.mobs.push([
                            v.position.x,
                            v.position.y,
                            v.position.z,
                        ]);
                    }
                    if (v.type === "player") {
                        entities.players.push([
                            v.username,
                            v.position.x,
                            v.position.y,
                            v.position.z,
                        ]);
                    }
                }
                emit("entities", entities);
            }, 100);
            break;
        case "move":
            state = data[0];
            if (state === "right") {
                state = "left";
            } else if (state === "left") {
                state = "right";
            }
            if (bot.setControlState !== undefined) {
                bot.setControlState(state, data[1]);
            }
            break;
        case "rotate":
            bot.look(data[0][0], data[0][1]);
            break;
        case "dig":
            block = bot.blockAt(vec3(data[0][0], data[0][1] - 16, data[0][2]));
            if (block !== null) {
                const digTime = bot.digTime(block);
                if (bot.targetDigBlock !== null) {
                    // console.log("Already digging...");
                    bot.stopDigging();
                }
                emit("digTime", digTime, block);
                // console.log("Start");
                bot.dig(block, false);
            }
            break;
        case "stopDigging":
            bot.stopDigging();
            break;
        case "fly":
            if (data[0]) {
                bot.creative.startFlying();
            } else {
                bot.creative.stopFlying();
            }
            break;
        case "command":
            bot.chat(data[0]);
            break;
        case "invc":
            if (bot.inventory !== undefined) {
                const item = bot.inventory.slots[data[0] + 36];
                if (item !== null && item !== void 0) {
                    bot.equip(item, "hand");
                } else if (bot.heldItem !== void 0) {
                    bot.unequip("hand");
                }
            }
            break;
        case "blockPlace":
            block = bot.blockAt(new vec3(...data[0]));
            if (bot.heldItem !== void 0 && bot.heldItem !== null) {
                // console.log(heldItem);
                bot.placeBlock(block, new vec3(...data[1]));
            }
            break;
    }
});
