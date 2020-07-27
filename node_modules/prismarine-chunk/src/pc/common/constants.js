// height in blocks of a chunk column
const CHUNK_HEIGHT = 256

// width in blocks of a chunk column
const CHUNK_WIDTH = 16

// height in blocks of a chunk section
const SECTION_HEIGHT = 16

// width in blocks of a chunk section
const SECTION_WIDTH = 16

// volume in blocks of a chunk section
const SECTION_VOLUME = SECTION_HEIGHT * SECTION_WIDTH * SECTION_WIDTH

// number of chunk sections in a chunk column
const NUM_SECTIONS = 16

// maximum number of bits per block allowed when using the section palette.
// values above will switch to global palette
const MAX_BITS_PER_BLOCK = 8

// number of bits used for each block in the global palette.
// this value should not be hardcoded according to wiki.vg
const GLOBAL_BITS_PER_BLOCK = 14

module.exports = {
  CHUNK_HEIGHT,
  CHUNK_WIDTH,
  SECTION_HEIGHT,
  SECTION_WIDTH: CHUNK_WIDTH,
  SECTION_VOLUME,
  NUM_SECTIONS,
  MAX_BITS_PER_BLOCK,
  GLOBAL_BITS_PER_BLOCK
}
