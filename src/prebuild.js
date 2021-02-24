var fs = require("fs");
var config = require("./properties.json");
var pBlock = require("prismarine-block")(config.version);
var atlasCreator = require("./atlasCreator");

new atlasCreator({
    pref: "items",
    toxelSize: 50,
    loadPath: `${__dirname}/assets/items`,
    buildPath: `${__dirname}/client/assets/items`,
    atlasSize: 32,
    oneFrame: false,
});

new atlasCreator({
    pref: "blocks",
    toxelSize: 16,
    loadPath: `${__dirname}/assets/pack/assets/minecraft/textures/block`,
    buildPath: `${__dirname}/client/assets/blocks`,
    atlasSize: 36,
    oneFrame: false,
});

new atlasCreator({
    pref: "blocksSnap",
    toxelSize: 16,
    loadPath: `${__dirname}/assets/pack/assets/minecraft/textures/block`,
    buildPath: `${__dirname}/client/assets/blocks`,
    atlasSize: 27,
    oneFrame: true,
});

var maxStateId = 0;

for (var i = 0; i < 100000; i++) {
    var block = pBlock.fromStateId(i);
    if (block.type === void 0) {
        maxStateId = i - 1;
        break;
    }
}

console.log(`\x1b[33mBlock max stateId: ${maxStateId}\x1b[0m`);

var result = [];

for (let i = 0; i <= maxStateId; i++) {
    block = pBlock.fromStateId(i);
    result.push([
        block.name,
        block.boundingBox === "block" ? 1 : 0,
        block.transparent ? 1 : 0,
    ]);
}

var buildPath = `${__dirname}/client/assets/blocks/blocksDef.json`;

fs.writeFileSync(buildPath, JSON.stringify(result));

console.log(`\x1b[32mGenerated blocksDefinitions: ${buildPath}\x1b[0m\n`);
