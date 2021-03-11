const version = "1.16.5";
const opn = require("open");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const mineflayer = require("mineflayer");
const Chunk = require("prismarine-chunk")(version);
const vec3 = require("vec3");
const Convert = require("ansi-to-html");
const convert = new Convert();
const helmet = require("helmet");
const compression = require("compression");
const WebSocket = require("ws");
const { encode, decode } = require("@msgpack/msgpack");
const port = process.env.PORT || 8080;

app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);
app.use(compression());

const wss = new WebSocket.Server({
    server,
    clientTracking: false,
});

const mode = process.argv[2];
if (mode === "production") {
    app.use(express.static(`${__dirname}/src/dist`));
} else if (mode === "development") {
    const webpack = require("webpack");
    const middleware = require("webpack-dev-middleware");
    const devconfig = require(`${__dirname}/src/webpack.dev.js`);
    const compiler = webpack(devconfig);
    app.use(middleware(compiler));
} else {
    console.log("Incorrect mode!");
}
server.listen(port, function () {
    opn(`http://localhost:${port}`);
    return console.log(`Server is running on \x1b[34m*:${port}\x1b[0m`);
});

const botByNick = new Map();
wss.on("connection", (socket, req) => {
    const query = new URLSearchParams(req.url.substr(2, req.url.length));
    const emit = (type, ...data) => {
        socket.send(encode([type, ...data]));
    };

    if (botByNick.get([query.get("nick"),query.get("server")]) !== undefined) {
        emit("alreadyPlaying");
        return;
    }
    console.log(`[\x1b[32m+\x1b[0m] ${query.get("nick")}`);
    let heldItem = null;
    const bot = mineflayer.createBot({
        host: query.get("server"),
        port: query.get("port") !== "null" ? query.get("port") : null,
        username: query.get("nick"),
        version: version,
        password:
            query.get("premium") === "true" ? query.get("password") : undefined,
    });
    botByNick.set([query.get("nick"),query.get("server")], bot);
    bot._client.on("map_chunk", function (packet) {
        const cell = new Chunk();
        cell.load(packet.chunkData, packet.bitMap, true, true);
        emit("mapChunk", cell.sections, packet.x, packet.z);
    });
    bot._client.on("respawn", function (packet) {
        emit("dimension", packet.dimension.value.effects.value);
    });
    bot.on("heldItemChanged", function (item) {
        heldItem = item;
    });
    bot.on("login", function () {
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
    let inv = "";
    const interval = setInterval(function () {
        const inv_new = JSON.stringify(bot.inventory.slots);
        if (inv !== inv_new) {
            inv = inv_new;
            emit("inventory", bot.inventory.slots);
        }
        let entities = {
            mobs: [],
            players: [],
        };
        for (let k in bot.entities) {
            const v = bot.entities[k];
            if (v.type === "mob") {
                entities.mobs.push([v.position.x, v.position.y, v.position.z]);
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

    const handlers = new Map();

    bot.once("spawn", function () {
        handlers.set("fly", function (toggle) {
            if (toggle) {
                bot.creative.startFlying();
            } else {
                bot.creative.stopFlying();
            }
        });
        handlers.set("blockPlace", function (pos, vec) {
            const block = bot.blockAt(new vec3(...pos));
            if (heldItem !== void 0 && heldItem !== null) {
                console.log(heldItem);
                bot.placeBlock(block, new vec3(...vec), function (r) {
                    console.log(r);
                });
            }
        });
        handlers.set("invc", function (num) {
            const item = bot.inventory.slots[num + 36];
            if (item !== null && item !== void 0) {
                bot.equip(item, "hand");
            } else if (heldItem !== void 0) {
                bot.unequip("hand");
            }
        });
        handlers.set("move", function (state, toggle) {
            if (state === "right") {
                state = "left";
            } else if (state === "left") {
                state = "right";
            }
            bot.setControlState(state, toggle);
        });
        handlers.set("command", function (com) {
            bot.chat(com);
        });
        handlers.set("rotate", function (data) {
            bot.look(...data);
        });
        handlers.set("dig", function (pos) {
            const block = bot.blockAt(vec3(pos[0], pos[1] - 16, pos[2]));
            if (block !== null) {
                const digTime = bot.digTime(block);
                if (bot.targetDigBlock !== null) {
                    console.log("Already digging...");
                    bot.stopDigging();
                }
                emit("digTime", digTime, block);
                console.log("Start");
                bot.dig(block, false, function (xd) {
                    if (xd === void 0) {
                        return console.log("SUCCESS");
                    } else {
                        return console.log("FAIL");
                    }
                });
            }
        });
        handlers.set("stopDigging", function () {
            bot.stopDigging();
        });

        socket.on("close", () => {
            try {
                clearInterval(interval);
                console.log(`[\x1b[31m-\x1b[0m] ${query.get("nick")}`);
                botByNick.delete([query.get("nick"),query.get("server")]);
                bot.end();
            } catch (error) {}
        });

        socket.on("message", (message) => {
            try {
                const [type, ...data] = decode(message);

                const handler = handlers.get(type);

                handler(...data);
            } catch (err) {
                console.log(err);
            }
        });
    });
});
