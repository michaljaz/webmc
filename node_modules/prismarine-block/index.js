module.exports = loader

function loader (mcVersion) {
  const mcData = require('minecraft-data')(mcVersion)
  return provider({
    Biome: require('prismarine-biome')(mcVersion),
    blocks: mcData.blocks,
    blocksByStateId: mcData.blocksByStateId,
    toolMultipliers: mcData.materials,
    shapes: mcData.blockCollisionShapes,
    majorVersion: mcData.version.majorVersion,
    effectsByName: mcData.effectsByName
  })
}

function provider ({ Biome, blocks, blocksByStateId, toolMultipliers, shapes, majorVersion, effectsByName }) {
  Block.fromStateId = function (stateId, biomeId) {
    if (majorVersion === '1.8' || majorVersion === '1.9' || majorVersion === '1.10' || majorVersion === '1.11' ||
    majorVersion === '1.12') {
      return new Block(stateId >> 4, biomeId, stateId & 15)
    } else {
      return new Block(undefined, biomeId, 0, stateId)
    }
  }

  if (shapes) {
    // Prepare block shapes
    for (const id in blocks) {
      const block = blocks[id]
      const shapesId = shapes.blocks[block.name]
      block.shapes = (shapesId instanceof Array) ? shapes.shapes[shapesId[0]] : shapes.shapes[shapesId]
      if ('states' in block) { // post 1.13
        if (shapesId instanceof Array) {
          block.stateShapes = []
          for (const i in shapesId) {
            block.stateShapes.push(shapes.shapes[shapesId[i]])
          }
        }
      } else { // pre 1.13
        if ('variations' in block) {
          for (const i in block.variations) {
            const metadata = block.variations[i].metadata
            if (shapesId instanceof Array) {
              block.variations[i].shapes = shapes.shapes[shapesId[metadata]]
            } else {
              block.variations[i].shapes = shapes.shapes[shapesId]
            }
          }
        }
      }
    }
  }

  function Block (type, biomeId, metadata, stateId) {
    this.type = type
    this.metadata = metadata
    this.light = 0
    this.skyLight = 0
    this.biome = new Biome(biomeId)
    this.position = null
    this.stateId = stateId

    const blockEnum = stateId === undefined ? blocks[type] : blocksByStateId[stateId]
    if (blockEnum) {
      if (stateId === undefined) {
        this.stateId = blockEnum.minStateId
      } else {
        this.metadata = this.stateId - blockEnum.minStateId
      }
      this.type = blockEnum.id
      this.name = blockEnum.name
      this.hardness = blockEnum.hardness
      this.displayName = blockEnum.displayName
      this.shapes = blockEnum.shapes
      if ('stateShapes' in blockEnum) {
        this.shapes = blockEnum.stateShapes[this.metadata]
      } else if ('variations' in blockEnum) {
        const variations = blockEnum.variations
        for (const i in variations) {
          if (variations[i].metadata === metadata) {
            this.displayName = variations[i].displayName
            this.shapes = variations[i].shapes
          }
        }
      }
      this.boundingBox = blockEnum.boundingBox
      this.transparent = blockEnum.transparent
      this.diggable = blockEnum.diggable
      this.material = blockEnum.material
      this.harvestTools = blockEnum.harvestTools
      this.drops = blockEnum.drops
    } else {
      this.name = ''
      this.displayName = ''
      this.shapes = []
      this.hardness = 0
      this.boundingBox = 'empty'
      this.transparent = true
      this.diggable = false
    }
  }

  function propValue (state, value) {
    if (state.type === 'enum') return state.values[value]
    if (state.type === 'bool') return !value
    return value
  }

  Block.prototype.getProperties = function () {
    const properties = {}
    const blockEnum = this.stateId === undefined ? blocks[this.type] : blocksByStateId[this.stateId]
    if (blockEnum && blockEnum.states) {
      let data = this.metadata
      for (let i = blockEnum.states.length - 1; i >= 0; i--) {
        const prop = blockEnum.states[i]
        properties[prop.name] = propValue(prop, data % prop.num_values)
        data = Math.floor(data / prop.num_values)
      }
    }
    return properties
  }

  Block.prototype.canHarvest = function (heldItemType) {
    if (!this.harvestTools) { return true }; // for blocks harvestable by hand
    return heldItemType && this.harvestTools && this.harvestTools[heldItemType]
  }

  function effectLevel (effect, effects) {
    const e = effects[effectsByName[effect]]
    return e ? e.amplifier : -1
  }

  function enchantmentLevel (enchantment, enchantments) {
    for (const e of enchantments) {
      if (e.id.includes(enchantment)) {
        return e.lvl
      }
    }
    return -1
  }

  // http://minecraft.gamepedia.com/Breaking#Calculation
  Block.prototype.digTime = function (heldItemType, creative, inWater, notOnGround, enchantments = [], effects = {}) {
    if (creative) return 0

    const canHarvest = this.canHarvest(heldItemType)
    const materialToolMultipliers = toolMultipliers[this.material]
    const isBestTool = heldItemType && materialToolMultipliers && materialToolMultipliers[heldItemType]

    let time = this.hardness * 1000 // convert to ms
    if (canHarvest) {
      time *= 1.5
    } else {
      time *= 5
    }

    let speedMultiplier = 1
    if (isBestTool) {
      speedMultiplier = materialToolMultipliers[heldItemType]
      const efficiencyLevel = enchantmentLevel('efficiency', enchantments)
      if (efficiencyLevel >= 0 && canHarvest) {
        speedMultiplier += efficiencyLevel * efficiencyLevel + 1
      }
      const hasteLevel = effectLevel('Haste', effects)
      if (hasteLevel >= 0) {
        speedMultiplier *= 1 + (0.2 * hasteLevel)
      }
      const miningFatigueLevel = effectLevel('MiningFatigue', effects)
      if (miningFatigueLevel >= 0) {
        speedMultiplier /= Math.pow(3, miningFatigueLevel)
      }
    }
    time /= speedMultiplier

    if (inWater) time *= 5
    if (notOnGround) time *= 5

    // The total time to break a block is always a multiple of 1 game tick;
    // any remainder is rounded up to the next tick.
    time = Math.ceil(time / 50) * 50

    return time
  }

  return Block
}
