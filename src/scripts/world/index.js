import { Vector3 } from 'three'
import { ChunkTerrain } from './ChunkTerrain.js'
import { AnimatedTextureAtlas } from './AnimatedTextureAtlas.js'
import { SectionComputer } from './SectionComputer.js'
import { ChunkManager } from './ChunkManager.js'
import ChunkWorker from './chunk.worker.js'

class World {
  constructor (game) {
    this.game = game
    this.blocksDef = this.game.al.get('blocksDef')
    this.chunkTerrain = new ChunkTerrain({
      blocksDef: this.blocksDef
    })
    this.ATA = new AnimatedTextureAtlas(this.game)
    this.material = this.ATA.material
    this.cellUpdateTime = null
    this.lastPlayerChunk = null
    this.blocksUpdate = false

    this.chunkManager = new ChunkManager(this.game)

    this.chunkWorker = new ChunkWorker()
    this.chunkWorker.onmessage = (message) => {
      if (message.data.type === 'cellGeo') {
        const cellId = this.chunkTerrain.vecToStr(...message.data.data.info)
        const vert = message.data.data.cell
        this.chunkManager.addChunk(cellId, vert)
      } else if (message.data.type === 'removeCell') {
        this.chunkManager.removeChunk(message.data.data)
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

  setChunk (chunkX, chunkY, chunkZ, buffer) {
    this.cellUpdateTime = window.performance.now()
    this.chunkWorker.postMessage({
      type: 'setChunk',
      data: [chunkX, chunkY, chunkZ, buffer]
    })
    this.chunkTerrain.setChunk(chunkX, chunkY, chunkZ, buffer)
  }

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

  resetWorld () {
    this.chunkManager.reset()
    this.chunkTerrain.reset()
    this.chunkWorker.postMessage({
      type: 'resetWorld',
      data: null
    })
  }

  getRayBlock () {
    const start = new Vector3().setFromMatrixPosition(this.game.camera.matrixWorld)
    const end = new Vector3().set(0, 0, 1).unproject(this.game.camera)
    const intersection = this.chunkTerrain.intersectsRay(start, end)
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

  updateChunksAroundPlayer (radius) {
    this.chunkManager.update()
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
        this.cellUpdateTime !== null && window.performance.now() - this.cellUpdateTime > 100
      ) {
        this.chunkManager.updateRenderOrder(cell)
        this.lastPlayerChunk = JSON.stringify(cell)
        this.chunkWorker.postMessage({
          type: 'updateChunksAroundPlayer',
          data: [cell, radius]
        })
      }
    }
  }

  computeSections (sections, biomes, x, z) {
    const result = SectionComputer({ sections, x, z })
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
