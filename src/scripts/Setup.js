import Stats from 'three/examples/jsm/libs/stats.module.js'
import * as dat from 'three/examples/jsm/libs/dat.gui.module.js'
import { WebGLRenderer, Scene, PerspectiveCamera, AmbientLight, TextureLoader } from 'three'
import { DistanceBasedFog } from './rendering/DistanceBasedFog.js'
import { UrlParams } from './UrlParams.js'
import { gpuInfo } from './additional/gpuInfo.js'
import { World } from './world/'
import { InventoryBar } from './gui/InventoryBar.js'
import { Chat } from './gui/Chat.js'
import { Entities } from './rendering/Entities.js'
import { PlayerInInventory } from './gui/PlayerInInventory.js'
import { BlockBreak } from './rendering/BlockBreak.js'
import { BlockPlace } from './rendering/BlockPlace.js'
import { EventHandler } from './EventHandler.js'
import { Socket } from './proxy/Socket.js'
import { TabList } from './gui/TabList.js'
import { LoadingScreen } from './gui/LoadingScreen.js'

function Setup (game) {
  game.canvas = document.querySelector('#c')
  game.pcanvas = document.querySelector('#c_player')
  game.renderer = new WebGLRenderer({
    canvas: game.canvas,
    PixelRatio: window.devicePixelRatio
  })
  game.renderer.sortObjects = true
  game.scene = new Scene()
  game.camera = new PerspectiveCamera(game.fov.normal, 2, 0.1, 1000)
  game.camera.rotation.order = 'YXZ'
  game.camera.position.set(26, 26, 26)
  game.scene.add(new AmbientLight(0xdddddd))
  if (!game.production) {
    game.stats = new Stats()
    game.drawcalls = game.stats.addPanel(
      new Stats.Panel('calls', '#ff8', '#221')
    )
    game.stats.showPanel(0)
    document.body.appendChild(game.stats.dom)
  }
  game.distanceBasedFog = new DistanceBasedFog(game)
  game.servers = {
    production: game.al.get('config').minecraftProduction,
    development: game.al.get('config').minecraftDevelopment
  }
  UrlParams(game)
  console.warn(gpuInfo())
  game.socket = new Socket(game)
  game.pii = new PlayerInInventory(game)
  game.bb = new BlockBreak(game)
  game.bp = new BlockPlace(game)
  game.world = new World(game)
  game.ent = new Entities(game)
  game.chat = new Chat(game)
  game.inv_bar = new InventoryBar(game)
  game.tl = new TabList(game)
  game.ls = new LoadingScreen(game)
  game.ls.show('Waiting for proxy...')
  let hostname, port, pars
  if (game.proxy === 'local') {
    hostname = document.location.hostname
    port = document.location.port
  } else if (game.proxy === 'production') {
    pars = game.al.get('config').proxy.split(':')
    hostname = pars[0]
    port = pars[1]
  } else {
    pars = game.proxy.split(':')
    hostname = pars[0]
    port = pars[1]
  }
  window.fetch(`${document.location.protocol}//${hostname}:${port}/proxyCheck`)
    .then(response => response.text())
    .then(data => {
      if (data === 'OK') {
        game.ls.show(`Connecting to ${game.server}...`)

        // PLAYER UUID
        window.fetch(`${document.location.protocol}//${hostname}:${port}/getId?nick=${game.nick}`)
          .then(response => response.text())
          .then(id => {
            if (id !== 'ERR') {
              console.log(`UUID: ${id}`)
              // SKIN
              game.skinUrl = `${document.location.protocol}//${hostname}:${port}/getSkin?id=${id}`
              console.log(game.skinUrl)
              new TextureLoader().load(game.skinUrl, (texture) => {
                game.pii.setup(texture)
              })
            } else {
              console.log('UUID not found!')
              game.pii.setup(game.al.get('playerTex'))
            }
          })
      }
    })

  game.distanceBasedFog.addShaderToMaterials([
    game.world.material,
    game.ent.mobMaterial,
    game.ent.playerMaterial,
    game.ent.objectMaterial
  ])
  const gui = new dat.GUI()
  game.params = {
    chunkdist: 4,
    frustumtest: false
  }
  game.distanceBasedFog.updateDistance(game.params.chunkdist)
  gui
    .add(game.params, 'chunkdist', 2, 10, 1)
    .name('Render distance')
    .onChange(function (val) {
      if (game.distanceBasedFog.visible) {
        game.distanceBasedFog.updateDistance(val)
      }
    })
    .listen()
  gui
    .add(game.fov, 'normal', 30, 110, 1)
    .name('FOV')
    .onChange(function (val) {
      game.fov.sprint = game.fov.normal + 10
      game.camera.fov = game.fov.normal
      game.camera.updateProjectionMatrix()
    })
    .listen()
  gui
    .add(game.distanceBasedFog, 'visible')
    .name('Enable fog')
    .onChange(function (val) {
      if (val) {
        game.distanceBasedFog.updateDistance(game.params.chunkdist)
      } else {
        game.distanceBasedFog.updateDistance(1000)
      }
    })
    .listen()
  gui
    .add(game.world.chunkManager, 'smooth')
    .name('Smooth chunks')
    .listen()
  gui
    .add(game.world.material, 'wireframe')
    .name('Wireframe')
    .listen()
  gui
    .add(game.params, 'frustumtest')
    .name('Frustum test')
    .listen()
  game.eh = new EventHandler(game)
}

export { Setup }
