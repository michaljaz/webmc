var atlasCreator,
  block,
  buildPath,
  config,
  fs,
  i,
  j,
  k,
  maxStateId,
  pBlock,
  ref,
  result;

fs = require("fs");

config = require("./server.json");

pBlock = require("prismarine-block")(config.version);

atlasCreator = require("./atlasCreator");

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
  loadPath: `${__dirname}/assets/blocks`,
  buildPath: `${__dirname}/client/assets/blocks`,
  atlasSize: 36,
  oneFrame: false,
});

new atlasCreator({
  pref: "blocksSnap",
  toxelSize: 16,
  loadPath: `${__dirname}/assets/blocks`,
  buildPath: `${__dirname}/client/assets/blocks`,
  atlasSize: 27,
  oneFrame: true,
});

maxStateId = 0;

for (i = j = 0; j <= 100000; i = ++j) {
  block = pBlock.fromStateId(i);
  if (block.type === void 0) {
    maxStateId = i - 1;
    break;
  }
}

console.log(`\x1b[33mBlock max stateId: ${maxStateId}\x1b[0m`);

result = [];

for (
  i = k = 0, ref = maxStateId;
  0 <= ref ? k <= ref : k >= ref;
  i = 0 <= ref ? ++k : --k
) {
  block = pBlock.fromStateId(i);
  result.push([
    block.name,
    block.boundingBox === "block" ? 1 : 0,
    block.transparent ? 1 : 0,
  ]);
}

buildPath = `${__dirname}/client/assets/blocks/blocksDef.json`;

fs.writeFileSync(buildPath, JSON.stringify(result));

console.log(`\x1b[32mGenerated blocksDefinitions: ${buildPath}\x1b[0m\n`);
