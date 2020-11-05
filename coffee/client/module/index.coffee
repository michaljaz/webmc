
scene=null;materials=null;parameters=null;canvas=null;renderer=null;camera=null;terrain=null;cursor=null;FPC=null;socket=null;stats=null;worker=null;playerObject=null;inv_bar=null
import * as THREE from './build/three.module.js'
import {SkeletonUtils} from './jsm/utils/SkeletonUtils.js'
import Stats from './jsm/libs/stats.module.js'
import {Terrain} from './Terrain.js'
import {FirstPersonControls} from './FirstPersonControls.js'
import {gpuInfo} from './gpuInfo.js'
import {AssetLoader} from './AssetLoader.js'
import {InventoryBar} from './InventoryBar.js'
import {AnimatedTextureAtlas} from './AnimatedTextureAtlas.js'
import {Players} from './Players.js'
import {RandomNick} from './RandomNick.js'

init = ()->

	chunkWorker=new Worker "/module/ChunkWorker.js", {type:'module'}
	chunkWorker.onmessage=(data)->

		result=data.data.result
		for i in result
			if i isnt null
				terrain.setCell(i.x,i.y,i.z,i.data)

	#canvas,renderer,camera,lights
	canvas=document.querySelector '#c'
	renderer=new THREE.WebGLRenderer {
		canvas
		PixelRatio:window.devicePixelRatio
	}
	scene=new THREE.Scene
	camera = new THREE.PerspectiveCamera 90, 2, 0.1, 1000
	camera.rotation.order = "YXZ"
	camera.position.set 26, 26, 26
	#skybox
	loader = new THREE.TextureLoader();
	skybox = loader.load "assets/images/skybox.jpg", () ->
		rt = new THREE.WebGLCubeRenderTarget skybox.image.height
		rt.fromEquirectangularTexture renderer, skybox
		scene.background = rt
		return
	#Lights
	ambientLight=new THREE.AmbientLight 0xcccccc
	scene.add ambientLight
	directionalLight = new THREE.DirectionalLight 0x333333, 2
	directionalLight.position.set(1, 1, 0.5).normalize()
	scene.add directionalLight
	console.warn gpuInfo()

	#Clouds
	clouds=al.get "clouds"
	clouds.scale.x=0.1
	clouds.scale.y=0.1
	clouds.scale.z=0.1
	clouds.position.y=170
	scene.add clouds

	#Animated Material
	ATA=new AnimatedTextureAtlas {
		al
	}

	#setup terrain
	terrain=new Terrain({
		toxelSize:27
		cellSize:16
		material:ATA.material
		scene
		camera
		al
	})

	#Socket.io setup
	socket=io.connect "#{al.get("host")}:#{al.get("websocket-port")}"
	socket.on "connect",()->
		console.log "Połączono z serverem!"
		$('.loadingText').text "Wczytywanie terenu..."
		nick=document.location.hash.substring(1,document.location.hash.length)
		if nick is ""
			nick=RandomNick()
			document.location.href="\##{nick}"
		console.log "User nick: 	#{nick}"
		socket.emit "initClient", {
			nick:nick
		}
		return
	socket.on "blockUpdate",(block)->
		terrain.setBlock block...
		return
	socket.on "mapChunk", (sections,x,z)->
		chunkWorker.postMessage {
			type:"computeSections"
			data:{
				sections,x,z
			}
		}
	players=new Players {socket,scene,al}
	socket.on "playerUpdate",(data)->
		players.update data
		return
	socket.on "firstLoad",(v)->
		console.log "First Load packet recieved!"
		terrain.replaceWorld v
		$(".initLoading").css "display","none"
		stats = new Stats();
		stats.showPanel(0);
		document.body.appendChild stats.dom
		return

	#Inventory Bar
	inv_bar = new InventoryBar({
		boxSize: 60
		padding: 4
		div: ".inventoryBar"
	}).setBoxes([
		"assets/images/grass_block.png",
		"assets/images/stone.png",
		"assets/images/oak_planks.png",
		"assets/images/smoker.gif",
		"assets/images/anvil.png",
		"assets/images/brick.png",
		"assets/images/furnace.png",
		"assets/images/bookshelf.png",
		"assets/images/tnt.png"
	]).setFocusOnly(1).listen()

	#First Person Controls
	FPC = new FirstPersonControls({
		canvas
		camera
		micromove: 0.3
	}).listen()

	#Raycast cursor
	cursor=new THREE.LineSegments(
		new THREE.EdgesGeometry(
			new THREE.BoxGeometry 1, 1, 1
		),
		new THREE.LineBasicMaterial {
			color: 0x000000,
			linewidth: 0.5
		}
	)
	scene.add cursor

	#jquery events
	$(document).mousedown (e)->
		if FPC.gameState is "game"
			rayBlock=terrain.getRayBlock()
			if rayBlock
				if e.which is 1
					voxelId=0
					pos=rayBlock.posBreak
				else
					voxelId=inv_bar.activeBox
					pos=rayBlock.posPlace
				pos[0]=Math.floor pos[0]
				pos[1]=Math.floor pos[1]
				pos[2]=Math.floor pos[2]
				socket.emit "blockUpdate",[pos...,voxelId]
		return

	animate()
	return
render = ->
	#Autoresize canvas
	width=window.innerWidth
	height=window.innerHeight
	if canvas.width isnt width or canvas.height isnt height
		canvas.width=width
		canvas.height=height
		renderer.setSize width,height,false
		camera.aspect = width / height
		camera.updateProjectionMatrix()

	#Player movement
	if FPC.gameState is "game"
		socket.emit "playerUpdate", {
			x:camera.position.x
			y:camera.position.y
			z:camera.position.z
			xyaw:-camera.rotation.x
			zyaw:camera.rotation.y+Math.PI
		}
		FPC.camMicroMove()

	#Update cursor
	rayBlock=terrain.getRayBlock()
	if rayBlock
		pos=rayBlock.posBreak
		pos[0]=Math.floor pos[0]
		pos[1]=Math.floor pos[1]
		pos[2]=Math.floor pos[2]
		cursor.position.set pos...
		cursor.visible=true
	else
		cursor.visible=false

	#Rendering
	terrain.updateCells()
	renderer.render scene, camera
	return
animate = ->
	try
		stats.begin()
		render()
		stats.end()
	requestAnimationFrame animate
	return

al=new AssetLoader
$.get "assets/assetLoader.json", (assets)->
	al.load assets,()->
		console.log "AssetLoader: done loading!"
		al.get("anvil").children[0].geometry.rotateX -Math.PI/2
		al.get("anvil").children[0].geometry.translate 0,0.17,0
		al.get("anvil").children[0].geometry.translate 0,-0.25,0
		init()
		return
	,al
	return
