const decompress = require('decompress')
const path = require('path')

decompress(
  path.join(__dirname, '../assets/pack.zip'),
  path.join(__dirname, '../assets/pack')
).then(() => {
  console.log('done!')
})
const decompressTarxz = require('decompress-tarxz');

(async () => {
  await decompress(
    path.join(__dirname, '../assets/mineflayer.tar.xz'),
    path.join(__dirname, '../src/assets'),
    {
      plugins: [decompressTarxz()]
    }
  )

  console.log('Files decompressed')
})()
