const fs = require('fs');

var rawdata = fs.readFileSync(__dirname+'/config.json');
var config = JSON.parse(rawdata);

require("./server/websocket.js")(config)
require("./server/express.js")(config)