import * as THREE from 'three'

class TextureAtlasCreator
	constructor: (options)->
		@textureX=options.textureX
		@textureMapping=options.textureMapping
		@size=36
		@willSize=27
	gen: (tick)->
		multi={}
		for i of @textureMapping
			if i.includes "@"
				xd=@decodeName i
				if multi[xd.pref] is undefined
					multi[xd.pref]=xd
				else
					multi[xd.pref].x=Math.max multi[xd.pref].x,xd.x
					multi[xd.pref].y=Math.max multi[xd.pref].y,xd.y
		canvasx = document.createElement 'canvas'
		ctx=canvasx.getContext "2d"
		canvasx.width=@willSize*16
		canvasx.height=@willSize*16
		toxelX=1
		toxelY=1
		for i of @textureMapping
			if i.includes "@"
				xd=@decodeName i
				if multi[xd.pref].loaded is undefined
					multi[xd.pref].loaded=true
					lol=@getToxelForTick tick,multi[xd.pref].x+1,multi[xd.pref].y+1
					texmap=@textureMapping["#{xd.pref}@#{lol.col}@#{lol.row}"]
					ctx.drawImage @textureX,(texmap.x-1)*16,(texmap.y-1)*16,16,16,(toxelX-1)*16,(toxelY-1)*16,16,16
					toxelX++
					if toxelX>@willSize
						toxelX=1
						toxelY++
			else
				ctx.drawImage @textureX,(@textureMapping[i].x-1)*16,(@textureMapping[i].y-1)*16,16,16,(toxelX-1)*16,(toxelY-1)*16,16,16
				toxelX++
				if toxelX>@willSize
					toxelX=1
					toxelY++
		return canvasx
	decodeName: (i)->
		m=null
		for j in [0..i.length-1]
			if i[j] is "@"
				m=j
				break
		pref=i.substr 0,m
		sub=i.substr m,i.length
		m2=null
		for j in [0..sub.length-1]
			if sub[j] is "@"
				m2=j
		x=parseInt sub.substr(1,m2-1)
		y=parseInt sub.substr(m2+1,sub.length)
		return {pref,x,y}
	getToxelForTick: (tick,w,h)->
		tick=tick%(w*h)+1
		#option1
		col=(tick-1)%w
		row=Math.ceil(tick/w)-1
		#option2
		col=Math.ceil(tick/h)-1
		row=(tick-1)%h;
		return {row,col}
class AnimatedTextureAtlas
	constructor:(game)->
		_this=@
		@game=game
		@material=new THREE.MeshStandardMaterial({
			side: 0
			map:null
			vertexColors: true
		})
		@uni=
			view:new THREE.Vector3
			farnear:new THREE.Vector2
			color:new THREE.Vector4
		@material.onBeforeCompile=(shader)->

			#Uniforms
			shader.uniforms.u_viewPos={value:_this.uni.view}
			shader.uniforms.u_fogColor={value:_this.uni.color}
			shader.uniforms.u_farnear={value:_this.uni.farnear}
			#Fragment shader
			shader.fragmentShader=[
				"uniform vec3 u_viewPos;"
				"uniform vec4 u_fogColor;"
				"uniform float u_fogNear;"
				"uniform float u_fogFar;"
				"uniform vec2 u_farnear;"
				shader.fragmentShader
			].join("\n")
			# # shader.fragmentShader="uniform vec4 fogColor;\nuniform float fogAmount;\n"+shader.fragmentShader
			shader.fragmentShader=shader.fragmentShader.replace(
				"gl_FragColor = vec4( outgoingLight, diffuseColor.a );"
				[
					"float dist=length(u_viewPos-vViewPosition);"
					"float fogAmount = smoothstep(u_farnear.x, u_farnear.y, dist);"
					"gl_FragColor = vec4( outgoingLight, diffuseColor.a );"
					"gl_FragColor = mix(gl_FragColor,u_fogColor,max(0.1,fogAmount));"
				].join("\n")
			)

			#Vertex shader
			shader.vertexShader=[
				"uniform float time;"
				"uniform mat4 u_worldView;"
				"attribute vec4 a_position;"
				shader.vertexShader
			].join("\n")
			shader.vertexShader=shader.vertexShader.replace(
				"#include <fog_vertex>"
				[
					"vec4 vViewPosition4 = modelViewMatrix * vec4(position, 1);"
					"vViewPosition = vViewPosition4.xyz;"
				].join("\n")
				
			)
			return
		@atlasCreator=new TextureAtlasCreator({
			textureX:@game.al.get "blocksAtlasFull"
			textureMapping:@game.al.get "blocksMappingFull"
		})
		savedTextures=[]
		for i in [0..9]
			t=@atlasCreator.gen(i).toDataURL()
			tekstura=new THREE.TextureLoader().load t
			tekstura.magFilter = THREE.NearestFilter
			tekstura.minFilter = THREE.NearestFilter
			savedTextures.push tekstura
		tickq=0
		setInterval(()->
			tickq++
			tekst=savedTextures[tickq%9]
			_this.material.map=tekst
			_this.material.map.needsUpdate=true
			return
		,100)

export {AnimatedTextureAtlas,TextureAtlasCreator}
