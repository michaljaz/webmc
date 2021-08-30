# Developer's guide to webmc

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

After calling this, it will build app bundle with minified code (in ```/src/dist/``` directory). It may take longer than development setup. By default webmc connects to https://webmcproxy.glitch.me.

Then you have to host built files on some simple http server like [http-server](https://www.npmjs.com/package/http-server).

You can also setup your own proxy server. All you have to do is to run  ```npm run proxy``` on server and change some configs in ```/src/assets/config.json```.

## Download production files

If you want to just download webmc production files [click here](https://github.com/michaljaz/webmc/tree/gh-pages).

## If you can't build project with default configuration

Here are the instructions on how to do it correctly [click here](https://github.com/michaljaz/webmc/blob/master/.github/workflows/github-pages.yaml).
