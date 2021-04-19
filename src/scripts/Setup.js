import Stats from 'three/examples/jsm/libs/stats.module.js'
import * as dat from 'three/examples/jsm/libs/dat.gui.module.js'
import { WebGLRenderer, Scene, PerspectiveCamera, AmbientLight } from 'three'
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
  game.ls.show(`Connecting to ${game.server}...`)
  game.distanceBasedFog.addShaderToMaterials([
    game.world.material,
    game.ent.mobMaterial,
    game.ent.playerMaterial,
    game.ent.objectMaterial
  ])
  const gui = new dat.GUI()
  game.params = {
    chunkdist: 4
  }
  game.distanceBasedFog.updateDistance(game.params.chunkdist)
  gui
    .add(game.world.material, 'wireframe')
    .name('Wireframe')
    .listen()
  gui
    .add(game.params, 'chunkdist', 2, 10, 1)
    .name('Render distance')
    .onChange(function (val) {
      game.distanceBasedFog.updateDistance(val)
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
  game.eh = new EventHandler(game)
}

export { Setup }
