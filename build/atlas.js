const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas')
const Canvas = require('canvas');
const Image = Canvas.Image

var toxelX=1;
var toxelY=1;
var miniX=1;
var miniY=1;
var totalImages=694;
var loadedImages=0;
var atlasSize=36
var miniAtlasSize=27

var path1=path.join(__dirname, "../client/assets/blocks/blocksAtlas-full.png");
var path2=path.join(__dirname, "../client/assets/blocks/blocksMapping-full.json");
var path3=path.join(__dirname, "../client/assets/blocks/blocksMapping.json");

firstLoad()

const canvas = createCanvas(atlasSize*16, atlasSize*16)
const ctx = canvas.getContext('2d')

var images={
}
var textureMapping={
}
var miniMapping={
}


function NWD(a,b){
    if(b!=0){
        return NWD(b,a%b);
    }
    return a;
}
function NWW(a,b){
    return a*b/NWD(a,b)
}
function firstLoad(){
    folderName="../client/assets/blocks/images";
    const directoryPath = path.join(__dirname, folderName);
    fs.readdir(directoryPath, function (err, files) {
        files.forEach(function (file) {
            filePath=`${__dirname}/${folderName}/${file}`
            if(path.extname(file)==".png"){
                addImageToLoad(filePath,file)
            }
        });
    });
}
function addImageToLoad(filePath,name){
    var img=new Image;
    img.onload=function (){
        images[name]=img;
        loadedImages++;
        if(loadedImages==totalImages){
            forEachToxel()
        }
    }
    img.src=filePath;
}
function forEachToxel(){
    Object.keys(images).forEach(function (name){
        var img=images[name];
        addToxelToAtlas(img,name) 
    })
    updateAtlas()
    
}
function addToxelToAtlas(img,name){
    // console.log(name)
    var w=img.width/16
    var h=img.height/16
    if(w>1 || h>1){
        for(var i=0;i<w;i++){
            for(var j=0;j<h;j++){
                ctx.drawImage(img,i*16,j*16,16,16,(toxelX-1)*16, (toxelY-1)*16, 16,16)
                textureMapping[name.substr(0,name.length-4)+`@${i}@${j}`]={x:toxelX,y:toxelY};
                moveToxel()
            }
        }
        
    }else{
        ctx.drawImage(img, (toxelX-1)*16, (toxelY-1)*16, 16,16);
        textureMapping[name.substr(0,name.length-4)]={x:toxelX,y:toxelY};
        moveToxel()
    }
    miniMapping[name.substr(0,name.length-4)]={x:miniX,y:miniY}
    if(miniX==miniAtlasSize){
        miniX=1;
        miniY+=1
    }else{
        miniX+=1;
    }

}
function moveToxel(){
    if(toxelX==atlasSize){
        toxelX=1;
        toxelY+=1
    }else{
        toxelX+=1;
    }
    // console.log(toxelX,toxelY)
}
function updateAtlas(path){
    fs.writeFileSync(path1, canvas.toBuffer('image/png'))
    console.log(`\x1b[33mSAVING: ${path1}`)

    fs.writeFileSync(path2,JSON.stringify(textureMapping,null,2));
    console.log(`\x1b[33mSAVING: ${path2}`)

    fs.writeFileSync(path3,JSON.stringify(miniMapping,null,2));
    console.log(`\x1b[33mSAVING: ${path3}`)

    console.log(`\x1b[32mSuccessfully created ${canvas.width}x${canvas.height} Texture Atlas!\n`)
}
