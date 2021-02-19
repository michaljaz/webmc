# web-minecraft

[![Join the chat at https://gitter.im/web-minecraft/community](https://badges.gitter.im/web-minecraft/community.svg)](https://gitter.im/web-minecraft/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/h6DQzDx2G7)


## About

**Web-minecraft is minecraft client written in Javascript.** From web browser this client connects to node.js server and then to real minecraft server, so you can play minecraft in the browser.

## Instructions

<details>
<summary>Install locally</summary>

```bash
git clone https://github.com/michaljaz/web-minecraft
cd web-minecraft
npm i

``` 
</details>




<details>
<summary>Minecraft server setup</summary>
To run this game you need to start real minecraft server (by default it is 1.16.5 offline mode java edition on ip localhost:25565) you can also define it in */src/server.json* file.

</details>


<details>
<summary>Linting</summary>

```bash
#Only show whats wrong
npm run lint

#Fix what is wrong
npm run lint:fix

```

</details>

<details>
<summary>Development setup </summary>

```bash
#Start node server with webpack middleware
npm run dev

```
</details>
<details>
<summary>Production setup</summary>

```bash
#Cleaning dist folder (old game bundles)
npm run clean

#Building app bundle
npm run build

#Start node server and serve bundle files
npm start

```

</details>




## Screenshots
[<img src="https://i.ibb.co/bPh99MV/hypixel.png" alt="screen6" width="100%">](https://i.ibb.co/bPh99MV/hypixel.png)
[<img src="https://i.ibb.co/jzZVrT2/Screenshot-from-2021-01-27-21-13-37.png" alt="screen6" width="100%">](https://i.ibb.co/jzZVrT2/Screenshot-from-2021-01-27-21-13-37.png)
[<img src="https://i.ibb.co/tKmnJ8D/Screenshot-from-2021-01-27-21-16-12.png" alt="screen6" width="100%">](https://i.ibb.co/tKmnJ8D/Screenshot-from-2021-01-27-21-16-12.png)
