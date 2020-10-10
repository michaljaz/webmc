import {SkeletonUtils} from './../module/jsm/utils/SkeletonUtils.js'
import * as THREE from './../module/build/three.module.js'

class Player
	constructor: (options)->
		@playerObject=options.playerObject
		@scene=options.scene
	setup:()->
		@object=SkeletonUtils.clone @playerObject
		@scene.add @object
	setPos:(x,y,z,xyaw,zyaw)->
		@object.children[1].position.set x,y-0.5,z
		@object.children[1].children[0].children[0].children[0].children[2].rotation.x=xyaw
		@object.children[1].children[0].rotation.z=zyaw
	remove:()->
		@scene.remove @object
class Players
	constructor:(options)->
		@al=options.al
		@scene=options.scene
		@playersx={}
		@socket=options.socket
		@playerObject=@al.get "player"
		texturex = @al.get "steve"
		texturex.magFilter = THREE.NearestFilter
		@playerObject.children[1].scale.set 1,1,1
		@playerObject.children[1].position.set 25,25,25
		@playerObject.children[0].material.map=texturex
		@playerObject.children[0].material.color=new THREE.Color 0xffffff
		@playerObject.children[1].scale.set 0.5,0.5,0.5
	update:(players)->
		_this=@
		sockets={}
		Object.keys(players).forEach (p)->
			sockets[p]=true
			if _this.playersx[p] is undefined and p isnt _this.socket.id
				_this.playersx[p]=new Player({
					scene:_this.scene
					playerObject:_this.playerObject
					scene:_this.scene
				})
				_this.playersx[p].setup()
			try
				_this.playersx[p].setPos(players[p].x,players[p].y,players[p].z,players[p].xyaw,players[p].zyaw)
			return
		Object.keys(@playersx).forEach (p)->
			if sockets[p] is undefined
				_this.playersx[p].remove()
				delete _this.playersx[p]
			return
		return
		
export {Players}