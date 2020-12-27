
import * as THREE from './build/three.module.js'
import {SkeletonUtils} from './jsm/utils/SkeletonUtils.js'
import Stats from './jsm/libs/stats.module.js'
import {World} from './World/World.js'
import {FirstPersonControls} from './FirstPersonControls.js'
import {gpuInfo} from './gpuInfo.js'
import {AssetLoader} from './AssetLoader.js'
import {InventoryBar} from './InventoryBar.js'
import {RandomNick} from './RandomNick.js'
import {GUI} from './jsm/libs/dat.gui.module.js'
import {Chat} from './Chat.js'
import {Entities} from './Entities.js'
import {PlayerInInventory} from './PlayerInInventory.js'
import {BlockBreak} from './BlockBreak.js'

class Game
	constructor:(options)->
		_this=@
		@al=new AssetLoader ()->
			_this.init()
			return
	init:(al)->
		_this=@
		@TWEEN=TWEEN
		@fov=70
		@toxelSize=27
		@cellSize=16
		@canvas=document.querySelector '#c'
		@pcanvas=document.querySelector '#c_player'

		@socket=io.connect "#{document.location.host}"

		@renderer=new THREE.WebGLRenderer
			canvas:@canvas
			PixelRatio:window.devicePixelRatio
		@scene=new THREE.Scene
		@scene.background = new THREE.Color "#adc8ff"
		@camera = new THREE.PerspectiveCamera @fov, 2, 0.1, 1000
		@camera.rotation.order = "YXZ"
		@camera.position.set 26, 26, 26
		@scene.add new THREE.AmbientLight 0xcccccc
		directionalLight = new THREE.DirectionalLight 0x333333, 2
		directionalLight.position.set(1, 1, 0.5).normalize()
		@scene.add directionalLight

		console.warn gpuInfo()

		@nick=document.location.hash.substring 1,document.location.hash.length
		if @nick is ""
			@nick=RandomNick()
			document.location.href="\##{@nick}"

		@stats=new Stats
		@drawcalls=@stats.addPanel new Stats.Panel( 'calls', '#ff8', '#221' )
		@stats.showPanel 3
		document.body.appendChild @stats.dom

		@pii=new PlayerInInventory @
		@ent=new Entities @
		@bb=new BlockBreak @
		@world=new World @
		@chat=new Chat @
		@inv_bar = new InventoryBar @
		@FPC = new FirstPersonControls @

		eventMap={
			"connect":()->
				console.log "Połączono z serverem!"
				$('.loadingText').text "Za chwilę dołączysz do gry..."
				console.log "User nick: #{_this.nick}"
				_this.socket.emit "initClient",
					nick:_this.nick
				return
			"blockUpdate":(block)->
				_this.world.setBlock block[0],block[1]+16,block[2],block[3]
				return
			"spawn":(yaw,pitch)->
				console.log "Gracz dołączył do gry!"
				$(".initLoading").css "display","none"
				_this.camera.rotation.y=yaw
				_this.camera.rotation.x=pitch
				return
			"mapChunk":(sections,x,z,biomes)->
				_this.world._computeSections sections,x,z,biomes
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


		gui = new GUI()
		@params=
			fog:false
			chunkdist:3
		color = new THREE.Color "#adc8ff"
		near = 0.5*16
		far = 2.5*16
		# scene.fog = new THREE.Fog color, near, far
		gui.add( @params, 'fog' ).name( 'Enable fog' ).listen().onChange ()->
			if _this.params.fog
				_this.scene.fog = new THREE.Fog color, near, far
			else
				_this.scene.fog = null
		gui.add( @world.material, 'wireframe' ).name( 'Wireframe' ).listen()
		gui.add( @params, 'chunkdist',0,10,1).name( 'Render distance' ).listen()
		@mouse=false
		$(document).mousedown (e)->
			_this.mouse=true
			if _this.FPC.gameState is "gameLock"
				_this.bb.digRequest()
			return
		$(document).mouseup (e)->
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
		@world.updateCellsAroundPlayer @camera.position,@params.chunkdist
		TWEEN.update()
		@drawcalls.update @renderer.info.render.calls,100
		if @FPC.gameState is "inventory"
			@pii.render()
		@inv_bar.tick()

		@renderer.render @scene, @camera
		return
new Game()
