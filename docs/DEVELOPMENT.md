# Developer's guide to webmc

## Installation

```bash

npm install
```
Install required depencies.

## Development

```bash

npm start
```
This will start express and webpack in development mode: whenever you save a file, the build will be redone (it takes 3s), and you can refresh the page to get the new result. It also starts local websocket proxy server.

Connect to http://localhost:8080 in your browser. Also specify correct server ip in url param.


## Production

```bash

npm run build
```

After calling this, it will build app bundle with minified code (in ```/src/dist/``` directory). It may take longer than development setup.

Then you have to host built files on some simple http server like [http-server](https://www.npmjs.com/package/http-server).

## How works webmc url params?

### ?nick=

Minecraft user nickname

### ?server=

It is just server ip like "serverip.eu" or "serverip.eu:25565"

### ?proxy=

Here are webmc proxy options in ?proxy=[string] url param:

- ```production``` default production option, server: https://webmcproxy.glitch.me
- ```local``` default local-dev option, server: localhost
- ```[server_hostname]:[port]``` custom proxy server (sometimes ssl certs might not work)

## Own proxy server

You can also setup your own proxy server. It is just translates Websocket connection to TCP connection. All you have to do is to run  ```npm run proxy``` on server and change some configs in ```/src/assets/config.json```. Sometimes it is also useful to swap the "proxy" script with "start" in package.json (your app will run proxy by default).

## Download production files

If you want to just download webmc production files [click here](https://github.com/michaljaz/webmc/tree/gh-pages).

## If you can't build project with default configuration

Here are the instructions on how to do it correctly [click here](https://github.com/michaljaz/webmc/blob/master/.github/workflows/github-pages.yaml).

## Creating a Docker container

First install Docker.  I won't get into this here, there are millions of resources online to assist you with that.  First thing you have to build the image.  The docker file is included with the project.

```bash
 git clone https://github.com/michaljaz/webmc.git && cd webmc
```
Next build the Docker image

```bash
 docker build . -t michaljaz/webmc
```
After the docker image has been built, you can then run the docker image with the following

```bash
 docker run -p 8080:8080 -d michaljaz/webmc
 ```
Now open your browser to http://localhost:8080
