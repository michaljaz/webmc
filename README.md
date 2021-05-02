# WebMc

[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/h6DQzDx2G7)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/michaljaz/web-minecraft)
[![Build and Deploy](https://github.com/michaljaz/web-minecraft/actions/workflows/github-pages.yaml/badge.svg)](https://github.com/michaljaz/web-minecraft/actions/workflows/github-pages.yaml)
## About

**WebMc is minecraft client written in Javascript.** From web browser this client connects to websocket proxy and then to real minecraft server, so you can play minecraft in the browser.

## Demo
Live demo with no installation: https://minecraft.js.org.

## Development setup

```bash

npm install
npm start
```
This will start express and webpack in development mode: whenever you save a file, the build will be redone (it takes 2s), and you can refresh the page to get the new result.

Connect to http://localhost:8080 in your browser. Also specify correct server ip in url param.


## Screenshots
![hypixel](https://i.ibb.co/bPh99MV/hypixel.png "hypixel")
![nether](https://i.ibb.co/jzZVrT2/Screenshot-from-2021-01-27-21-13-37.png "nether")
![end](https://i.ibb.co/tKmnJ8D/Screenshot-from-2021-01-27-21-16-12.png "end")
