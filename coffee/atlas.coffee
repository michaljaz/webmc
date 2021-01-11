path=require "path"
fs=require "fs"
Canvas=require "canvas"
createCanvas=Canvas.createCanvas
loadImage=Canvas.loadImage
Image=Canvas.Image

toxelX=1
toxelY=1
miniX=1
miniY=1
totalImages=694
loadedImages=0
atlasSize=36
miniAtlasSize=27

path1=__dirname+"/client/assets/blocks/blocksAtlas-full.png"
path2=__dirname+"/client/assets/blocks/blocksMapping-full.json"
path3=__dirname+"/client/assets/blocks/blocksMapping.json"



canvas=createCanvas atlasSize*16,atlasSize*16
ctx=canvas.getContext '2d'

images={}
textureMapping={}
miniMapping={}

firstLoad=->
    folderName="client/assets/blocks/images"
    directoryPath=__dirname+"/"+folderName
    fs.readdir directoryPath, (err, files)->
        files.forEach (file)->
            filePath="#{__dirname}/#{folderName}/#{file}"
            if path.extname(file) is ".png"
                addImageToLoad filePath,file
            return
        return
    return
addImageToLoad=(filePath,name)->
    img=new Image
    img.onload=->
        images[name]=img
        loadedImages++
        if loadedImages is totalImages
            forEachToxel()
    img.src=filePath
forEachToxel=->
    Object.keys(images).forEach (name)->
        img=images[name]
        addToxelToAtlas img,name
    updateAtlas()
addToxelToAtlas=(img,name)->
    w=img.width/16
    h=img.height/16
    if w>1 or h>1
        for i in [0..w-1]
            for j in [0..h-1]
                ctx.drawImage img,i*16,j*16,16,16,(toxelX-1)*16, (toxelY-1)*16, 16,16
                textureMapping[name.substr(0,name.length-4)+"@#{i}@#{j}"]={x:toxelX,y:toxelY}
                moveToxel()
    else
        ctx.drawImage img, (toxelX-1)*16, (toxelY-1)*16, 16,16
        textureMapping[name.substr(0,name.length-4)]={x:toxelX,y:toxelY}
        moveToxel()
    miniMapping[name.substr(0,name.length-4)]={x:miniX,y:miniY}
    if miniX is miniAtlasSize
        miniX=1
        miniY+=1
    else
        miniX+=1
moveToxel=->
    if toxelX is atlasSize
        toxelX=1
        toxelY+=1
    else
        toxelX+=1
updateAtlas=(path)->
    fs.writeFileSync path1, canvas.toBuffer('image/png')
    console.log "\x1b[33mSAVING: #{path1}"

    fs.writeFileSync path2,JSON.stringify(textureMapping,null,2)
    console.log "\x1b[33mSAVING: #{path2}"

    fs.writeFileSync path3,JSON.stringify(miniMapping,null,2)
    console.log "\x1b[33mSAVING: #{path3}"

    console.log "\x1b[32mSuccessfully created #{canvas.width}x#{canvas.height} Texture Atlas!\n"

firstLoad()
