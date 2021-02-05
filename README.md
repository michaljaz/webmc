# web-minecraft

[![Join the chat at https://gitter.im/web-minecraft/community](https://badges.gitter.im/web-minecraft/community.svg)](https://gitter.im/web-minecraft/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/h6DQzDx2G7)

<img src="src/client/assets/images/logo.png" alt="screen6" width="100%">

## About

**Web-minecraft is minecraft client written in CoffeeScript.** From web browser this client connects to node.js server and then to real minecraft server, so you can play minecraft in the browser. By default node.js server is served at http://localhost:8080.


### Installation
```bash
#Clone repo
git clone https://github.com/michaljaz/web-minecraft
cd web-minecraft

#Install node.js libraries
npm install

```

### Minecraft server setup

To run this game you need to start real minecraft server (by default it is 1.16.1 offline mode java edition on ip localhost:25565) you can also define it in */src/server.json* file. 

```bash
#Optionally you can run lite minecraft server (flying-squid)
npm run server

```

### OPTION 1: Development setup 
```bash
#Start node server with webpack middleware (That will start webserver at http://localhost:8080)
npm run dev

```

### OPTION 2: Production setup
```bash
#Cleaning dist folder (old game bundles)
npm run clean

#Building app bundle
npm run build

#Start node server and serve bundle files (That will start webserver ad http://localhost:8080)
npm start

```

### Screenshots
[<img src="https://i.ibb.co/BLyct2H/Screenshot-from-2021-01-27-21-20-23.png" alt="screen6" width="100%">](https://i.ibb.co/BLyct2H/Screenshot-from-2021-01-27-21-20-23.png)
[<img src="https://i.ibb.co/jzZVrT2/Screenshot-from-2021-01-27-21-13-37.png" alt="screen6" width="100%">](https://i.ibb.co/jzZVrT2/Screenshot-from-2021-01-27-21-13-37.png)
[<img src="https://i.ibb.co/tKmnJ8D/Screenshot-from-2021-01-27-21-16-12.png" alt="screen6" width="100%">](https://i.ibb.co/tKmnJ8D/Screenshot-from-2021-01-27-21-16-12.png)
