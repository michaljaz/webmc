const http = require('http');
var opn = require('opn');
const { exec } = require("child_process");
const express = require('express');
const app = express();

var socketPort=35565;
var serverPort=25565;

//Socketio
  var server1 = http.createServer();
  var io = require("socket.io")(server1);
  var world={};
  startUp();
  function startUp(){
    var vari=10;
    for (let y = 0; y < vari; ++y) {
      for (let z = 0; z < vari; ++z) {
        for (let x = 0; x < vari; ++x) {
          const height = (Math.sin(x / vari * Math.PI * 2) + Math.sin(z / vari * Math.PI * 3)) * (vari / 6) + (vari / 2);
          if (y < height) {
            world[`${x}:${y}:${z}`]=2;
          }
        }
      }
    }
  }

  var players={};

  io.sockets.on("connection", function(socket) {
    console.log("User connected: "+socket.id)
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
        console.log("Block removed",`${block[0]}:${block[1]}:${block[2]}`)
      }else{
        console.log("Block placed",`${block[0]}:${block[1]}:${block[2]}`)
      }
      io.sockets.emit("blockUpdate",block)
    })
    socket.on("disconnect", function() {
      console.log("User disconnected: " + socket.id);
      delete players[socket.id]
    });
  });
  server1.listen(socketPort);

//Webserver
  app.use(express.static(__dirname + "/../client/"));
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
  app.listen(serverPort, () => {
    console.log(`Server started at port ${serverPort}`);
    opn(`http://localhost:${serverPort}`)
  });

