const decompress = require('decompress')
const decompressTarxz = require('decompress-tarxz')
const path = require('path')

decompress(
  path.join(__dirname, '../assets/pack.zip'),
  path.join(__dirname, '../assets/pack')
)

decompress(
  path.join(__dirname, '../assets/mineflayer.tar.xz'),
  path.join(__dirname, '../src/assets'),
  {
    plugins: [decompressTarxz()]
  }
)
