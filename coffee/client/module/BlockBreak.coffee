import * as THREE from './build/three.module.js'

class BlockBreak
	constructor:(game)->
		console.log game
		@game=game
		@texture=@game.al.get "blocksAtlasSnap"
		@texture.magFilter=THREE.NearestFilter
		@cursor=new THREE.Mesh(
			new THREE.BoxBufferGeometry(1.001, 1.001, 1.001)
			new THREE.MeshBasicMaterial({
					map: @texture
					transparent:true
			})
		)
		@lastPos=[]
		@cursorOut=new THREE.LineSegments(
			new THREE.EdgesGeometry( @cursor.geometry )
			new THREE.LineBasicMaterial( { color: 0x000000 } )
		)
		@game.scene.add @cursor, @cursorOut
		@uv={}
		@isDigging=false
		@done=true
		@setState 0
	setState:(state)->
		#od 0 do 9
		if state is 0
			@cursor.material.visible=false
		else
			@cursor.material.visible=true
			toxX=6+state
			toxY=8
			q=1/27
			for i in [0..@cursor.geometry.attributes.uv.array.length]
				if @uv[i] is undefined
					if i%2 is 0
						if @cursor.geometry.attributes.uv.array[i] is 0
							@uv[i]=0
						else
							@uv[i]=1
					else
						if @cursor.geometry.attributes.uv.array[i] is 0
							@uv[i]=0
						else
							@uv[i]=1
				if i%2 is 0
					if @uv[i] is 0
						@cursor.geometry.attributes.uv.array[i]=q*toxX
					else
						@cursor.geometry.attributes.uv.array[i]=q*toxX+q
				else
					if @uv[i] is 0
						@cursor.geometry.attributes.uv.array[i]=1-q*toxY-q
					else
						@cursor.geometry.attributes.uv.array[i]=1-q*toxY
			@cursor.geometry.attributes.uv.needsUpdate = true
	updatePos:(cb)->
		rayBlock=@game.world.getRayBlock()
		if JSON.stringify(@lastPos) != JSON.stringify(rayBlock)
			@lastPos=rayBlock
			cb()
		if rayBlock
			pos=rayBlock.posBreak
			@cursor.position.set pos...
			@cursor.visible=true
			@cursorOut.position.set pos...
			@cursorOut.visible=true
		else
			@cursor.visible=false
			@cursorOut.visible=false
	digRequest:()->
		console.log "REQUESTING DIGGING..."
		_this=@
		pos=@game.world.getRayBlock().posBreak
		if pos isnt undefined
			block=@game.world.cellTerrain.getBlock pos...
			if block.diggable
				@game.socket.emit "dig", pos
				@done=false
		return
	startDigging:(time)->
		_this=@
		ile=0
		if @isDigging is false
			@isDigging=true
			@int=setInterval ()->
				if ile is 11
					_this.setState 0
					clearInterval _this.int
					_this.isDigging=false
				else
					_this.setState ile
				ile++
				return
			,time/10
		return
	stopDigging:(callback)->
		@done=true
		@isDigging=false
		console.log "Digging Stopped!"
		@game.socket.emit "stopDigging",(xd)->
			callback(xd)
		@setState 0
		clearInterval @int
		return
export {BlockBreak}
