import * as THREE from './build/three.module.js'

class FirstPersonControls
	constructor: (game)->
		@game=game
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
		@setState "menu"
		@listen()
	updatePosition: (e)->
		#Updatowanie kursora
		if @gameState is "gameLock"
			@game.camera.rotation.x -= THREE.MathUtils.degToRad e.movementY / 10
			@game.camera.rotation.y -= THREE.MathUtils.degToRad e.movementX / 10
			if THREE.MathUtils.radToDeg( @game.camera.rotation.x ) < -90
				@game.camera.rotation.x = THREE.MathUtils.degToRad -90
			if THREE.MathUtils.radToDeg( @game.camera.rotation.x ) > 90
				@game.camera.rotation.x = THREE.MathUtils.degToRad 90
			@game.socket.emit "rotate", [@game.camera.rotation.y,@game.camera.rotation.x]
		return
	listen: ->
		_this=@
		$(document).keydown (z) ->
			#Kliknięcie
			_this.keys[z.keyCode] = true

			#Klawisz Escape
			if z.keyCode is 27 and _this.gameState is "inventory"
				_this.setState "menu"

			#Strzałki
			if z.keyCode is 38 and _this.gameState is "chat"
				_this.game.chat.chatGoBack()
			if z.keyCode is 40 and _this.gameState is "chat"
				_this.game.chat.chatGoForward()
			
			#Klawisz Enter
			if z.keyCode is 13 and _this.gameState is "chat"
				_this.game.chat.command $(".com_i").val()
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
				_this.game.socket.emit "move",_this.kc[z.keyCode],true
				if _this.kc[z.keyCode] is "sprint"
					to={fov:_this.game.fov+10}
					new _this.game.TWEEN.Tween _this.game.camera
						.to to, 200
						.easing _this.game.TWEEN.Easing.Quadratic.Out
						.onUpdate ()->
							_this.game.camera.updateProjectionMatrix()
						.start()
			return
		$(document).keyup (z) ->
			#Odkliknięcie
			delete _this.keys[z.keyCode]

			#Wysyłanie state'u do serwera
			if _this.kc[z.keyCode] isnt undefined
				_this.game.socket.emit "move",_this.kc[z.keyCode],false
				if _this.kc[z.keyCode] is "sprint"
					to={fov:_this.game.fov}
					new _this.game.TWEEN.Tween _this.game.camera
						.to to, 200
						.easing _this.game.TWEEN.Easing.Quadratic.Out
						.onUpdate ()->
							_this.game.camera.updateProjectionMatrix()
						.start()

			return
		$(".gameOn").click ->
			_this.setState "game"
			return
		lockChangeAlert=()->
			if document.pointerLockElement is _this.game.canvas or document.mozPointerLockElement is _this.game.canvas
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
		@game.canvas.requestPointerLock()
	unLock:()->
		document.exitPointerLock = document.exitPointerLock or document.mozExitPointerLock
		document.exitPointerLock()
	state:(state)->
		@gameState=state
		if state is "inventory"
			@game.pii.show()
		else
			@game.pii.hide()
		# console.log "Game state: "+state
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
