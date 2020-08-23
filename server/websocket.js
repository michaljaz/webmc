module.exports = function(config) {
  var port=config["websocket-port"]
  const http = require('http');
  const fs = require('fs');

  var server1 = http.createServer();
  var io = require("socket.io")(server1);
  var world={};
  function saveWorld(){
    fs.writeFile(__dirname+"/savedWorld.json",JSON.stringify(world),function (callback){})
  }
  function restoreWorld(){
    world=JSON.parse(fs.readFileSync(__dirname+'/savedWorld.json'))
  }
  restoreWorld()
  var players={};

  io.sockets.on("connection", function(socket) {
    // console.log("[\x1b[32m+\x1b[0m] "+socket.id)
    socket.emit("firstLoad",world)
    socket.on("playerUpdate",function (data){
      players[socket.id]=data
      io.sockets.emit("playerUpdate",players)
    })
    socket.on("blockUpdate",function (block){
      block[0]=Math.floor(block[0])
      block[1]=Math.floor(block[1])
      block[2]=Math.floor(block[2])
      world[`${block[0]}:${block[1]}:${block[2]}`]=block[3];
      if(block[3]==0){
        delete world[`${block[0]}:${block[1]}:${block[2]}`]
        // console.log("Block removed",`${block[0]}:${block[1]}:${block[2]}`)
      }else{
        // console.log("Block placed",`${block[0]}:${block[1]}:${block[2]}`)
      }
      io.sockets.emit("blockUpdate",block)
      saveWorld()
    })
    socket.on("disconnect", function() {
      // console.log("[\x1b[31m-\x1b[0m] " + socket.id);
      delete players[socket.id]
    });
  });
  server1.listen(port);
}


