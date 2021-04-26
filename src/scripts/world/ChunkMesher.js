import { CustomRender } from './CustomRender.js'

class ChunkMesher {
  constructor (options) {
    this.cellSize = 16
    this.undefinedBlock = 'black_shulker_box'
    this.blocksTex = options.blocksTex
    this.blocksMapping = options.blocksMapping
    this.chunkTerrain = options.chunkTerrain
    this.toxelSize = options.toxelSize
    this.q = 1 / this.toxelSize
    this.neighbours = {
      px: [-1, 0, 0],
      nx: [1, 0, 0],
      ny: [0, -1, 0],
      py: [0, 1, 0],
      pz: [0, 0, 1],
      nz: [0, 0, -1]
    }
    this.customRender = {}
    for (const funcName in CustomRender) {
      this.customRender[funcName] = CustomRender[funcName].bind(this)
    }
  }

  getUV (name) {
    let { x: toxX, y: toxY } = this.blocksMapping[name]
    toxX -= 1
    toxY -= 1
    const x1 = this.q * toxX
    const y1 = 1 - this.q * toxY - this.q
    const x2 = this.q * toxX + this.q
    const y2 = 1 - this.q * toxY
    return [
      [x1, y1],
      [x1, y2],
      [x2, y1],
      [x2, y2]
    ]
  }

  getUvForFace (block, type, opt) {
    let xd, toxX, toxY
    if (
      this.blocksTex[block.name] !== undefined ||
        this.blocksTex[String(block.stateId)] !== undefined
    ) {
      if (this.blocksTex[String(block.stateId)] !== undefined) {
        xd = this.blocksTex[String(block.stateId)]
      } else {
        xd = this.blocksTex[block.name]
      }
      if (xd.all !== undefined) {
        toxX = this.blocksMapping[xd.all].x
        toxY = this.blocksMapping[xd.all].y
      } else if (xd.side !== undefined) {
        const mapka = { py: 'top', ny: 'bottom' }
        if (mapka[type] !== undefined) {
          toxX = this.blocksMapping[xd[mapka[type]]].x
          toxY = this.blocksMapping[xd[mapka[type]]].y
        } else {
          toxX = this.blocksMapping[xd.side].x
          toxY = this.blocksMapping[xd.side].y
        }
      } else {
        toxX = this.blocksMapping[xd[type]].x
        toxY = this.blocksMapping[xd[type]].y
      }
    } else if (block.name === 'water') {
      toxX = this.blocksMapping.water_flow.x
      toxY = this.blocksMapping.water_flow.y
    } else if (block.name === 'lava') {
      toxX = this.blocksMapping.lava_flow.x
      toxY = this.blocksMapping.lava_flow.y
    } else if (this.blocksMapping[block.name]) {
      toxX = this.blocksMapping[block.name].x
      toxY = this.blocksMapping[block.name].y
    } else {
      toxX = this.blocksMapping[this.undefinedBlock].x
      toxY = this.blocksMapping[this.undefinedBlock].y
    }
    toxX -= 1
    toxY -= 1
    const x1 = this.q * toxX
    const y1 = 1 - this.q * toxY - this.q
    const x2 = this.q * toxX + this.q
    const y2 = 1 - this.q * toxY
    const uv = [
      [x1, y1],
      [x1, y2],
      [x2, y1],
      [x2, y2]
    ]
    if (opt) {
      return [...uv[0], ...uv[1], ...uv[2], ...uv[2], ...uv[1], ...uv[3]]
    } else {
      return [...uv[2], ...uv[0], ...uv[3], ...uv[3], ...uv[0], ...uv[1]]
    }
  }

