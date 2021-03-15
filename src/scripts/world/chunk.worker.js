/* eslint-env worker */
import { ChunkTerrain } from './ChunkTerrain.js'
import { ChunkMesher } from './ChunkMesher.js'
import raf from 'raf'
import vec3 from 'vec3'

self.requestAnimationFrame = raf
let terrain = null
class TerrainManager {
  constructor (data) {
    this.chunkTerrain = new ChunkTerrain({
      blocksDef: data.blocksDef
    })
    this.chunkMesher = new ChunkMesher({
      blocksTex: data.blocksTex,
      blocksMapping: data.blocksMapping,
      toxelSize: data.toxelSize,
      chunkTerrain: this.chunkTerrain
    })
    this.neighbours = [
      [-1, 0, 0],
      [1, 0, 0],
      [0, -1, 0],
      [0, 1, 0],
      [0, 0, -1],
      [0, 0, 1]
    ]
    this.chunkNeedsUpdate = {}
    this.generatedChunks = {}
    this.renderRadius = 10
    this.playerChunk = [0, 0, 0]
    this.loop()
  }

  distance (chunkId) {
    const data = this.chunkTerrain.strToVec(chunkId)
    const chunk = vec3(...data)
    const chunkP = vec3(...this.playerChunk)
    return chunkP.distanceTo(chunk)
  }

  setVoxel (data) {
    this.chunkTerrain.setVoxel(...data)
    const chunkId = this.chunkTerrain.vecToStr(
      ...terrain.chunkTerrain.computeChunkForVoxel(
        data[0],
        data[1],
        data[2]
      )
    )
    this.chunkNeedsUpdate[chunkId] = true
    for (let l = 0; l < this.neighbours.length; l++) {
      const nei = this.neighbours[l]
      const neiChunkId = this.chunkTerrain.vecToStr(
        ...this.chunkTerrain.computeChunkForVoxel(
          data[0] + nei[0],
          data[1] + nei[1],
          data[2] + nei[2]
        )
      )
      this.chunkNeedsUpdate[neiChunkId] = true
    }
  }

  setChunk (data) {
    this.chunkTerrain.setChunk(data[0], data[1], data[2], data[3])
    const chunkId = terrain.chunkTerrain.vecToStr(
      data[0],
      data[1],
      data[2]
    )
    this.chunkNeedsUpdate[chunkId] = true
    for (let l = 0; l < this.neighbours.length; l++) {
      const nei = this.neighbours[l]
      const neiChunkId = this.chunkTerrain.vecToStr(
        data[0] + nei[0],
        data[1] + nei[1],
        data[2] + nei[2]
      )
      this.chunkNeedsUpdate[neiChunkId] = true
    }
  }

  genNearestChunk () {
    let nearestChunkId = ''
    let nearestDistance = -1
    let isNearest = false
    for (const chunkId in this.chunkNeedsUpdate) {
      const dist = this.distance(chunkId)
      if (
        (nearestDistance === -1 || nearestDistance > dist) &&
        dist <= this.renderRadius
      ) {
        isNearest = true
        nearestDistance = dist
        nearestChunkId = chunkId
      }
    }
    if (isNearest) {
      const data = this.chunkTerrain.strToVec(nearestChunkId)
      this.generatedChunks[nearestChunkId] = true
      postMessage({
        type: 'cellGeo',
        data: {
          cell: this.chunkMesher.genChunkGeo(...data),
          info: data,
          p: performance.now()
        }
      })
      delete this.chunkNeedsUpdate[nearestChunkId]
    }
  }

  removeChunks () {
    for (const chunkId in this.generatedChunks) {
      const dist = this.distance(chunkId)
      if (dist > this.renderRadius) {
        delete this.generatedChunks[chunkId]
        this.chunkNeedsUpdate[chunkId] = true
        postMessage({
          type: 'removeCell',
          data: chunkId
        })
      }
    }
  }

  loop () {
    this.removeChunks()
    this.genNearestChunk()
    self.requestAnimationFrame(() => {
      this.loop()
    })
  }

  updateChunksAroundPlayer (data) {
    this.playerChunk = data[0]
    this.renderRadius = data[1]
  }
}

addEventListener('message', function (e) {
  const type = e.data.type
  const data = e.data.data
  switch (type) {
    case 'init':
      // FIXME: This is a hack to avoid reinstantiating terrain because `init` seems to be called twice
      if (terrain) return
      terrain = new TerrainManager(data)
      break
    case 'setVoxel':
      terrain.setVoxel(data)
      break
    case 'genChunkGeo':
      terrain.genChunkGeo(data)
      break
    case 'setChunk':
      terrain.setChunk(data)
      break
    case 'resetWorld':
      console.log('RESET WORLD!')
      terrain.chunkTerrain.reset()
      break
    case 'updateChunksAroundPlayer':
      terrain.updateChunksAroundPlayer(data)
      break
  }
})
