class BlockGeo
  constructor:(options)->
    @toxelSize=options.toxelSize
    @q=1/@toxelSize
    @blocksMapping=options.blocksMapping
  getToxel:(x,y)->
    x-=1
    y-=1
    x1=@q*x
    y1=1-@q*y-@q
    x2=@q*x+@q
    y2=1-@q*y
    return [
      [x1,y1]
      [x1,y2]
      [x2,y1]
      [x2,y2]
    ]
  genBlockFace: (type,block,pos)->
    if block.name is "water"
      toxX=@blocksMapping["water_flow"]["x"]
      toxY=@blocksMapping["water_flow"]["y"]
    else if @blocksMapping[block.name]
      toxX=@blocksMapping[block.name]["x"]
      toxY=@blocksMapping[block.name]["y"]
    else
      toxX=@blocksMapping["debug"]["x"]
      toxY=28-@blocksMapping["debug"]["y"]
    uv=@getToxel toxX,toxY
    switch type
      when "pz"
        return {
          pos:[-0.5+pos[0], -0.5+pos[1],  0.5+pos[2],0.5+pos[0], -0.5+pos[1],  0.5+pos[2],-0.5+pos[0],  0.5+pos[1],  0.5+pos[2],-0.5+pos[0],  0.5+pos[1],  0.5+pos[2],0.5+pos[0], -0.5+pos[1],  0.5+pos[2],0.5+pos[0],  0.5+pos[1],  0.5+pos[2]]
          norm:[0,  0,  1,0,  0,  1,0,  0,  1,0,  0,  1,0,  0,  1,0,  0,  1]
          uv:[uv[0]...,uv[2]...,uv[1]...,uv[1]...,uv[2]...,uv[3]...]
        }
      when "nx"
        return {
          pos:[ 0.5+pos[0], -0.5+pos[1],  0.5+pos[2], 0.5+pos[0], -0.5+pos[1], -0.5+pos[2],0.5+pos[0],  0.5+pos[1],  0.5+pos[2], 0.5+pos[0],  0.5+pos[1],  0.5+pos[2],0.5+pos[0], -0.5+pos[1], -0.5+pos[2], 0.5+pos[0],  0.5+pos[1], -0.5+pos[2]]
          norm:[ 1,  0,  0, 1,  0,  0, 1,  0,  0, 1,  0,  0, 1,  0,  0, 1,  0,  0]
          uv:[uv[0]...,uv[2]...,uv[1]...,uv[1]...,uv[2]...,uv[3]...]
        }
      when "nz"
        return {
          pos:[ 0.5+pos[0], -0.5+pos[1], -0.5+pos[2],-0.5+pos[0], -0.5+pos[1], -0.5+pos[2],0.5+pos[0],  0.5+pos[1], -0.5+pos[2], 0.5+pos[0],  0.5+pos[1], -0.5+pos[2],-0.5+pos[0], -0.5+pos[1], -0.5+pos[2],-0.5+pos[0],  0.5+pos[1], -0.5+pos[2]]
          norm:[ 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1]
          uv:[uv[0]...,uv[2]...,uv[1]...,uv[1]...,uv[2]...,uv[3]...]
        }
      when "px"
        return {
          pos:[-0.5+pos[0], -0.5+pos[1], -0.5+pos[2],-0.5+pos[0], -0.5+pos[1],  0.5+pos[2],-0.5+pos[0],  0.5+pos[1], -0.5+pos[2],-0.5+pos[0],  0.5+pos[1], -0.5+pos[2],-0.5+pos[0], -0.5+pos[1],  0.5+pos[2],-0.5+pos[0],  0.5+pos[1],  0.5+pos[2]]
          norm:[-1,  0,  0,-1,  0,  0,-1,  0,  0,-1,  0,  0,-1,  0,  0,-1,  0,  0]
          uv:[uv[0]...,uv[2]...,uv[1]...,uv[1]...,uv[2]...,uv[3]...]
        }
      when "py"
        return {
          pos:[ 0.5+pos[0],  0.5+pos[1], -0.5+pos[2],-0.5+pos[0],  0.5+pos[1], -0.5+pos[2],0.5+pos[0],  0.5+pos[1],  0.5+pos[2], 0.5+pos[0],  0.5+pos[1],  0.5+pos[2],-0.5+pos[0],  0.5+pos[1], -0.5+pos[2],-0.5+pos[0],  0.5+pos[1],  0.5+pos[2]]
          norm:[ 0,  1,  0, 0,  1,  0, 0,  1,  0, 0,  1,  0, 0,  1,  0, 0,  1,  0]
          uv:[uv[0]...,uv[2]...,uv[1]...,uv[1]...,uv[2]...,uv[3]...]
        }
      when "ny"
        return {
          pos:[ 0.5+pos[0], -0.5+pos[1],  0.5+pos[2],-0.5+pos[0], -0.5+pos[1],  0.5+pos[2],0.5+pos[0], -0.5+pos[1], -0.5+pos[2], 0.5+pos[0], -0.5+pos[1], -0.5+pos[2],-0.5+pos[0], -0.5+pos[1],  0.5+pos[2],-0.5+pos[0], -0.5+pos[1], -0.5+pos[2]]
          norm:[ 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,  0]
          uv:[uv[0]...,uv[2]...,uv[1]...,uv[1]...,uv[2]...,uv[3]...]
        }

export {BlockGeo}
