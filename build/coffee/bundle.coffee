#Bundle.js
import * as THREE from './../module/build/three.module.js'
import {SkeletonUtils} from './../module/jsm/utils/SkeletonUtils.js'
import Stats from './../module/jsm/libs/stats.module.js'
import {Terrain} from './mod/Terrain.js'
import {FirstPersonControls} from './mod/FirstPersonControls.js'
import {gpuInfo} from './mod/gpuInfo.js'
import {AssetLoader} from './mod/AssetLoader.js'
import {InventoryBar} from './mod/InventoryBar.js'
import {AnimatedTextureAtlas} from './mod/AnimatedTextureAtlas.js'
import {Players} from './mod/Players.js'

scene=null;materials=null;parameters=null;canvas=null;renderer=null;camera=null;terrain=null;cursor=null;FPC=null;socket=null;stats=null;worker=null;playerObject=null;inv_bar=null

getNick=->
	return document.location.search.substring(1,document.location.search.length)
class TerrainWorker
	constructor: (options)->
		@worker=new Worker "workers/terrain.js", {type:'module'}
		@worker.onmessage=(message)->
			terrain.updateCell message.data
			# console.warn "RECIEVED CELL:",message.data.info
		@worker.postMessage {
			type:'init'
			data:{
				models:{
					anvil:{
						al.get("anvil").children[0].geometry.attributes...
					}
				}
				blocks: al.get "blocks"
				blocksMapping: al.get "blocksMapping"
				toxelSize: 27
				cellSize: 16
			}
		}
	setVoxel: (voxelX,voxelY,voxelZ,value)->
		@worker.postMessage {
			type:"setVoxel"
			data:[voxelX,voxelY,voxelZ,value]
		}
	genCellGeo: (cellX,cellY,cellZ)->
		cellX=parseInt cellX
		cellY=parseInt cellY
		cellZ=parseInt cellZ
		@worker.postMessage {
			type:"genCellGeo"
			data:[cellX,cellY,cellZ]
		}

init = ()->
	if getNick() is "" or getNick() is "?"
		document.location.href="/lobby/"
	#Terrain worker
	worker=new TerrainWorker
	
	#canvas,renderer,camera,lights
	canvas=document.querySelector '#c'
	renderer=new THREE.WebGLRenderer {
		canvas
		PixelRatio:window.devicePixelRatio
	}
	scene=new THREE.Scene
	scene.background=new THREE.Color "lightblue"
	camera = new THREE.PerspectiveCamera 75, 2, 0.1, 64*5
	camera.rotation.order = "YXZ"
	camera.position.set 26, 26, 26

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
	clouds.position.y=100
	scene.add clouds

	#Animated Material
	ATA=new AnimatedTextureAtlas {
		al
	}

	#setup terrain
	terrain=new Terrain({
		toxelSize:27
		cellSize:16
		blocks:al.get "blocks"
		blocksMapping:al.get "blocksMapping"
		material:ATA.material
		scene
		camera
		worker
	})
	
	#Socket.io setup
	socket=io.connect "#{al.get("host")}:#{al.get("websocket-port")}"

	socket.on "connect",()->
		console.log "Połączono z serverem!"
		socket.emit "initClient", {
			nick:getNick()
		}
		return
	socket.on "blockUpdate",(block)->
		terrain.setVoxel block...
		return
	players=new Players {socket,scene,al}
	socket.on "playerUpdate",(data)->
		players.update data
		return
	socket.on "firstLoad",(v)->
		console.log "Otrzymano pakiet świata!"
		terrain.replaceWorld v
		worker.genCellGeo(0,0,0)
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
	
	renderer.render scene, camera
	terrain.updateCells()

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