import { BufferGeometry, BufferAttribute, Mesh, Vector3 } from 'three'
import { ChunkTerrain } from './ChunkTerrain.js'
import { AnimatedTextureAtlas } from './AnimatedTextureAtlas.js'
import { SectionComputer } from './SectionComputer.js'
import vec3 from 'vec3'
import ChunkWorker from './chunk.worker.js'

/** Class to manage world (chunks,generating terrain,etc.) */
const World = class World {
  /**
     * World init function
     * @param game - Object of main game
     */
  constructor (game) {
    this.game = game
    this.cellMesh = {}
    this.blocksDef = this.game.al.get('blocksDef')
    this.models = {}
    this.chunkTerrain = new ChunkTerrain({
      blocksDef: this.blocksDef
    })
    this.ATA = new AnimatedTextureAtlas(this.game)
    this.material = this.ATA.material
    this.cellUpdateTime = null
    this.renderTime = 100
    this.lastPlayerChunk = null
    this.blocksUpdate = false

    this.chunkWorker = new ChunkWorker()
    this.chunkWorker.onmessage = (message) => {
      if (message.data.type === 'cellGeo') {
        return this.updateChunk(message.data.data)
      } else if (message.data.type === 'removeCell') {
        if (this.cellMesh[message.data.data] !== undefined) {
          this.cellMesh[message.data.data].geometry.dispose()
          this.game.scene.remove(this.cellMesh[message.data.data])
          delete this.cellMesh[message.data.data]
          return this.game.renderer.renderLists.dispose()
        }
      }
    }
    this.chunkWorker.postMessage({
      type: 'init',
      data: {
        blocksMapping: this.game.al.get('blocksMapping'),
        toxelSize: this.game.toxelSize,
        blocksTex: this.game.al.get('blocksTex'),
        blocksDef: this.blocksDef
      }
    })
  }

  /**
     * Updates render order of chunk meshes
     * @param cell - player cell
     */
  updateRenderOrder (cell) {
    for (const i in this.cellMesh) {
      const x = vec3(this.chunkTerrain.strToVec(i))
      this.cellMesh[i].renderOrder = -vec3(...cell).distanceTo(x)
    }
  }

  setChunk (chunkX, chunkY, chunkZ, buffer) {
    this.cellUpdateTime = window.performance.now()
    this.chunkWorker.postMessage({
      type: 'setChunk',
      data: [chunkX, chunkY, chunkZ, buffer]
    })
    this.chunkTerrain.setChunk(chunkX, chunkY, chunkZ, buffer)
  }

  /**
     * Sets custom block to some value
     * @param voxelX - block X coord
     * @param voxelY - block Y coord
     * @param voxelZ - block Z coord
     * @param value - new value of block
     */
  setBlock (voxelX, voxelY, voxelZ, value) {
    voxelX = parseInt(voxelX)
    voxelY = parseInt(voxelY)
    voxelZ = parseInt(voxelZ)
    this.blocksUpdate = true
    if (this.chunkTerrain.getVoxel(voxelX, voxelY, voxelZ) !== value) {
      this.chunkWorker.postMessage({
        type: 'setVoxel',
        data: [voxelX, voxelY, voxelZ, value]
      })
      this.chunkTerrain.setVoxel(voxelX, voxelY, voxelZ, value)
    }
  }

  /**
     * Resets all chunk meshes
     */
  resetWorld () {
    for (const i in this.cellMesh) {
      if (this.cellMesh[i].geometry !== undefined) {
        this.cellMesh[i].geometry.dispose()
        this.game.scene.remove(this.cellMesh[i])
      }
      delete this.cellMesh[i]
    }
    this.chunkTerrain.reset()
    this.chunkWorker.postMessage({
      type: 'resetWorld',
      data: null
    })
  }

  /**
     * Updates cell
     * @param data - cell Data
     */
  updateChunk (data) {
    const cellId = this.chunkTerrain.vecToStr(...data.info)
    const cell = data.cell
    const mesh = this.cellMesh[cellId]
    const geometry = new BufferGeometry()
    geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(cell.positions), 3)
    )
    geometry.setAttribute(
      'normal',
      new BufferAttribute(new Float32Array(cell.normals), 3)
    )
    geometry.setAttribute(
      'uv',
      new BufferAttribute(new Float32Array(cell.uvs), 2)
    )
    geometry.setAttribute(
      'color',
      new BufferAttribute(new Float32Array(cell.colors), 3)
    )
    geometry.matrixAutoUpdate = false
    if (mesh === undefined) {
      this.cellMesh[cellId] = new Mesh(geometry, this.material)
      this.cellMesh[cellId].matrixAutoUpdate = false
      this.cellMesh[cellId].frustumCulled = false
      this.cellMesh[cellId].onAfterRender = () => {
        this.cellMesh[cellId].frustumCulled = true
        this.cellMesh[cellId].onAfterRender = function () {}
      }
      this.game.scene.add(this.cellMesh[cellId])
      if (this.lastPlayerChunk !== null) {
        this.updateRenderOrder(JSON.parse(this.lastPlayerChunk))
      }
    } else {
      this.cellMesh[cellId].geometry = geometry
    }
  }

  /**
     * Intersect raycast vector
     * @param start - vector start
     * @param end - vector end
     */
  intersectsRay (start, end) {
    start.x += 0.5
    start.y += 0.5
    start.z += 0.5
    end.x += 0.5
    end.y += 0.5
    end.z += 0.5
    let dx = end.x - start.x
    let dy = end.y - start.y
    let dz = end.z - start.z
    const lenSq = dx * dx + dy * dy + dz * dz
    const len = Math.sqrt(lenSq)
    dx /= len
    dy /= len
    dz /= len
    let t = 0.0
    let ix = Math.floor(start.x)
    let iy = Math.floor(start.y)
    let iz = Math.floor(start.z)
    const stepX = dx > 0 ? 1 : -1
    const stepY = dy > 0 ? 1 : -1
    const stepZ = dz > 0 ? 1 : -1
    const txDelta = Math.abs(1 / dx)
    const tyDelta = Math.abs(1 / dy)
    const tzDelta = Math.abs(1 / dz)
    const xDist = stepX > 0 ? ix + 1 - start.x : start.x - ix
    const yDist = stepY > 0 ? iy + 1 - start.y : start.y - iy
    const zDist = stepZ > 0 ? iz + 1 - start.z : start.z - iz
    let txMax = txDelta < Infinity ? txDelta * xDist : Infinity
    let tyMax = tyDelta < Infinity ? tyDelta * yDist : Infinity
    let tzMax = tzDelta < Infinity ? tzDelta * zDist : Infinity
    let steppedIndex = -1
    while (t <= len) {
      const block = this.chunkTerrain.getBlock(ix, iy, iz)
      let voxel
      if (
        block.name === 'air' ||
                block.name === 'cave_air' ||
                block.name === 'void_air' ||
                block.name === 'water'
      ) {
        voxel = 0
      } else {
        voxel = 1
      }
      if (voxel) {
        return {
          position: [
            start.x + t * dx,
            start.y + t * dy,
            start.z + t * dz
          ],
          normal: [
            steppedIndex === 0 ? -stepX : 0,
            steppedIndex === 1 ? -stepY : 0,
            steppedIndex === 2 ? -stepZ : 0
          ],
          voxel
        }
      }
      if (txMax < tyMax) {
        if (txMax < tzMax) {
          ix += stepX
          t = txMax
          txMax += txDelta
          steppedIndex = 0
        } else {
          iz += stepZ
          t = tzMax
          tzMax += tzDelta
          steppedIndex = 2
        }
      } else {
        if (tyMax < tzMax) {
          iy += stepY
          t = tyMax
          tyMax += tyDelta
          steppedIndex = 1
        } else {
          iz += stepZ
          t = tzMax
          tzMax += tzDelta
          steppedIndex = 2
        }
      }
    }
    return null
  }

  /**
     * Get Block player is pointing at
     * @returns Pointing block
     */
  getRayBlock () {
    const start = new Vector3().setFromMatrixPosition(
      this.game.camera.matrixWorld
    )
    const end = new Vector3().set(0, 0, 1).unproject(this.game.camera)
    const intersection = this.intersectsRay(start, end)
    if (intersection) {
      const posPlace = intersection.position.map(function (v, ndx) {
        return Math.floor(v + intersection.normal[ndx] * 0.5)
      })
      const posBreak = intersection.position.map(function (v, ndx) {
        return Math.floor(v + intersection.normal[ndx] * -0.5)
      })
      return { posPlace, posBreak }
    } else {
      return false
    }
  }

  /**
     * Update chunks around player in radius
     * @param radius - radius from player
     */
  updateChunksAroundPlayer (radius) {
    const pos = this.game.camera.position
    const cell = this.chunkTerrain.computeChunkForVoxel(
      Math.floor(pos.x + 0.5),
      Math.floor(pos.y + 0.5),
      Math.floor(pos.z + 0.5)
    )
    if (this.blocksUpdate) {
      this.blocksUpdate = false
      this.chunkWorker.postMessage({
        type: 'updateChunksAroundPlayer',
        data: [cell, radius]
      })
    } else if (this.lastPlayerChunk !== JSON.stringify(cell)) {
      if (
        this.cellUpdateTime !== null &&
                window.performance.now() - this.cellUpdateTime > this.renderTime
      ) {
        this.updateRenderOrder(cell)
        this.lastPlayerChunk = JSON.stringify(cell)
        this.chunkWorker.postMessage({
          type: 'updateChunksAroundPlayer',
          data: [cell, radius]
        })
      }
    }
  }

  /**
     * Computes Buffer sent from server to readable section
     * @param sections - section buffer
     * @param x - section x
     * @param z - section z
     */
  computeSections (sections, x, z) {
    const result = SectionComputer({ sections, x, z })
    // console.log(result);
    const results = []
    for (const i in result) {
      const j = result[i]
      if (j !== null) {
        results.push(this.setChunk(j.x, j.y, j.z, j.cell))
      } else {
        results.push(undefined)
      }
    }
    return results
  }
}

export { World }
