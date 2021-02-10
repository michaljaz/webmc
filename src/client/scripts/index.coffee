
import * as THREE from "three"
import Stats from "stats-js"
import * as dat from "dat.gui"
import io from "socket.io-client"
import TWEEN from "@tweenjs/tween.js"
import {World} from "./World/World.coffee"
import {FirstPersonControls} from "./FirstPersonControls.coffee"
import {gpuInfo} from "./gpuInfo.coffee"
import {AssetLoader} from "./AssetLoader.coffee"
import {InventoryBar} from "./InventoryBar.coffee"
import {RandomNick} from "./RandomNick.coffee"
import {Chat} from "./Chat.coffee"
import {Entities} from "./Entities.coffee"
import {PlayerInInventory} from "./PlayerInInventory.coffee"
import {BlockBreak} from "./BlockBreak.coffee"
import {BlockPlace} from "./BlockPlace.coffee"

class Game
	constructor:(options)->
		_this=@
		@al=new AssetLoader ()->
			_this.init()
			return
		return
	init:(al)->
		_this=@
		@TWEEN=TWEEN
		@fov=70
		@toxelSize=27
		@cellSize=16
		@canvas=document.querySelector "#c"
		@pcanvas=document.querySelector "#c_player"
		@dimension=null
		if PRODUCTION
			console.log "Running in production mode"
		else
			console.log "Running in development mode"
		@renderer=new THREE.WebGLRenderer
			canvas:@canvas
			PixelRatio:window.devicePixelRatio
		@renderer.sortObjects=true
		@scene=new THREE.Scene
		@dimBg=
			"minecraft:overworld":[173/255, 200/255, 255/255]
			"minecraft:the_end":[1/255, 20/255, 51/255]
			"minecraft:the_nether":[133/255, 40/255, 15/255]
		@camera = new THREE.PerspectiveCamera @fov, 2, 0.1, 1000
		@camera.rotation.order = "YXZ"
		@camera.position.set 26, 26, 26
		@scene.add new THREE.AmbientLight 0xffffff
		console.warn gpuInfo()

		@nick=document.location.hash.substring 1,document.location.hash.length
		if @nick is ""
			@nick=RandomNick()
			document.location.href="\##{@nick}"

		@socket=io {
			query:
				nick:@nick
		}

		@stats=new Stats
		@drawcalls=@stats.addPanel new Stats.Panel( "calls", "#ff8", "#221" )
		@stats.showPanel 0
		document.body.appendChild @stats.dom

		@pii=new PlayerInInventory @
		@ent=new Entities @
		@bb=new BlockBreak @
		@bp=new BlockPlace @
		@world=new World @
		@chat=new Chat @
		@inv_bar = new InventoryBar @
		@FPC = new FirstPersonControls @

		eventMap={
			"connect":()->
				console.log "Connected to server!"
				$(".loadingText").text "Joining server..."
				console.log "User nick: #{_this.nick}"
				_this.socket.emit "initClient",
					nick:_this.nick
				return
			"blockUpdate":(block)->
				_this.world.setBlock block[0],block[1]+16,block[2],block[3]
				return
			"spawn":(yaw,pitch)->
				console.log "Player joined the game!"
				$(".initLoading").css "display","none"
				_this.camera.rotation.y=yaw
				_this.camera.rotation.x=pitch
				return
			"dimension":(dim)->
				_this.dimension=dim
				console.log "Player dimension has been changed: #{dim}"
				_this.world.resetWorld()
				bg=_this.dimBg[dim]
				_this.scene.background=new THREE.Color bg...
				_this.world.ATA.uni.color.x=bg[0]
				_this.world.ATA.uni.color.y=bg[1]
				_this.world.ATA.uni.color.z=bg[2]
				_this.world.ATA.uni.color.w=1
				return
			"mapChunk":(sections,x,z,biomes,dim)->
				_this.world._computeSections sections,x,z,biomes,dim
				return
			"hp":(points)->
				_this.inv_bar.setHp(points)
				return
			"inventory":(inv)->
				_this.inv_bar.updateInv inv
				return
			"food":(points)->
				_this.inv_bar.setFood(points)
				return
			"msg":(msg)->
				_this.chat.log(msg)
				return
			"kicked":(reason)->
				_this.chat.log "You have been kicked!"
				return
			"xp":(xp)->
				_this.inv_bar.setXp xp.level,xp.progress
				return
			"move":(pos)->
				to=
					x:pos.x-0.5
					y:pos.y+17
					z:pos.z-0.5
				new TWEEN.Tween _this.camera.position
					.to to, 100
					.easing TWEEN.Easing.Quadratic.Out
					.start()
				return
			"entities":(entities)->
				_this.ent.update entities
				return
			"diggingCompleted":(block)->
				_this.bb.done=true
				console.warn "SERVER-DONE"
				return
			"diggingAborted":(block)->
				console.warn "SERVER-ABORT"
				return
			"digTime":(time,block)->
				console.warn "SERVER-START"
				_this.bb.startDigging time
				return
		}
		for i of eventMap
			@socket.on i,eventMap[i]


		gui = new dat.GUI
		@params=
			chunkdist:3
		@world.ATA.uni.farnear.x=(@params.chunkdist-1.5)*16
		@world.ATA.uni.farnear.y=(@params.chunkdist-0.5)*16
		gui.add( @world.material, "wireframe" ).name( "Wireframe" ).listen()
		chunkDist=gui.add( @params, "chunkdist",0,10,1).name( "Render distance" ).listen()
		chunkDist.onChange (val)->
			_this.world.ATA.uni.farnear.x=(val-1.5)*16
			_this.world.ATA.uni.farnear.y=(val-0.5)*16
			console.log val
			return
		@mouse=false
		$(document).mousedown (e)->
			if e.which is 1
				_this.mouse=true
				if _this.FPC.gameState is "gameLock"
					_this.bb.digRequest()
			else if e.which is 3
				_this.bp.placeBlock()
			return
		$(document).mouseup (e)->
			if e.which is 1
				_this.mouse=false
				_this.bb.stopDigging()
		@animate()
	animate:()->
		_this=@
		if @stats isnt null
			@stats.begin()
			@render()
			@stats.end()
		requestAnimationFrame ()->
			_this.animate()
		return
	render:()->
		_this=@
		width=window.innerWidth
		height=window.innerHeight
		if @canvas.width isnt width or @canvas.height isnt height
			@canvas.width=width
			@canvas.height=height
			@renderer.setSize width,height,false
			@camera.aspect = width / height
			@camera.updateProjectionMatrix()

		@bb.updatePos ()->
			if _this.bb.isDigging
				_this.bb.stopDigging()
			if _this.mouse and _this.bb.done
				_this.bb.digRequest()
		@world._updateCellsAroundPlayer @params.chunkdist
		TWEEN.update()
		@drawcalls.update @renderer.info.render.calls,100
		if @FPC.gameState is "inventory"
			@pii.render()
		@inv_bar.tick()
		@world.ATA.uni.view.copy(@camera.position).applyMatrix4(@camera.matrixWorldInverse)
		@renderer.render @scene, @camera
		return
new Game()
