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
		@setState "menu"
		@listen()
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

			#Klawisz Escape
			if z.keyCode is 27 and _this.gameState is "inventory"
				_this.setState "menu"

			#Klawisz Enter
			if z.keyCode is 13 and _this.gameState is "chat"
				_this.socket.emit "command",$(".com_i").val()
				$(".com_i").val("")

			#Klawisz E
			if (z.keyCode is 69) and (_this.gameState isnt "chat") and (_this.gameState isnt "menu")
				_this.setState "inventory"

			#Klawisz T lub /
			if (z.keyCode is 84 or z.keyCode is 191) and _this.gameState is "gameLock"
				if z.keyCode is 191
					$(".com_i").val("/")
				_this.setState "chat"
				z.preventDefault()

			#Klawisz `
			if z.keyCode is 192
				z.preventDefault()
				if (_this.gameState is "menu") or (_this.gameState is "chat") or (_this.gameState is "inventory")
					_this.setState "game"
				else
					_this.setState "menu"
			if z.keyCode is 27 and _this.gameState is "chat"
				_this.setState "menu"

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
			_this.setState "game"
			return
		lockChangeAlert=()->
			if document.pointerLockElement is _this.canvas or document.mozPointerLockElement is _this.canvas
				#Lock
				if _this.gameState is "game"
					_this.setState "gameLock"
			else
				#Unlock
				if (_this.gameState is "gameLock") and (_this.gameState isnt "inventory")
					_this.setState "menu"
			return
		document.addEventListener 'pointerlockchange', lockChangeAlert, false
		document.addEventListener 'mozpointerlockchange', lockChangeAlert, false
		document.addEventListener "mousemove", (e)->
			_this.updatePosition(e)
		, false
		return @
	reqLock:()->
		@canvas.requestPointerLock()
	unLock:()->
		document.exitPointerLock = document.exitPointerLock or document.mozExitPointerLock
		document.exitPointerLock()
	state:(state)->
		@gameState=state
		console.log "Game state: "+state
	resetState:()->
		$(".chat").removeClass("focus")
		$(".chat").addClass("blur")
		$(".com_i").blur()
		$(".com").hide()
		$(".inv_window").hide()
	setState:(state)->
		@resetState()
		switch state
			when "game"
				@state "game"
				@reqLock()
			when "gameLock"
				@state "gameLock"
				$(".gameMenu").hide()
			when "menu"
				@state "menu"
				$(".gameMenu").show()
				@unLock()
			when "chat"
				if @gameState is "gameLock"
					$(".chat").addClass("focus")
					$(".chat").removeClass("blur")
					$(".gameMenu").hide()
					@state "chat"
					@unLock()
					$(".com").show()
					$(".com_i").focus()
			when "inventory"
				if @gameState isnt "menu"
					$(".gameMenu").hide()
					if @gameState isnt "inventory"
						@state "inventory"
						$(".inv_window").show()
						@unLock()
					else
						@setState "game"

export {FirstPersonControls}
