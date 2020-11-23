import * as THREE from './build/three.module.js'
class Entities
	constructor:(options)->
		@scene=options.scene
		@saved={}
	update:(entities)->
		for i of entities
			if entities[i].type isnt "player"
				if @saved[entities[i].uuid] is undefined
					console.log entities[i]
					geometry = new THREE.BoxGeometry( 1, 1, 1 )
					material = new THREE.MeshBasicMaterial( {color: 0x00ff00} )
					cube = new THREE.Mesh( geometry, material )
					@scene.add(cube)
					cube.position.set entities[i].position.x+0.5,entities[i].position.y+16,entities[i].position.z+0.5
					@saved[entities[i].uuid]=cube
					@saved[entities[i].uuid].active=true
				else
					@saved[entities[i].uuid].position.set entities[i].position.x+0.5,entities[i].position.y+16,entities[i].position.z+0.5
					@saved[entities[i].uuid].active=true
		for i of @saved
			if @saved[i].active is false
				@scene.remove @saved[i]
				delete @saved[i]
		for i of @saved
			@saved[i].active=false
export {Entities}