  genBlockFace (type, block, pos, opt) {
    const uv = this.getUvForFace(block, type, opt)
    const norm = []
    for (let i = 0; i < 6; i++) {
      norm.push(...this.neighbours[type])
    }
    const px = ({
      pz: [0, 1, 2, 3],
      nx: [1, 4, 3, 5],
      nz: [4, 6, 5, 7],
      px: [6, 0, 7, 2],
      py: [5, 7, 3, 2],
      ny: [1, 0, 4, 6]
    })[type]
    let ids
    if (opt) {
      ids = [1, 3, 0, 0, 3, 2]
    } else {
      ids = [0, 1, 2, 2, 1, 3]
    }

    const posx = []
    const pt = [
      [-0.5, -0.5, 0.5],
      [0.5, -0.5, 0.5],
      [-0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5],
      [0.5, -0.5, -0.5],
      [0.5, 0.5, -0.5],
      [-0.5, -0.5, -0.5],
      [-0.5, 0.5, -0.5]
    ]
    for (let i = 0; i < ids.length; i++) {
      posx.push(pt[px[ids[i]]][0] + pos[0], pt[px[ids[i]]][1] + pos[1], pt[px[ids[i]]][2] + pos[2])
    }
    return {
      pos: posx,
      norm,
      uv
    }
  }

  addFace (tVertexBuffer, VertexBuffer, type, pos) {
    const block = this.chunkTerrain.getBlock(...pos)

    const col = this.ambientOcclusion(block, pos, type)
    let faceVertex
    if (col[0] + col[3] >= col[1] + col[2]) {
      faceVertex = this.genBlockFace(type, block, pos, true)
      faceVertex.color = [
        ...col[2],
        ...col[3],
        ...col[0],
        ...col[0],
        ...col[3],
        ...col[1]
      ]
    } else {
      faceVertex = this.genBlockFace(type, block, pos, false)
      faceVertex.color = [
        ...col[0],
        ...col[2],
        ...col[1],
        ...col[1],
        ...col[2],
        ...col[3]
      ]
    }

    this.push(
      tVertexBuffer,
      VertexBuffer,
      faceVertex,
      this.chunkTerrain.getBlock(...pos).transparent
    )
  }

