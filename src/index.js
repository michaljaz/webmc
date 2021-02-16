var Chunk,
    Convert,
    app,
    compiler,
    config,
    convert,
    devconfig,
    express,
    fs,
    helmet,
    io,
    middleware,
    mineflayer,
    opn,
    port,
    server,
    vec3,
    webpack;
opn = require("opn");
fs = require("fs");
config = JSON.parse(fs.readFileSync(`${__dirname}/server.json`));
express = require("express");
app = express();
server = require("http").createServer(app);
io = require("socket.io")(server);
mineflayer = require("mineflayer");
Chunk = require("prismarine-chunk")(config.version);
vec3 = require("vec3");
Convert = require("ansi-to-html");
convert = new Convert();
helmet = require("helmet");
port = process.env.PORT || 8080;
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);
var mode = process.argv[2];
if (mode === "production") {
    app.use(express.static(`${__dirname}/client/dist`));
} else if (mode === "development") {
    webpack = require("webpack");
    middleware = require("webpack-dev-middleware");
    devconfig = require(`${__dirname}/client/webpack.dev.js`);
    compiler = webpack(devconfig);
    app.use(middleware(compiler));
} else {
    console.log("Incorrect mode!");
}
server.listen(port, function () {
    opn(`http://localhost:${port}`);
    return console.log(`Server is running on \x1b[34m*:${port}\x1b[0m`);
});
io.sockets.on("connection", function (socket) {
    var bot,
        botEventMap,
        emit,
        heldItem,
        i,
        interval,
        inv,
        query,
        socketEventMap;
    query = socket.handshake.query;
    console.log(`[\x1b[32m+\x1b[0m] ${query.nick}`);
    heldItem = null;
    bot = mineflayer.createBot({
        host: config.ip,
        port: config.port,
        username: query.nick,
        version: config.version,
    });
    emit = function (array) {
        return io.to(socket.id).emit(...array);
    };
    bot._client.on("map_chunk", function (packet) {
        var cell;
        cell = new Chunk();
        cell.load(packet.chunkData, packet.bitMap, true, true);
        emit(["mapChunk", cell.sections, packet.x, packet.z, packet.biomes]);
    });
    bot._client.on("respawn", function (packet) {
        emit(["dimension", packet.dimension.value.effects.value]);
    });
    botEventMap = {
        heldItemChanged: function (item) {
            heldItem = item;
        },
        login: function () {
            emit(["dimension", bot.game.dimension]);
        },
        move: function () {
            emit(["move", bot.entity.position]);
        },
        health: function () {
            emit(["hp", bot.health]);
            emit(["food", bot.food]);
        },
        spawn: function () {
            emit(["spawn", bot.entity.yaw, bot.entity.pitch]);
        },
        kicked: function (reason) {
            emit(["kicked", reason]);
        },
        message: function (msg) {
            emit(["msg", convert.toHtml(msg.toAnsi())]);
        },
        experience: function () {
            emit(["xp", bot.experience]);
        },
        blockUpdate: function (oldb, newb) {
            emit([
                "blockUpdate",
                [
                    newb.position.x,
                    newb.position.y,
                    newb.position.z,
                    newb.stateId,
                ],
            ]);
        },
        diggingCompleted: function (block) {
            emit(["diggingCompleted", block]);
        },
        diggingAborted: function (block) {
            emit(["diggingAborted", block]);
        },
    };
    for (i in botEventMap) {
        (function (i) {
            return bot.on(i, function () {
                if (bot !== null) {
                    botEventMap[i](...arguments);
                }
            });
        })(i);
    }
    inv = "";
    interval = setInterval(function () {
        var entities, inv_new, k, ref, v;
        inv_new = JSON.stringify(bot.inventory.slots);
        if (inv !== inv_new) {
            inv = inv_new;
            emit(["inventory", bot.inventory.slots]);
        }
        entities = {
            mobs: [],
            players: [],
        };
        ref = bot.entities;
        for (k in ref) {
            v = ref[k];
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
        emit(["entities", entities]);
    }, 10);
    socketEventMap = {
        fly: function (toggle) {
            if (toggle) {
                bot.creative.startFlying();
            } else {
                bot.creative.stopFlying();
            }
        },
        blockPlace: function (pos, vec) {
            var block;
            block = bot.blockAt(new vec3(...pos));
            if (heldItem !== void 0 && heldItem !== null) {
                console.log(heldItem);
                bot.placeBlock(block, new vec3(...vec), function (r) {
                    console.log(r);
                });
            }
        },
        invc: function (num) {
            var item;
            item = bot.inventory.slots[num + 36];
            if (item !== null && item !== void 0) {
                bot.equip(item, "hand");
            } else if (heldItem !== void 0) {
                bot.unequip("hand");
            }
        },
        move: function (state, toggle) {
            if (state === "right") {
                state = "left";
            } else if (state === "left") {
                state = "right";
            }
            bot.setControlState(state, toggle);
        },
        command: function (com) {
            bot.chat(com);
        },
        rotate: function (data) {
            bot.look(...data);
        },
        disconnect: function () {
            try {
                clearInterval(interval);
                console.log(`[\x1b[31m-\x1b[0m] ${query.nick}`);
                bot.end();
            } catch (error) {}
        },
        dig: function (pos) {
            var block, digTime;
            block = bot.blockAt(vec3(pos[0], pos[1] - 16, pos[2]));
            if (block !== null) {
                digTime = bot.digTime(block);
                if (bot.targetDigBlock !== null) {
                    console.log("Already digging...");
                    bot.stopDigging();
                }
                emit(["digTime", digTime, block]);
                console.log("Start");
                bot.dig(block, false, function (xd) {
                    if (xd === void 0) {
                        return console.log("SUCCESS");
                    } else {
                        return console.log("FAIL");
                    }
                });
            }
        },
        stopDigging: function () {
            bot.stopDigging();
        },
    };
    for (i in socketEventMap) {
        socket.on(i, socketEventMap[i]);
    }
});
