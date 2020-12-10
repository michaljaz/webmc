import * as THREE from './build/three.module.js'
class PlayerInInventory
	constructor:(options)->
		@canvas=options.canvas
		@al=options.al
		@renderer=new THREE.WebGLRenderer {
			canvas:@canvas
			PixelRatio:window.devicePixelRatio
		}
		@scene=new THREE.Scene
		@scene.background = new THREE.Color "black"
		light = new THREE.AmbientLight( 0xffffff )
		@scene.add( light );

		player=@al.get "player"
		playerTex=@al.get "playerTex"

		playerTex.magFilter=THREE.NearestFilter;
		player.children[0].material.map=playerTex;
		@scene.add( player )
		@camera = new THREE.PerspectiveCamera 70, 140/204, 0.1, 1000
		@camera.rotation.order="YXZ"
		@camera.position.z = 210
		@camera.position.y = 120
		$(window).mousemove (z)->
			xoff=z.pageX-window.innerWidth/2+112
			yoff=z.pageY-window.innerHeight/2+170
			left=xoff/(window.innerWidth/2-112)
			right=xoff/(window.innerWidth/2+112)
			top=yoff/(window.innerHeight/2-170)
			bottom=yoff/(window.innerHeight/2+170)
			wych_x=Math.PI/3
			wych_y=Math.PI/4
			if xoff>0
				player.rotation.y=wych_x*right
			else
				player.rotation.y=wych_x*left
			if yoff>0
				player.children[1].children[0].children[2].children[0].children[0].rotation.x=wych_y*bottom
			else
				player.children[1].children[0].children[2].children[0].children[0].rotation.x=wych_y*top
	render:()->
		@renderer.render @scene, @camera
	show:()->
		@canvas.style.display="block"
	hide:()->
		@canvas.style.display="none"
export {PlayerInInventory}
