var opn = require('opn');

require("./server/websocket.js")(35565)
require("./server/express.js")(25565)

opn(`http://localhost:25565`)