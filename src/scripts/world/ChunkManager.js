import { BufferGeometry, BufferAttribute, Mesh } from 'three'
import vec3 from 'vec3'

class ChunkManager {
  constructor (game) {
    this.game = game
    this.cellMesh = new Map()
  }

  addChunk (cellId, vert) {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(vert.positions), 3))
    geometry.setAttribute('normal', new BufferAttribute(new Float32Array(vert.normals), 3))
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(vert.uvs), 2))
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(vert.colors), 3))
    geometry.matrixAutoUpdate = false

    const mesh = this.cellMesh.get(cellId)
    if (mesh === undefined) {
      const newMesh = new Mesh(geometry, this.game.world.material)
      newMesh.matrixAutoUpdate = false
      newMesh.frustumCulled = false
      newMesh.onAfterRender = () => {
        newMesh.frustumCulled = true
        newMesh.onAfterRender = function () {}
      }
      this.cellMesh.set(cellId, newMesh)
      this.game.scene.add(newMesh)
      if (this.game.world.lastPlayerChunk !== null) {
        this.updateRenderOrder(JSON.parse(this.game.world.lastPlayerChunk))
      }
    } else {
      this.cellMesh.get(cellId).geometry = geometry
    }
  }

  removeChunk (cellId) {
    if (this.cellMesh.get(cellId) !== undefined) {
      this.cellMesh.get(cellId).geometry.dispose()
      this.game.scene.remove(this.cellMesh.get(cellId))
      this.cellMesh.delete(cellId)
      this.game.renderer.renderLists.dispose()
    }
  }

  updateRenderOrder (cell) {
    for (const [k, v] of this.cellMesh) {
      const x = vec3(this.game.world.chunkTerrain.strToVec(k))
      v.renderOrder = -vec3(...cell).distanceTo(x)
    }
  }

  reset () {
    for (const i of this.cellMesh) {
      if (i[1].geometry !== undefined) {
        i[1].geometry.dispose()
        this.game.scene.remove(i[1])
      }
    }
    this.cellMesh.clear()
  }
}
export { ChunkManager }
