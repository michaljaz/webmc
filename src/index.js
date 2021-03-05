var version = "1.16.5";
var opn = require("open");
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var mineflayer = require("mineflayer");
var Chunk = require("prismarine-chunk")(version);
var vec3 = require("vec3");
var Convert = require("ansi-to-html");
var convert = new Convert();
var helmet = require("helmet");
var compression = require("compression");
const WebSocket = require("ws");
const qs = require("qs");
const { encode, decode } = require("@msgpack/msgpack");
var port = process.env.PORT || 8080;

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

var mode = process.argv[2];
if (mode === "production") {
    app.use(express.static(`${__dirname}/client/dist`));
} else if (mode === "development") {
    var webpack = require("webpack");
    var middleware = require("webpack-dev-middleware");
    var devconfig = require(`${__dirname}/client/webpack.dev.js`);
    var compiler = webpack(devconfig);
    app.use(middleware(compiler));
} else {
    console.log("Incorrect mode!");
}
server.listen(port, function () {
    opn(`http://localhost:${port}`);
    return console.log(`Server is running on \x1b[34m*:${port}\x1b[0m`);
});

var botByNick = {};

wss.on("connection", (socket, req) => {
    const emit = (type, ...data) => {
        socket.send(encode([type, ...data]));
    };

    const query = qs.parse(req.url.substr(1), { ignoreQueryPrefix: true });

    console.log(`[\x1b[32m+\x1b[0m] ${query.nick}`);
    var heldItem = null;
    var bot = mineflayer.createBot({
        host: query.server,
        port: query.port,
        username: query.nick,
        version: version,
        password: query.premium === "true" ? query.password : undefined,
    });
    botByNick[query.nick] = bot;
    bot._client.on("map_chunk", function (packet) {
        var cell = new Chunk();
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
    var inv = "";
    var interval = setInterval(function () {
        var inv_new = JSON.stringify(bot.inventory.slots);
        if (inv !== inv_new) {
            inv = inv_new;
            emit("inventory", bot.inventory.slots);
        }
        var entities = {
            mobs: [],
            players: [],
        };
        for (var k in bot.entities) {
            var v = bot.entities[k];
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
            var block = bot.blockAt(new vec3(...pos));
            if (heldItem !== void 0 && heldItem !== null) {
                console.log(heldItem);
                bot.placeBlock(block, new vec3(...vec), function (r) {
                    console.log(r);
                });
            }
        });
        handlers.set("invc", function (num) {
            var item = bot.inventory.slots[num + 36];
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
            var block = bot.blockAt(vec3(pos[0], pos[1] - 16, pos[2]));
            if (block !== null) {
                var digTime = bot.digTime(block);
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

        socket.onclose = () => {
            try {
                clearInterval(interval);
                console.log(`[\x1b[31m-\x1b[0m] ${query.nick}`);
                bot.end();
            } catch (error) {}
        };

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
