try {
  const decompress = require('decompress')
  const path = require('path')

  decompress(
    path.join(__dirname, '../assets/pack.zip'),
    path.join(__dirname, '../assets/pack')
  )
} catch (e) {}
