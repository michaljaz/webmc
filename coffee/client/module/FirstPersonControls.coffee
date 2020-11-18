import * as THREE from './build/three.module.js'

class FirstPersonControls
	constructor: (options)->
		@kc={
			87:"forward"
			65:"right"
			83:"back"
			68:"left"
			32:"jump"
			16:"sneak"
			82:"sprint"
		}
		@keys={}
		@canvas=options.canvas
		@camera=options.camera
		@socket=options.socket
		@gameState="menu"
		@listen()
		$(".com_i").blur()
		$(".com").hide()
	updatePosition: (e)->
		#Updatowanie kursora
		if @gameState is "gameLock"
			@camera.rotation.x -= THREE.MathUtils.degToRad e.movementY / 10
			@camera.rotation.y -= THREE.MathUtils.degToRad e.movementX / 10
			if THREE.MathUtils.radToDeg( @camera.rotation.x ) < -90
				@camera.rotation.x = THREE.MathUtils.degToRad -90
			if THREE.MathUtils.radToDeg( @camera.rotation.x ) > 90
				@camera.rotation.x = THREE.MathUtils.degToRad 90
			@socket.emit "rotate", [@camera.rotation.y,@camera.rotation.x]
		return
	listen: ->
		_this=@
		$(document).keydown (z) ->
			#Kliknięcie
			_this.keys[z.keyCode] = true

			#Klawisz Enter
			if z.keyCode is 13 and _this.gameState is "chat"
				_this.socket.emit "command",$(".com_i").val()
				$(".com_i").val("")

			#Klawisz T lub /
			if (z.keyCode is 84 or z.keyCode is 191) and _this.gameState is "gameLock"
				if z.keyCode is 191
					$(".com_i").val("/")
				_this._Chat()
				z.preventDefault()

			#Klawisz `
			if z.keyCode is 192
				$(".com_i").blur()
				$(".com").hide()
				z.preventDefault()
				if (_this.gameState is "menu") or (_this.gameState is "chat")
					_this._Game()
				else
					_this._Menu()
			if z.keyCode is 27 and _this.gameState is "chat"
				$(".com_i").blur()
				$(".com").hide()
				_this._Menu()

			#Wysyłanie state'u do serwera
			if _this.kc[z.keyCode] isnt undefined and _this.gameState is "gameLock"
				_this.socket.emit "move",_this.kc[z.keyCode],true
			return
		$(document).keyup (z) ->
			#Odkliknięcie
			delete _this.keys[z.keyCode]

			#Wysyłanie state'u do serwera
			if _this.kc[z.keyCode] isnt undefined
				_this.socket.emit "move",_this.kc[z.keyCode],false

			return
		$(".gameOn").click ->
			_this._Game()
			return
		lockChangeAlert=()->
			if document.pointerLockElement is _this.canvas or document.mozPointerLockElement is _this.canvas
				#Lock
				if _this.gameState is "game"
					$(".com_i").blur()
					$(".com").hide()
					_this.state "gameLock"
					$(".gameMenu").css "display", "none"
			else
				#Unlock
				if (_this.gameState is "menu") or (_this.gameState is "gameLock")
					$(".com_i").blur()
					$(".com").hide()
					_this._Menu()
			return
		document.addEventListener 'pointerlockchange', lockChangeAlert, false
		document.addEventListener 'mozpointerlockchange', lockChangeAlert, false
		document.addEventListener "mousemove", (e)->
			_this.updatePosition(e)
		, false
		return @
	state:(state)->
		@gameState=state
		if @gameState is "chat"
			$(".chat").addClass("focus")
			$(".chat").removeClass("blur")
		else
			$(".chat").removeClass("focus")
			$(".chat").addClass("blur")
		console.log "Game state: "+state
	_Game:()->
		@state "game"
		@canvas.requestPointerLock()
	_Menu:()->
		@state "menu"
		$(".gameMenu").css "display", "block"
		document.exitPointerLock = document.exitPointerLock or document.mozExitPointerLock
		document.exitPointerLock();
	_Chat:()->
		if @gameState is "gameLock"
			@state "chat"
			$(".gameMenu").css "display", "none"
			document.exitPointerLock = document.exitPointerLock or document.mozExitPointerLock
			document.exitPointerLock()
			$(".com").show()
			$(".com_i").focus()



export {FirstPersonControls}
