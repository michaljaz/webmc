import { Vector3, Vector2, Vector4 } from 'three'

class DistanceBasedFog {
  constructor (game) {
    this.game = game
    this.view = new Vector3()
    this.farnear = new Vector2()
    this.color = new Vector4()
  }

  update () {
    this.view
      .copy(this.game.camera.position)
      .applyMatrix4(this.game.camera.matrixWorldInverse)
  }

  addShaderToMaterial (material) {
    material.onBeforeCompile = (shader) => {
      shader.uniforms.u_viewPos = {
        value: this.view
      }
      shader.uniforms.u_fogColor = {
        value: this.color
      }
      shader.uniforms.u_farnear = {
        value: this.farnear
      }
      shader.fragmentShader = [
        'uniform vec3 u_viewPos;',
        'uniform vec4 u_fogColor;',
        'uniform vec2 u_farnear;',
        shader.fragmentShader
      ].join('\n')
      shader.fragmentShader = shader.fragmentShader.replace(
        'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
        [
          'float dist = length(u_viewPos - vViewPosition);',
          'float fogFactor = smoothstep(u_farnear.x, u_farnear.y, dist);',
          'gl_FragColor = vec4(outgoingLight, diffuseColor.a );',
          'gl_FragColor = mix(gl_FragColor, u_fogColor, max(0.05, fogFactor));'
        ].join('\n')
      )
    }
  }
}

export { DistanceBasedFog }
