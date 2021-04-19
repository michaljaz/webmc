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
        const col = this.ambientOcclusion(block, pos, side)
        faceVertex.color = [
          ...col[0],
          ...col[2],
          ...col[1],
          ...col[1],
          ...col[2],
          ...col[3]
        ]
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
        this.ambientOcclusion(block, pos, side)
        const col = this.ambientOcclusion(block, pos, side)
        faceVertex.color = [
          ...col[0],
          ...col[2],
          ...col[1],
          ...col[1],
          ...col[2],
          ...col[3]
        ]
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

export { CustomRender }
