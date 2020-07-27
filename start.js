const http = require('http');
var opn = require('opn');
const { exec } = require("child_process");
const express = require('express');
const app = express();
const fs = require('fs');

var socketPort=35565;
var serverPort=25565;

//Socketio
  var server1 = http.createServer();
  var io = require("socket.io")(server1);
  var world={};
  function saveWorld(){
    fs.writeFile("savedWorld.json",JSON.stringify(world),function (callback){})
  }
  function restoreWorld(){
    world=JSON.parse(fs.readFileSync('savedWorld.json'))
  }
  restoreWorld()
  var players={};

  io.sockets.on("connection", function(socket) {
    console.log("[\x1b[32m+\x1b[0m] "+socket.id)
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
      console.log("[\x1b[31m-\x1b[0m] " + socket.id);
      delete players[socket.id]
    });
  });
  server1.listen(socketPort);

//Webserver
  app.use(express.static(__dirname + "/client/"));
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
  app.listen(serverPort, () => {
    console.log(`Running: \x1b[35m\x1b[4mhttp://localhost:${serverPort}\x1b[0m`);
    opn(`http://localhost:${serverPort}`)
  });

