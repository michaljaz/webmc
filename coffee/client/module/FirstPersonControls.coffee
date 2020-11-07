import * as THREE from './build/three.module.js'

class FirstPersonControls
	constructor: (options)->
		@kc={
			87:"forward"
			65:"right"
			83:"back"
			68:"left"
			32:"jump"
		}
		@keys={}
		@canvas=options.canvas
		@camera=options.camera
		@micromove=options.micromove
		@socket=options.socket
		@gameState="menu"
		@listen()
	updatePosition: (e)->
		if @gameState is "game"
			@camera.rotation.x -= THREE.MathUtils.degToRad e.movementY / 10
			@camera.rotation.y -= THREE.MathUtils.degToRad e.movementX / 10
			if THREE.MathUtils.radToDeg( @camera.rotation.x ) < -90
				@camera.rotation.x = THREE.MathUtils.degToRad -90
			if THREE.MathUtils.radToDeg( @camera.rotation.x ) > 90
				@camera.rotation.x = THREE.MathUtils.degToRad 90
			@socket.emit "playerRotate", [@camera.rotation.y,@camera.rotation.x]
		return
	listen: ->
		_this=@
		$(window).keydown (z) ->
			_this.keys[z.keyCode] = true
			#If click escape
			if z.keyCode is 27
				if _this.gameState is "menu"
					_this.canvas.requestPointerLock()
				else
					document.exitPointerLock = document.exitPointerLock or document.mozExitPointerLock;
					document.exitPointerLock();
			if _this.kc[z.keyCode] isnt undefined
				_this.socket.emit "move",_this.kc[z.keyCode],true
			return
		$(document).keyup (z) ->
			if _this.kc[z.keyCode] isnt undefined
				_this.socket.emit "move",_this.kc[z.keyCode],false
			delete _this.keys[z.keyCode]
			return
		$(".gameOn").click ->
			_this.canvas.requestPointerLock()
			return
		lockChangeAlert=()->
			if document.pointerLockElement is _this.canvas or document.mozPointerLockElement is _this.canvas
				_this.gameState="game"
				$(".gameMenu").css "display", "none"
			else
				_this.gameState="menu"
				$(".gameMenu").css "display", "block"
			return
		document.addEventListener 'pointerlockchange', lockChangeAlert, false
		document.addEventListener 'mozpointerlockchange', lockChangeAlert, false
		document.addEventListener "mousemove", (e)->
			_this.updatePosition(e)
		, false
		return @

export {FirstPersonControls}
