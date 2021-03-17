const modulo = function (a, b) {
  return ((+a % (b = +b)) + b) % b
}

class ChunkTerrain {
  constructor (options) {
    this.chunkSize = 16
    this.chunks = {}
    this.blocksDef = options.blocksDef
    this.neighbours = {
      px: [-1, 0, 0],
      nx: [1, 0, 0],
      ny: [0, -1, 0],
      py: [0, 1, 0],
      pz: [0, 0, 1],
      nz: [0, 0, -1]
    }
  }

  vecToStr (x, y, z) {
    return `${parseInt(x)}:${parseInt(y)}:${parseInt(z)}`
  }

  strToVec (str) {
    str = str.split(':')
    return [parseInt(str[0]), parseInt(str[1]), parseInt(str[2])]
  }

  computeVoxelOffset (voxelX, voxelY, voxelZ) {
    const x = modulo(voxelX, this.chunkSize) | 0
    const y = modulo(voxelY, this.chunkSize) | 0
    const z = modulo(voxelZ, this.chunkSize) | 0
    return y * this.chunkSize * this.chunkSize + z * this.chunkSize + x
  }

  computeChunkForVoxel (voxelX, voxelY, voxelZ) {
    return [
      Math.floor(voxelX / this.chunkSize),
      Math.floor(voxelY / this.chunkSize),
      Math.floor(voxelZ / this.chunkSize)
    ]
  }

  addChunkForVoxel (voxelX, voxelY, voxelZ) {
    const cellId = this.vecToStr(
      ...this.computeChunkForVoxel(voxelX, voxelY, voxelZ)
    )
    let cell = this.chunks[cellId]
    if (!cell) {
      cell = new Uint32Array(
        this.chunkSize * this.chunkSize * this.chunkSize
      )
      this.chunks[cellId] = cell
    }
    return cell
  }

  getChunkForVoxel (voxelX, voxelY, voxelZ) {
    const cellId = this.vecToStr(
      ...this.computeChunkForVoxel(voxelX, voxelY, voxelZ)
    )
    return this.chunks[cellId]
  }

  setVoxel (voxelX, voxelY, voxelZ, value) {
    let cell = this.getChunkForVoxel(voxelX, voxelY, voxelZ)
    if (!cell) {
      cell = this.addChunkForVoxel(voxelX, voxelY, voxelZ)
    }
    const voff = this.computeVoxelOffset(voxelX, voxelY, voxelZ)
    cell[voff] = value
  }

  getVoxel (voxelX, voxelY, voxelZ) {
    const cell = this.getChunkForVoxel(voxelX, voxelY, voxelZ)
    if (!cell) {
      return 0
    }
    const voff = this.computeVoxelOffset(voxelX, voxelY, voxelZ)
    return cell[voff]
  }

  setChunk (chunkX, chunkY, chunkZ, buffer) {
    this.chunks[this.vecToStr(chunkX, chunkY, chunkZ)] = buffer
  }

  getBlock (blockX, blockY, blockZ) {
    const stateId = this.getVoxel(blockX, blockY, blockZ)
    const def = this.blocksDef[stateId]
    if (def !== undefined) {
      return {
        name: def[0],
        stateId,
        boundingBox: def[1] === 1 ? 'block' : 'empty',
        transparent: def[2]
      }
    } else {
      return false
    }
  }

  getBlockNeighbours (blockX, blockY, blockZ) {
    const neighbours = {}
    const main = this.getBlock(blockX, blockY, blockZ)
    for (const side in this.neighbours) {
      const offset = this.neighbours[side]
      neighbours[side] = this.getBlock(
        blockX + offset[0],
        blockY + offset[1],
        blockZ + offset[2]
      )
    }
    return [main, neighbours]
  }

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
      const block = this.getBlock(ix, iy, iz)
      let voxel
      if (
        block.name === 'air' || block.name === 'cave_air' || block.name === 'void_air' || block.name === 'water'
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

  reset () {
    this.chunks = {}
  }
}

export { ChunkTerrain }
