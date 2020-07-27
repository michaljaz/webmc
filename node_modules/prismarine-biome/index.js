module.exports = loader

let biomes

function loader (mcVersion) {
  biomes = require('minecraft-data')(mcVersion).biomes
  return Biome
}

const emptyBiome = {
  color: 0,
  height: null,
  name: '',
  rainfall: 0,
  temperature: 0
}

function Biome (id) {
  return biomes[id] || {...emptyBiome, id}
}
