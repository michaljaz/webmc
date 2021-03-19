const CustomRender = {
  water: function (tVertexBuffer, VertexBuffer, pos) {
    const block = this.chunkTerrain.getBlock(pos[0], pos[1], pos[2])
    const state = block.stateId

    // const falling = !!(state & 8);
    const level = state - 32
    if (level === 10) {
      for (const l in this.neighbours) {
        const offset = this.neighbours[l]
        if (
          this.chunkTerrain.getBlock(
            pos[0] + offset[0],
            pos[1] + offset[1],
            pos[2] + offset[2]
          ).name !== 'water'
        ) { this.addFace(tVertexBuffer, VertexBuffer, l, pos) }
      }
    } else {
      for (const side in this.neighbours) {
        const offset = this.neighbours[side]
        if (
          this.chunkTerrain.getBlock(
            pos[0] + offset[0],
            pos[1] + offset[1],
            pos[2] + offset[2]
          ).name === 'water'
        ) { continue }
        const faceVertex = this.genBlockFace(side, block, pos)
        const waterLevels = []
        for (let x = -1; x <= 1; x++) {
          for (let z = -1; z <= 1; z++) {
            const block = this.chunkTerrain.getBlock(
              pos[0] + x,
              pos[1],
              pos[2] + z
            )
            if (block.name === 'water') {
              if (block.stateId - 32 === 10) waterLevels.push(0)
              else waterLevels.push((block.stateId - 33) / 10)
            } else if (block.boundingBox === 'block') { waterLevels.push(10) } else waterLevels.push(1)
          }
        }
        const waterLevelAverages = [
          Math.min(
            waterLevels[0],
            waterLevels[1],
            waterLevels[3],
            waterLevels[4]
          ),
          Math.min(
            waterLevels[1],
            waterLevels[2],
            waterLevels[4],
            waterLevels[5]
          ),
          Math.min(
            waterLevels[4],
            waterLevels[5],
            waterLevels[7],
            waterLevels[8]
          ),
          Math.min(
            waterLevels[3],
            waterLevels[4],
            waterLevels[6],
            waterLevels[7]
          )
        ]

        switch (side) {
          case 'py':
            faceVertex.pos[3 * 0 + 1] -= waterLevelAverages[3]
            faceVertex.pos[3 * 1 + 1] -= waterLevelAverages[0]
            faceVertex.pos[3 * 2 + 1] -= waterLevelAverages[2]
            faceVertex.pos[3 * 3 + 1] -= waterLevelAverages[2]
            faceVertex.pos[3 * 4 + 1] -= waterLevelAverages[0]
            faceVertex.pos[3 * 5 + 1] -= waterLevelAverages[1]
            break
          case 'nx':
            faceVertex.pos[3 * 2 + 1] -= waterLevelAverages[2]
            faceVertex.pos[3 * 3 + 1] -= waterLevelAverages[2]
            faceVertex.pos[3 * 5 + 1] -= waterLevelAverages[3]
            break
          case 'px':
            faceVertex.pos[3 * 2 + 1] -= waterLevelAverages[0]
            faceVertex.pos[3 * 3 + 1] -= waterLevelAverages[0]
            faceVertex.pos[3 * 5 + 1] -= waterLevelAverages[1]
            break
          case 'nz':
            faceVertex.pos[3 * 2 + 1] -= waterLevelAverages[3]
            faceVertex.pos[3 * 3 + 1] -= waterLevelAverages[3]
            faceVertex.pos[3 * 5 + 1] -= waterLevelAverages[0]
            break
          case 'pz':
            faceVertex.pos[3 * 2 + 1] -= waterLevelAverages[1]
            faceVertex.pos[3 * 3 + 1] -= waterLevelAverages[1]
            faceVertex.pos[3 * 5 + 1] -= waterLevelAverages[2]

            break
        }
        this.ambientOcclusion(block, pos, faceVertex, side)
        this.push(
          tVertexBuffer,
          VertexBuffer,
          faceVertex,
          this.chunkTerrain.getBlock(...pos).transparent
        )
      }
    }
  },
  grass: function (tVertexBuffer, VertexBuffer, pos) {
    const uv = this.getUV('grass')
    // prettier-ignore
    const faceVertex = {
      pos: [
        -0.4 + pos[0], -0.5 + pos[1], 0.4 + pos[2],
        0.4 + pos[0], -0.5 + pos[1], -0.4 + pos[2],
        -0.4 + pos[0], 0.4 + pos[1], 0.4 + pos[2],
        -0.4 + pos[0], 0.4 + pos[1], 0.4 + pos[2],
        0.4 + pos[0], -0.5 + pos[1], -0.4 + pos[2],
        0.4 + pos[0], 0.4 + pos[1], -0.4 + pos[2],

        -0.4 + pos[0], -0.5 + pos[1], -0.4 + pos[2],
        0.4 + pos[0], -0.5 + pos[1], 0.4 + pos[2],
        -0.4 + pos[0], 0.4 + pos[1], -0.4 + pos[2],
        -0.4 + pos[0], 0.4 + pos[1], -0.4 + pos[2],
        0.4 + pos[0], -0.5 + pos[1], 0.4 + pos[2],
        0.4 + pos[0], 0.4 + pos[1], 0.4 + pos[2],

        0.4 + pos[0], -0.5 + pos[1], -0.4 + pos[2],
        -0.4 + pos[0], -0.5 + pos[1], 0.4 + pos[2],
        -0.4 + pos[0], 0.4 + pos[1], 0.4 + pos[2],

        0.4 + pos[0], -0.5 + pos[1], -0.4 + pos[2],
        -0.4 + pos[0], 0.4 + pos[1], 0.4 + pos[2],
        0.4 + pos[0], 0.4 + pos[1], -0.4 + pos[2],

        0.4 + pos[0], -0.5 + pos[1], 0.4 + pos[2],
        -0.4 + pos[0], -0.5 + pos[1], -0.4 + pos[2],
        -0.4 + pos[0], 0.4 + pos[1], -0.4 + pos[2],

        0.4 + pos[0], -0.5 + pos[1], 0.4 + pos[2],
        -0.4 + pos[0], 0.4 + pos[1], -0.4 + pos[2],
        0.4 + pos[0], 0.4 + pos[1], 0.4 + pos[2]
      ],
      norm: [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
      ],
      uv: [
        ...uv[0],
        ...uv[2],
        ...uv[1],

        ...uv[1],
        ...uv[2],
        ...uv[3],

        ...uv[0],
        ...uv[2],
        ...uv[1],

        ...uv[1],
        ...uv[2],
        ...uv[3],

        ...uv[2],
        ...uv[0],
        ...uv[1],

        ...uv[2],
        ...uv[1],
        ...uv[3],

        ...uv[2],
        ...uv[0],
        ...uv[1],

        ...uv[2],
        ...uv[1],
        ...uv[3]
      ],
      color: [
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1,
        0.1, 1, 0.1
      ]
    }

    this.push(tVertexBuffer, VertexBuffer, faceVertex, true)
  },
  lava: function (tVertexBuffer, VertexBuffer, pos) {
    const block = this.chunkTerrain.getBlock(pos[0], pos[1], pos[2])
    const state = block.stateId

    // const falling = !!(state & 8);
    const level = (state & 0b001110) - 1
    if (level === 9) {
      for (const l in this.neighbours) {
        const offset = this.neighbours[l]
        if (
          this.chunkTerrain.getBlock(
            pos[0] + offset[0],
            pos[1] + offset[1],
            pos[2] + offset[2]
          ).name !== 'lava'
        ) { this.addFace(tVertexBuffer, VertexBuffer, l, pos) }
      }
    } else {
      for (const side in this.neighbours) {
        const offset = this.neighbours[side]
        if (
          this.chunkTerrain.getBlock(
            pos[0] + offset[0],
            pos[1] + offset[1],
            pos[2] + offset[2]
          ).name === 'lava'
        ) { continue }
        const faceVertex = this.genBlockFace(side, block, pos)
        const waterLevels = []
        for (let x = -1; x <= 1; x++) {
          for (let z = -1; z <= 1; z++) {
            const block = this.chunkTerrain.getBlock(
              pos[0] + x,
              pos[1],
              pos[2] + z
            )
            if (block.name === 'lava') {
              if ((block.stateId & 0b001110) - 1 === 10) { waterLevels.push(0) } else {
                waterLevels.push(
                  ((block.stateId & 0b001110) - 1) / 10
                )
              }
            } else if (block.boundingBox === 'block') { waterLevels.push(10) } else waterLevels.push(1)
          }
        }
        const waterLevelAverages = [
          Math.min(
            waterLevels[0],
            waterLevels[1],
            waterLevels[3],
            waterLevels[4]
          ),
          Math.min(
            waterLevels[1],
            waterLevels[2],
            waterLevels[4],
            waterLevels[5]
          ),
          Math.min(
            waterLevels[4],
            waterLevels[5],
            waterLevels[7],
            waterLevels[8]
          ),
          Math.min(
            waterLevels[3],
            waterLevels[4],
            waterLevels[6],
            waterLevels[7]
          )
        ]

        switch (side) {
          case 'py':
            faceVertex.pos[3 * 0 + 1] -= waterLevelAverages[3]
            faceVertex.pos[3 * 1 + 1] -= waterLevelAverages[0]
            faceVertex.pos[3 * 2 + 1] -= waterLevelAverages[2]
            faceVertex.pos[3 * 3 + 1] -= waterLevelAverages[2]
            faceVertex.pos[3 * 4 + 1] -= waterLevelAverages[0]
            faceVertex.pos[3 * 5 + 1] -= waterLevelAverages[1]
            break
          case 'nx':
            faceVertex.pos[3 * 2 + 1] -= waterLevelAverages[2]
            faceVertex.pos[3 * 3 + 1] -= waterLevelAverages[2]
            faceVertex.pos[3 * 5 + 1] -= waterLevelAverages[3]
            break
          case 'px':
            faceVertex.pos[3 * 2 + 1] -= waterLevelAverages[0]
            faceVertex.pos[3 * 3 + 1] -= waterLevelAverages[0]
            faceVertex.pos[3 * 5 + 1] -= waterLevelAverages[1]
            break
          case 'nz':
            faceVertex.pos[3 * 2 + 1] -= waterLevelAverages[3]
            faceVertex.pos[3 * 3 + 1] -= waterLevelAverages[3]
            faceVertex.pos[3 * 5 + 1] -= waterLevelAverages[0]
            break
          case 'pz':
            faceVertex.pos[3 * 2 + 1] -= waterLevelAverages[1]
            faceVertex.pos[3 * 3 + 1] -= waterLevelAverages[1]
            faceVertex.pos[3 * 5 + 1] -= waterLevelAverages[2]

            break
        }
        this.ambientOcclusion(block, pos, faceVertex, side)
        this.push(
          tVertexBuffer,
          VertexBuffer,
          faceVertex,
          this.chunkTerrain.getBlock(...pos).transparent
        )
      }
    }
  }
}

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
    const b = 16 / 1296
    const q = 48 / 1296
    const x1 = q * toxX + b
    const y1 = 1 - q * toxY - q + b
    const x2 = x1 + q - 2 * b
    const y2 = y1 + q - 2 * b
    return [
      [x1, y1],
      [x1, y2],
      [x2, y1],
      [x2, y2]
    ]
  }

  getUvForFace (block, type) {
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
        const mapka = {
          py: 'top',
          ny: 'bottom'
        }
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
    const b = 16 / 1296
    const q = 48 / 1296
    const x1 = q * toxX + b
    const y1 = 1 - q * toxY - q + b
    const x2 = x1 + q - 2 * b
    const y2 = y1 + q - 2 * b
    return [
      [x1, y1],
      [x1, y2],
      [x2, y1],
      [x2, y2]
    ]
  }

  genBlockFace (type, block, pos) {
    const uv = this.getUvForFace(block, type)
    // prettier-ignore
    switch (type) {
      case 'pz':
        return {
          pos: [
            -0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
            0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
            -0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2],
            -0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2],
            0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
            0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2]
          ],
          norm: [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
          ],
          uv: [
            ...uv[0],
            ...uv[2],
            ...uv[1],
            ...uv[1],
            ...uv[2],
            ...uv[3]
          ]
        }
      case 'nx':
        return {
          pos: [
            0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
            0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
            0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2],
            0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2],
            0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
            0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2]
          ],
          norm: [
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0
          ],
          uv: [
            ...uv[0],
            ...uv[2],
            ...uv[1],
            ...uv[1],
            ...uv[2],
            ...uv[3]
          ]
        }
      case 'nz':
        return {
          pos: [
            0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
            -0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
            0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
            0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
            -0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
            -0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2]
          ],
          norm: [
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1
          ],
          uv: [
            ...uv[0],
            ...uv[2],
            ...uv[1],
            ...uv[1],
            ...uv[2],
            ...uv[3]
          ]
        }
      case 'px':
        return {
          pos: [
            -0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
            -0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
            -0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
            -0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
            -0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
            -0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2]
          ],
          norm: [
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0
          ],
          uv: [
            ...uv[0],
            ...uv[2],
            ...uv[1],
            ...uv[1],
            ...uv[2],
            ...uv[3]
          ]
        }
      case 'py':
        return {
          pos: [
            0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
            -0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
            0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2],
            0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2],
            -0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
            -0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2]
          ],
          norm: [
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
          ],
          uv: [
            ...uv[0],
            ...uv[2],
            ...uv[1],
            ...uv[1],
            ...uv[2],
            ...uv[3]
          ]
        }
      case 'ny':
        return {
          pos: [
            0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
            -0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
            0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
            0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
            -0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
            -0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2]
          ],
          norm: [
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0
          ],
          uv: [
            ...uv[0],
            ...uv[2],
            ...uv[1],
            ...uv[1],
            ...uv[2],
            ...uv[3]
          ]
        }
    }
  }

  addFace (tVertexBuffer, VertexBuffer, type, pos) {
    const block = this.chunkTerrain.getBlock(...pos)
    const faceVertex = this.genBlockFace(type, block, pos)
    this.ambientOcclusion(block, pos, faceVertex, type)
    this.push(
      tVertexBuffer,
      VertexBuffer,
      faceVertex,
      this.chunkTerrain.getBlock(...pos).transparent
    )
  }

  ambientOcclusion (block, pos, faceVertex, type) {
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
    let col1 = this.aoColor(0)
    let col2 = this.aoColor(0)
    let col3 = this.aoColor(0)
    let col4 = this.aoColor(0)
    if (type === 'py') {
      col1 = this.aoColor(
        loaded['1:1:-1'] + loaded['0:1:-1'] + loaded['1:1:0']
      )
      col2 = this.aoColor(
        loaded['1:1:1'] + loaded['0:1:1'] + loaded['1:1:0']
      )
      col3 = this.aoColor(
        loaded['-1:1:-1'] + loaded['0:1:-1'] + loaded['-1:1:0']
      )
      col4 = this.aoColor(
        loaded['-1:1:1'] + loaded['0:1:1'] + loaded['-1:1:0']
      )
    }
    if (type === 'ny') {
      col2 = this.aoColor(
        loaded['1:-1:-1'] + loaded['0:-1:-1'] + loaded['1:-1:0']
      )
      col1 = this.aoColor(
        loaded['1:-1:1'] + loaded['0:-1:1'] + loaded['1:-1:0']
      )
      col4 = this.aoColor(
        loaded['-1:-1:-1'] + loaded['0:-1:-1'] + loaded['-1:-1:0']
      )
      col3 = this.aoColor(
        loaded['-1:-1:1'] + loaded['0:-1:1'] + loaded['-1:-1:0']
      )
    }
    if (type === 'px') {
      col1 = this.aoColor(
        loaded['-1:-1:0'] + loaded['-1:-1:-1'] + loaded['-1:0:-1']
      )
      col2 = this.aoColor(
        loaded['-1:1:0'] + loaded['-1:1:-1'] + loaded['-1:0:-1']
      )
      col3 = this.aoColor(
        loaded['-1:-1:0'] + loaded['-1:-1:1'] + loaded['-1:0:1']
      )
      col4 = this.aoColor(
        loaded['-1:1:0'] + loaded['-1:1:1'] + loaded['-1:0:1']
      )
    }
    if (type === 'nx') {
      col3 = this.aoColor(
        loaded['1:-1:0'] + loaded['1:-1:-1'] + loaded['1:0:-1']
      )
      col4 = this.aoColor(
        loaded['1:1:0'] + loaded['1:1:-1'] + loaded['1:0:-1']
      )
      col1 = this.aoColor(
        loaded['1:-1:0'] + loaded['1:-1:1'] + loaded['1:0:1']
      )
      col2 = this.aoColor(
        loaded['1:1:0'] + loaded['1:1:1'] + loaded['1:0:1']
      )
    }
    if (type === 'pz') {
      col1 = this.aoColor(
        loaded['0:-1:1'] + loaded['-1:-1:1'] + loaded['-1:0:1']
      )
      col2 = this.aoColor(
        loaded['0:1:1'] + loaded['-1:1:1'] + loaded['-1:0:1']
      )
      col3 = this.aoColor(
        loaded['0:-1:1'] + loaded['1:-1:1'] + loaded['1:0:1']
      )
      col4 = this.aoColor(
        loaded['0:1:1'] + loaded['1:1:1'] + loaded['1:0:1']
      )
    }
    if (type === 'nz') {
      col3 = this.aoColor(
        loaded['0:-1:-1'] + loaded['-1:-1:-1'] + loaded['-1:0:-1']
      )
      col4 = this.aoColor(
        loaded['0:1:-1'] + loaded['-1:1:-1'] + loaded['-1:0:-1']
      )
      col1 = this.aoColor(
        loaded['0:-1:-1'] + loaded['1:-1:-1'] + loaded['1:0:-1']
      )
      col2 = this.aoColor(
        loaded['0:1:-1'] + loaded['1:1:-1'] + loaded['1:0:-1']
      )
    }
    const ile = 4
    if (block.name === 'water') {
      col1[0] /= ile
      col1[1] /= ile
      col2[0] /= ile
      col2[1] /= ile
      col3[0] /= ile
      col3[1] /= ile
      col4[0] /= ile
      col4[1] /= ile
    } else if (block.name === 'grass_block' && type === 'py') {
      col1[0] /= ile
      col1[2] /= ile
      col2[0] /= ile
      col2[2] /= ile
      col3[0] /= ile
      col3[2] /= ile
      col4[0] /= ile
      col4[2] /= ile
    } else if (block.name.includes('leaves')) {
      col1[0] /= ile
      col1[2] /= ile
      col2[0] /= ile
      col2[2] /= ile
      col3[0] /= ile
      col3[2] /= ile
      col4[0] /= ile
      col4[2] /= ile
    }

    faceVertex.color = [
      ...col1,
      ...col3,
      ...col2,
      ...col2,
      ...col3,
      ...col4
    ]
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
    if (type === 0) {
      return [0.9, 0.9, 0.9]
    } else if (type === 1) {
      return [0.7, 0.7, 0.7]
    } else if (type === 2) {
      return [0.5, 0.5, 0.5]
    } else {
      return [0.3, 0.3, 0.3]
    }
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
              if (mainBlock.transparent) {
                if (nBlock.boundingBox !== 'block') {
                  this.addFace(tVertexBuffer, VertexBuffer, side, pos)
                }
              } else {
                if (
                  nBlock.boundingBox !== 'block' ||
                                    nBlock.transparent
                ) {
                  this.addFace(tVertexBuffer, VertexBuffer, side, pos)
                }
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

    VertexBuffer.positions.push(...tVertexBuffer.positions)
    VertexBuffer.normals.push(...tVertexBuffer.normals)
    VertexBuffer.uvs.push(...tVertexBuffer.uvs)
    VertexBuffer.colors.push(...tVertexBuffer.colors)
    return VertexBuffer
  }
}

export { ChunkMesher }
