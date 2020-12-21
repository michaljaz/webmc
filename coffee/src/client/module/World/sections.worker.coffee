
console.log "SECTIONS WORKER STARTED!"

class BitArray
  constructor: (options)->
    if options is null
      return
    if not options.bitsPerValue > 0
      console.error 'bits per value must at least 1'
    if not (options.bitsPerValue <= 32)
      console.error 'bits per value exceeds 32'
    valuesPerLong = Math.floor 64 / options.bitsPerValue
    length = Math.ceil(options.capacity / valuesPerLong)
    if not options.data
      options.data = Array(length * 2).fill(0)
    valueMask = (1 << options.bitsPerValue) - 1

    @data = options.data
    @capacity = options.capacity
    @bitsPerValue = options.bitsPerValue
    @valuesPerLong = valuesPerLong
    @valueMask = valueMask
    return
  get:(index)->
    if not (index >= 0 && index < @capacity)
      console.error 'index is out of bounds'
    startLongIndex = Math.floor index / @valuesPerLong
    indexInLong = (index - startLongIndex * @valuesPerLong) * @bitsPerValue
    if indexInLong >= 32
      indexInStartLong = indexInLong - 32
      startLong = @data[startLongIndex * 2 + 1]
      return (startLong >>> indexInStartLong) & @valueMask
    startLong = @data[startLongIndex * 2]
    indexInStartLong = indexInLong
    result = startLong >>> indexInStartLong
    endBitOffset = indexInStartLong + @bitsPerValue
    if endBitOffset > 32
      endLong = @data[startLongIndex * 2 + 1]
      result |= endLong << (32 - indexInStartLong)
    return result & @valueMask

class ChunkDecoder
  getBlockIndex: (pos)->
    return (pos.y << 8) | (pos.z << 4) | pos.x
  cvo: (voxelX,voxelY,voxelZ) ->
    x=voxelX %% 16|0
    y=voxelY %% 16|0
    z=voxelZ %% 16|0
    return y*16*16+z*16+x
  computeSections: (packet)->
    sections=packet.sections
    num=0
    result=[]
    for i in sections
      num+=1
      if i isnt null
        solidBlockCount=i.solidBlockCount
        palette=i.palette
        data=new BitArray i.data
        pos={
          x:0
          y:0
          z:0
        }
        cell=new Uint32Array 16*16*16
        for x in [0..15]
          for y in [0..15]
            for z in [0..15]
              cell[@cvo(x,y,z)]=palette[data.get(@getBlockIndex({x,y,z}))]
        result.push {
          x:packet.x
          y:num
          z:packet.z
          cell
        }
      else
        result.push(null)
    return result

addEventListener "message", (e)->
	fn = handlers[e.data.type]
	if not fn
		throw new Error('no handler for type: ' + e.data.type)
	fn(e.data.data)
	return

cd=new ChunkDecoder

handlers={
  computeSections:(data)->
    postMessage {
      result:cd.computeSections data
    }
}