  ambientOcclusion (block, pos, type) {
    const loaded = {}
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          loaded[`${x}:${y}:${z}`] =
            this.chunkTerrain.getBlock(
              pos[0] + x,
              pos[1] + y,
              pos[2] + z
            ).boundingBox === 'block'
              ? 1
              : 0
        }
      }
    }
    const col = ({
      py: [
        this.aoColor(loaded['1:1:-1'] + loaded['0:1:-1'] + loaded['1:1:0']),
        this.aoColor(loaded['1:1:1'] + loaded['0:1:1'] + loaded['1:1:0']),
        this.aoColor(loaded['-1:1:-1'] + loaded['0:1:-1'] + loaded['-1:1:0']),
        this.aoColor(loaded['-1:1:1'] + loaded['0:1:1'] + loaded['-1:1:0'])
      ],
      ny: [
        this.aoColor(loaded['1:-1:1'] + loaded['0:-1:1'] + loaded['1:-1:0']),
        this.aoColor(loaded['1:-1:-1'] + loaded['0:-1:-1'] + loaded['1:-1:0']),
        this.aoColor(loaded['-1:-1:1'] + loaded['0:-1:1'] + loaded['-1:-1:0']),
        this.aoColor(loaded['-1:-1:-1'] + loaded['0:-1:-1'] + loaded['-1:-1:0'])
      ],
      px: [
        this.aoColor(loaded['-1:-1:0'] + loaded['-1:-1:-1'] + loaded['-1:0:-1']),
        this.aoColor(loaded['-1:1:0'] + loaded['-1:1:-1'] + loaded['-1:0:-1']),
        this.aoColor(loaded['-1:-1:0'] + loaded['-1:-1:1'] + loaded['-1:0:1']),
        this.aoColor(loaded['-1:1:0'] + loaded['-1:1:1'] + loaded['-1:0:1'])
      ],
      nx: [
        this.aoColor(loaded['1:-1:0'] + loaded['1:-1:1'] + loaded['1:0:1']),
        this.aoColor(loaded['1:1:0'] + loaded['1:1:1'] + loaded['1:0:1']),
        this.aoColor(loaded['1:-1:0'] + loaded['1:-1:-1'] + loaded['1:0:-1']),
        this.aoColor(loaded['1:1:0'] + loaded['1:1:-1'] + loaded['1:0:-1'])
      ],
      pz: [
        this.aoColor(loaded['0:-1:1'] + loaded['-1:-1:1'] + loaded['-1:0:1']),
        this.aoColor(loaded['0:1:1'] + loaded['-1:1:1'] + loaded['-1:0:1']),
        this.aoColor(loaded['0:-1:1'] + loaded['1:-1:1'] + loaded['1:0:1']),
        this.aoColor(loaded['0:1:1'] + loaded['1:1:1'] + loaded['1:0:1'])
      ],
      nz: [
        this.aoColor(loaded['0:-1:-1'] + loaded['1:-1:-1'] + loaded['1:0:-1']),
        this.aoColor(loaded['0:1:-1'] + loaded['1:1:-1'] + loaded['1:0:-1']),
        this.aoColor(loaded['0:-1:-1'] + loaded['-1:-1:-1'] + loaded['-1:0:-1']),
        this.aoColor(loaded['0:1:-1'] + loaded['-1:1:-1'] + loaded['-1:0:-1'])
      ]
    })[type]
    const ile = 4
    if (block.name === 'water') {
      for (let i = 0; i < 4; i++) {
        col[i][0] /= ile
        col[i][1] /= ile
      }
    } else if ((block.name === 'grass_block' && type === 'py') || block.name.includes('leaves')) {
      for (let i = 0; i < 4; i++) {
        col[i][0] /= ile
        col[i][2] /= ile
      }
    }
    return col
  }

  push (tVertexBuffer, VertexBuffer, faceVertex, transparent) {
    if (transparent) {
      tVertexBuffer.positions.push(...faceVertex.pos)
      tVertexBuffer.normals.push(...faceVertex.norm)
      tVertexBuffer.uvs.push(...faceVertex.uv)
      tVertexBuffer.colors.push(...faceVertex.color)
    } else {
      VertexBuffer.positions.push(...faceVertex.pos)
      VertexBuffer.normals.push(...faceVertex.norm)
      VertexBuffer.uvs.push(...faceVertex.uv)
      VertexBuffer.colors.push(...faceVertex.color)
    }
  }

  aoColor (type) {
    const num = ({
      0: 0.9,
      1: 0.7,
      2: 0.5,
      3: 0.3
    })[type]
    return [num, num, num]
  }

  genChunkGeo (cellX, cellY, cellZ) {
    const VertexBuffer = {
      positions: [],
      normals: [],
      uvs: [],
      colors: []
    }
    const tVertexBuffer = {
      positions: [],
      normals: [],
      uvs: [],
      colors: []
    }

    for (let i = 0; i < this.cellSize; i++) {
      for (let j = 0; j < this.cellSize; j++) {
        for (let k = 0; k < this.cellSize; k++) {
          const pos = [
            cellX * this.cellSize + i,
            cellY * this.cellSize + j,
            cellZ * this.cellSize + k
          ]
          const [
            mainBlock,
            neighbours
          ] = this.chunkTerrain.getBlockNeighbours(...pos)
          if (mainBlock.boundingBox === 'block') {
            for (const side in neighbours) {
              const nBlock = neighbours[side]
              if ((mainBlock.transparent && nBlock.boundingBox !== 'block') || (nBlock.boundingBox !== 'block' || nBlock.transparent)) {
                this.addFace(tVertexBuffer, VertexBuffer, side, pos)
              }
            }
          } else if (this.customRender[mainBlock.name]) {
            this.customRender[mainBlock.name](
              tVertexBuffer,
              VertexBuffer,
              pos
            )
          }
        }
      }
    }
    for (let i = 0; i < tVertexBuffer.positions.length; i++) {
      VertexBuffer.positions.push(tVertexBuffer.positions[i])
      VertexBuffer.normals.push(tVertexBuffer.normals[i])
      VertexBuffer.colors.push(tVertexBuffer.colors[i])
    }
    for (let i = 0; i < tVertexBuffer.uvs.length; i++) {
      VertexBuffer.uvs.push(tVertexBuffer.uvs[i])
    }
    return VertexBuffer
  }
}

export { ChunkMesher }
