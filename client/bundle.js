
import * as THREE from './module/build/three.module.js';
import {SkeletonUtils} from './module/jsm/utils/SkeletonUtils.js';
import {FBXLoader} from './module/jsm/loaders/FBXLoader.js';
import Stats from './module/jsm/libs/stats.module.js';
import {BufferGeometryUtils} from './module/jsm/utils/BufferGeometryUtils.js'

var canvas,renderer,scene,camera,stats,raycaster,
  gameState,cube,FPC,socket,
  playerObject,materials,parameters,terrain;


var Tools={
  uuidv4:function (){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
     });
  }
}

class AssetLoader{
  constructor(options){
    this.assets={}
  }
  load(assets,callback,_this){
    var textureLoader = new THREE.TextureLoader();
    var fbxl = new FBXLoader();
    var assetsNumber=0;
    var assetsLoaded=0;

    Object.keys(assets).forEach(function (p){
      assetsNumber++;
    })
    Object.keys(assets).forEach(function (p){

      var type=assets[p].type;
      var path=assets[p].path;
      var dynamic=assets[p].dynamic;
      if(dynamic){
        path+="?"+Tools.uuidv4()
      }
      if(type=="texture"){
        textureLoader.load(path,function (texture){
          _this.assets[p]=texture
          assetsLoaded++;
          if(assetsLoaded==assetsNumber){
            callback()
          }
        })
      }
      if(type=="text"){
        $.get(path,function (data){
          _this.assets[p]=data
          assetsLoaded++;
          if(assetsLoaded==assetsNumber){
            callback()
          }
        })
      }
      if(type=="image"){
        var img = new Image;
        img.onload=function (){
          _this.assets[p]=img
          assetsLoaded++;
          if(assetsLoaded==assetsNumber){
            callback()
          }
        }
        img.src=path;
      }
      if(type=="fbx"){
        fbxl.load(path,function (fbx){
          _this.assets[p]=fbx
          assetsLoaded++;
          if(assetsLoaded==assetsNumber){
            callback()
          }
        })
      }
    })
    return this;
  }
  get(assetName){
    return this.assets[assetName]
  }
}

class FirstPersonControls {
  constructor(options) {
    this.kc = {
      "w": 87,
      "s": 83,
      "a": 65,
      "d": 68,
      "space": 32,
      "shift": 16
    };
    this.keys = {}
    this.canvas = options.canvas
    this.camera = options.camera;
    this.micromove = options.micromove
  }
  ac(qx, qy, qa, qf) {
    var m_x = -Math.sin(qa) * qf;
    var m_y = -Math.cos(qa) * qf;
    var r_x = qx - m_x;
    var r_y = qy - m_y;
    return {
      x: r_x,
      y: r_y
    };
  }
  degtorad(deg) {
    return deg * Math.PI / 180;
  }
  radtodeg(rad) {
    return rad * 180 / Math.PI;
  }
  camMicroMove() {
    if (this.keys[this.kc["w"]]) {
      this.camera.position.x = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y + this.degtorad(180), this.micromove).x;
      this.camera.position.z = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y + this.degtorad(180), this.micromove).y;
    }
    if (this.keys[this.kc["s"]]) {
      this.camera.position.x = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y, this.micromove).x;
      this.camera.position.z = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y, this.micromove).y;
    }
    if (this.keys[this.kc["a"]]) {
      this.camera.position.x = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y - this.degtorad(90), this.micromove).x;
      this.camera.position.z = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y - this.degtorad(90), this.micromove).y;
    }
    if (this.keys[this.kc["d"]]) {
      this.camera.position.x = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y + this.degtorad(90), this.micromove).x;
      this.camera.position.z = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y + this.degtorad(90), this.micromove).y;
    }
    if (this.keys[this.kc["space"]]) {
      this.camera.position.y += this.micromove;
    }
    if (this.keys[this.kc["shift"]]) {
      this.camera.position.y -= this.micromove;
    }
  }
  lockPointer() {
    this.canvas.requestPointerLock()
  }
}

class TextureAtlasCreator {
  constructor(options){
    this.textureX=options.textureX;
    this.textureMapping=options.textureMapping
    this.size=36
    this.willSize=27
  }
  gen(tick){
    const {textureX,textureMapping,size,willSize} = this;
    var multi={}
    for(var i in textureMapping){
      if(i.includes("@")){
        var xd=this.decodeName(i);
        if(multi[xd.pref]==undefined){
          multi[xd.pref]=xd;
        }else{
          multi[xd.pref].x=Math.max(multi[xd.pref].x,xd.x)
          multi[xd.pref].y=Math.max(multi[xd.pref].y,xd.y)
        }
        // console.log(xd)
      }
    }

    var canvas = document.createElement('canvas');
    var ctx=canvas.getContext("2d")
    canvas.width=willSize*16
    canvas.height=willSize*16

    var toxelX=1;
    var toxelY=1;


    for(var i in textureMapping){
      if(i.includes("@")){
        var xd=this.decodeName(i);
        if(multi[xd.pref].loaded==undefined){
          multi[xd.pref].loaded=true
          //add toxel to canvas

          var lol=this.getToxelForTick(tick,multi[xd.pref].x+1,multi[xd.pref].y+1)

          var texmap=textureMapping[`${xd.pref}@${lol.col}@${lol.row}`]
          // console.log(`${xd.pref}@${lol.col}@${lol.row}`)
          ctx.drawImage(textureX,(texmap.x-1)*16,(texmap.y-1)*16,16,16,(toxelX-1)*16,(toxelY-1)*16,16,16)

          toxelX++;
          if(toxelX>willSize){
            toxelX=1;
            toxelY++;
          }
        }
      }else{
        //add toxel to canvas
        ctx.drawImage(textureX,(textureMapping[i].x-1)*16,(textureMapping[i].y-1)*16,16,16,(toxelX-1)*16,(toxelY-1)*16,16,16)

        toxelX++;
        if(toxelX>willSize){
          toxelX=1;
          toxelY++;
        }
      }
    }
    // console.log(canvas.toDataURL())
    return canvas
  }
  decodeName(i){
    var m=null;
    for(var j=0;j<i.length;j++){
      if(i[j]=="@"){
        m=j;
        break;
      }
    }
    var pref=i.substr(0,m);
    var sub=i.substr(m,i.length)
    var m2=null;
    for(var j=0;j<sub.length;j++){
      if(sub[j]=="@"){
        m2=j;
      }
    }
    var x=parseInt(sub.substr(1,m2-1))

    var y=parseInt(sub.substr(m2+1,sub.length))
    // console.log(pref,x,y)
    return {pref,x,y}
  }
  getToxelForTick(tick,w,h){
    tick=tick%(w*h)+1;
    // console.log(tick)
    //option1
      var col=(tick-1)%w;
      var row=Math.ceil(tick/w)-1;
    //option2
      // var col=Math.ceil(tick/h)-1;
      // var row=(tick-1)%h;
    return {
      row,
      col
    }
  }  
}

class InventoryBar {
  constructor(options) {
    this.boxSize = options.boxSize;
    this.div = options.div;
    this.padding = options.padding;
    this.boxes = options.boxes;
    this.setup()
    this.activeBox = options.activeBox
  }
  setup() {
    const {
      boxes,
      boxSize,
      padding
    } = this;
    // console.warn("InventoryBar created!")
    var result = ``;
    for (var i = 0; i < boxes; i++) {
      result += `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" width=${boxSize} height=${boxSize} class="inv_box_${i}" style="border:1px solid black" alt="">`
    }
    document.querySelector(this.div).style=`position:fixed;bottom:3px;left:50%;width:${(boxSize+2)*boxes}px;margin-left:-${boxSize*boxes/2}px;height:${boxSize}px;`
    document.querySelector(this.div).innerHTML=result
  }
  setBox(number, imageSrc) {
    if (imageSrc == null) {
      imageSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    }
    document.querySelector(`.inv_box_${number-1}`).src=imageSrc
  }
  setFocus(number, state) {

    if (state) {
      document.querySelector(`.inv_box_${number-1}`).style.background="rgba(0,0,0,0.7)"
      document.querySelector(`.inv_box_${number-1}`).style.border="1px solid black"
    } else {
      document.querySelector(`.inv_box_${number-1}`).style.background="rgba(54,54,54,0.5)"
      document.querySelector(`.inv_box_${number-1}`).style.border="1px solid #363636"
    }
  }
  setFocusOnly(number) {
    const {
      boxes
    } = this;
    for (var i = 1; i <= boxes; i++) {
      this.setFocus(i, i == number)
    }
    this.activeBox = number
  }
  moveBoxMinus() {
    if (this.activeBox + 1 > this.boxes) {
      this.setFocusOnly(1);
    } else {
      this.setFocusOnly(this.activeBox + 1);
    }
  }
  moveBoxPlus() {
    if (this.activeBox - 1 == 0) {
      this.setFocusOnly(this.boxes);
    } else {
      this.setFocusOnly(this.activeBox - 1);
    }
  }
  directBoxChange(event) {
    var code = event.keyCode
    if (code >= 49 && code < 49 + this.boxes) {
      this.setFocusOnly(code - 48)
    }
  }
}

class TerrainX {
  constructor(options){
    //TODO
    this.cellSize=16;
    this.cellsData={};
    this.toxelSize=27;
    this.blocks=options.blocks;
    this.blocksMapping=options.blocksMapping;
    this.material=options.material
    this.cells={};
    this.models={}
    this.scene=options.scene;
    this.neighbours = [
      [-1, 0, 0],
      [1, 0, 0],
      [0, -1, 0],
      [0, 1, 0],
      [0, 0, -1],
      [0, 0, 1]
    ]
  }
  computeVoxelOffset(voxelX,voxelY,voxelZ){
    const {cellSize} = this;
    var x = THREE.MathUtils.euclideanModulo(voxelX, cellSize) | 0;
    var y = THREE.MathUtils.euclideanModulo(voxelY, cellSize) | 0;
    var z = THREE.MathUtils.euclideanModulo(voxelZ, cellSize) | 0;
    return [x, y, z]
  }
  computeCellForVoxel(voxelX,voxelY,voxelZ){
    const {cellSize} = this;
    var cellX = Math.floor(voxelX / cellSize);
    var cellY = Math.floor(voxelY / cellSize);
    var cellZ = Math.floor(voxelZ / cellSize);
    return [cellX,cellY,cellZ];
  }
  vec3(x,y,z){
    if(typeof x=="string"){
      x=parseInt(x);
    }
    if(typeof y=="string"){
      y=parseInt(y);
    }
    if(typeof z=="string"){
      z=parseInt(z);
    }
    return `${x}:${y}:${z}`;
  }
  setVoxel(voxelX,voxelY,voxelZ,value){
    var voff=this.computeVoxelOffset(voxelX,voxelY,voxelZ);
    var cell=this.computeCellForVoxel(voxelX,voxelY,voxelZ);
    var cellId=this.vec3(...cell);
    if(this.cellsData[cellId]==undefined){
      //there is no cell for voxel;
      this.cellsData[cellId]={
        [this.vec3(...voff)]:value
      }
    }else{
      var prevVox=this.cellsData[cellId][this.vec3(...voff)];
      if(prevVox!=value){
        //voxel has to be changed
        this.cellsData[cellId][this.vec3(...voff)]=value
        this.cellsData[cellId].needsUpdate=true;
        for(var nei of this.neighbours){
          //For each neighbour cell
          var neiCellId=this.vec3(...this.computeCellForVoxel(voxelX+nei[0],voxelY+nei[1],voxelZ+nei[2]))
          try{
            this.cellsData[neiCellId].needsUpdate=true;
          }catch(e){}
        }
      }
    }
    this.cellsData[cellId].needsUpdate=true;
  }
  getVoxel(voxelX,voxelY,voxelZ){
    var cell=this.computeCellForVoxel(voxelX,voxelY,voxelZ);
    var cellId=this.vec3(...cell);
    var voff=this.computeVoxelOffset(voxelX,voxelY,voxelZ);
    var voxId=this.vec3(...voff);
    if(this.cellsData[cellId]!=undefined){
      //cell Exist
      var voxel=this.cellsData[cellId][voxId];
      if(voxel!=undefined){
        return voxel;
      }
    }
    return 0;
  }
  updateCells(){
    const {cellsData} = this;
    var _this=this;
    Object.keys(cellsData).forEach(function (id) {
      if (cellsData[id].needsUpdate) {
        _this.updateCellMesh(...id.split(":"))
      }
    })
  }
  updateCellMesh(cellX,cellY,cellZ){
    console.log(`updating cell: ${cellX}:${cellY}:${cellZ}`)
    var cellId=this.vec3(cellX,cellY,cellZ);
    if(this.cellsData[cellId].needsUpdate){
      var mesh=this.cells[cellId];
      var geometry=this.generateCellGeometry(cellX,cellY,cellZ)
      var material=this.material;
      if(mesh==undefined){
        this.cells[cellId]=new THREE.Mesh(geometry,material);
        this.scene.add(this.cells[cellId])
      }else{
        this.cells[cellId].geometry=geometry;
      }
      this.cellsData[cellId].needsUpdate=false;
    }
  }
  generateCellGeometry(cellX,cellY,cellZ){
    //setup
    const {cellSize}=this;
    var positions=[];
    var normals=[];
    var uvs=[];
    var _this=this;
    function addFace(type,pos,voxel){
      var faceVertex=_this.genBlockFace(type,voxel);
      for(var vertex of faceVertex){
        vertex.pos[0]+=pos[0]
        vertex.pos[1]+=pos[1]
        vertex.pos[2]+=pos[2]
        positions.push(...vertex.pos);
        normals.push(...vertex.norm);
        uvs.push(...vertex.uv)
      }
    }
    function addGeo(geo,pos){
      var posi=geo.attributes.position.array;
      var norm=geo.attributes.normal.array;
      var uv=geo.attributes.uv.array;
      for(var i=0;i<posi.length;i++){
        positions.push(posi[i]+pos[i%3]);
      }
      normals.push(...norm);
      uvs.push(...uv)
    }

    //Add positions,normals,uvs
    for(var i=0;i<cellSize;i++){
      for(var j=0;j<cellSize;j++){
        for(var k=0;k<cellSize;k++){
          var pos=[
            cellX*cellSize+i,
            cellY*cellSize+j,
            cellZ*cellSize+k
          ]
          var voxel=this.getVoxel(...pos);

          if(voxel!=0){
            if(this.blocks[voxel].isBlock){
              //Normal block
              if(!this.blocks[this.getVoxel(pos[0]+1,pos[1],pos[2])].isBlock){
                addFace("nx",pos,voxel)
              }
              if(!this.blocks[this.getVoxel(pos[0]-1,pos[1],pos[2])].isBlock){
                addFace("px",pos,voxel)
              }
              if(!this.blocks[this.getVoxel(pos[0],pos[1]-1,pos[2])].isBlock){
                addFace("ny",pos,voxel)
              }
              if(!this.blocks[this.getVoxel(pos[0],pos[1]+1,pos[2])].isBlock){
                addFace("py",pos,voxel)
              }
              if(!this.blocks[this.getVoxel(pos[0],pos[1],pos[2]+1)].isBlock){
                addFace("pz",pos,voxel)
              }
              if(!this.blocks[this.getVoxel(pos[0],pos[1],pos[2]-1)].isBlock){
                addFace("nz",pos,voxel)
              }
            }else{
              //Specific block
              var blockName=this.blocks[voxel].name
              var geo=this.models[blockName];
              addGeo(geo,pos)
            }
            
          }
        }
      }
    }
    var cellGeometry=new THREE.BufferGeometry();
    cellGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(positions), 3));
    cellGeometry.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(normals), 3));
    cellGeometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(uvs), 2));
    return cellGeometry;
    //Generate geometry
  }
  genBlockFace(type,voxel){
    const {toxelSize,blocksMapping}=this;
    var blockName=this.blocks[voxel]["faces"][type]
    try{
      var toxX=blocksMapping[blockName]["x"]-1
      var toxY=blocksMapping[blockName]["y"]-1
    }catch(e){
      var toxX=blocksMapping["debug"]["x"]-1
      var toxY=27-blocksMapping["debug"]["y"]
    }
    var q=1/toxelSize;
    var x1=q*toxX;
    var y1=1-q*toxY-q;
    var x2=x1+q;
    var y2=y1+q;
    var uv=[
      [x1,y1],
      [x1,y2],
      [x2,y1],
      [x2,y2]
    ]
    switch (type){
      case 'pz':
        return [
          { pos: [-0.5, -0.5,  0.5], norm: [ 0,  0,  1], uv: uv[0], },
          { pos: [ 0.5, -0.5,  0.5], norm: [ 0,  0,  1], uv: uv[2], },
          { pos: [-0.5,  0.5,  0.5], norm: [ 0,  0,  1], uv: uv[1], },

          { pos: [-0.5,  0.5,  0.5], norm: [ 0,  0,  1], uv: uv[1], },
          { pos: [ 0.5, -0.5,  0.5], norm: [ 0,  0,  1], uv: uv[2], },
          { pos: [ 0.5,  0.5,  0.5], norm: [ 0,  0,  1], uv: uv[3], }
        ]
      case 'nx':
        return [
          { pos: [ 0.5, -0.5,  0.5], norm: [ 1,  0,  0], uv: uv[0],},
          { pos: [ 0.5, -0.5, -0.5], norm: [ 1,  0,  0], uv: uv[2], },
          { pos: [ 0.5,  0.5,  0.5], norm: [ 1,  0,  0], uv: uv[1], },
         
          { pos: [ 0.5,  0.5,  0.5], norm: [ 1,  0,  0], uv: uv[1], },
          { pos: [ 0.5, -0.5, -0.5], norm: [ 1,  0,  0], uv: uv[2], },
          { pos: [ 0.5,  0.5, -0.5], norm: [ 1,  0,  0], uv: uv[3], }
        ]
      case 'nz':
        return [
          { pos: [ 0.5, -0.5, -0.5], norm: [ 0,  0, -1], uv: uv[0], },
          { pos: [-0.5, -0.5, -0.5], norm: [ 0,  0, -1], uv: uv[2], },
          { pos: [ 0.5,  0.5, -0.5], norm: [ 0,  0, -1], uv: uv[1], },
         
          { pos: [ 0.5,  0.5, -0.5], norm: [ 0,  0, -1], uv: uv[1], },
          { pos: [-0.5, -0.5, -0.5], norm: [ 0,  0, -1], uv: uv[2], },
          { pos: [-0.5,  0.5, -0.5], norm: [ 0,  0, -1], uv: uv[3], }
        ]
      case 'px':
        return [
          { pos: [-0.5, -0.5, -0.5], norm: [-1,  0,  0], uv: uv[0], },
          { pos: [-0.5, -0.5,  0.5], norm: [-1,  0,  0], uv: uv[2], },
          { pos: [-0.5,  0.5, -0.5], norm: [-1,  0,  0], uv: uv[1], },
         
          { pos: [-0.5,  0.5, -0.5], norm: [-1,  0,  0], uv: uv[1], },
          { pos: [-0.5, -0.5,  0.5], norm: [-1,  0,  0], uv: uv[2], },
          { pos: [-0.5,  0.5,  0.5], norm: [-1,  0,  0], uv: uv[3], },
        ]
      case 'py':
        return [
          { pos: [ 0.5,  0.5, -0.5], norm: [ 0,  1,  0], uv: uv[0], },
          { pos: [-0.5,  0.5, -0.5], norm: [ 0,  1,  0], uv: uv[2], },
          { pos: [ 0.5,  0.5,  0.5], norm: [ 0,  1,  0], uv: uv[1], },
         
          { pos: [ 0.5,  0.5,  0.5], norm: [ 0,  1,  0], uv: uv[1], },
          { pos: [-0.5,  0.5, -0.5], norm: [ 0,  1,  0], uv: uv[2], },
          { pos: [-0.5,  0.5,  0.5], norm: [ 0,  1,  0], uv: uv[3], }
        ]
      case 'ny':
        return [
          { pos: [ 0.5, -0.5,  0.5], norm: [ 0, -1,  0], uv: uv[0], },
          { pos: [-0.5, -0.5,  0.5], norm: [ 0, -1,  0], uv: uv[2], },
          { pos: [ 0.5, -0.5, -0.5], norm: [ 0, -1,  0], uv: uv[1], },
         
          { pos: [ 0.5, -0.5, -0.5], norm: [ 0, -1,  0], uv: uv[1], },
          { pos: [-0.5, -0.5,  0.5], norm: [ 0, -1,  0], uv: uv[2], },
          { pos: [-0.5, -0.5, -0.5], norm: [ 0, -1,  0], uv: uv[3], }
        ]
    }
  }
  intersectsRay(start,end){
    start.x+=0.5;
    start.y+=0.5;
    start.z+=0.5;
    end.x+=0.5;
    end.y+=0.5
    end.z+=0.5
    let dx = end.x - start.x;
    let dy = end.y - start.y;
    let dz = end.z - start.z;
    const lenSq = dx * dx + dy * dy + dz * dz;
    const len = Math.sqrt(lenSq);

    dx /= len;
    dy /= len;
    dz /= len;

    let t = 0.0;
    let ix = Math.floor(start.x);
    let iy = Math.floor(start.y);
    let iz = Math.floor(start.z);
    const stepX = (dx > 0) ? 1 : -1;
    const stepY = (dy > 0) ? 1 : -1;
    const stepZ = (dz > 0) ? 1 : -1;

    const txDelta = Math.abs(1 / dx);
    const tyDelta = Math.abs(1 / dy);
    const tzDelta = Math.abs(1 / dz);

    const xDist = (stepX > 0) ? (ix + 1 - start.x) : (start.x - ix);
    const yDist = (stepY > 0) ? (iy + 1 - start.y) : (start.y - iy);
    const zDist = (stepZ > 0) ? (iz + 1 - start.z) : (start.z - iz);

    let txMax = (txDelta < Infinity) ? txDelta * xDist : Infinity;
    let tyMax = (tyDelta < Infinity) ? tyDelta * yDist : Infinity;
    let tzMax = (tzDelta < Infinity) ? tzDelta * zDist : Infinity;

    let steppedIndex = -1;
    while (t <= len) {
      const voxel = this.getVoxel(ix, iy, iz);
      if (voxel) {
        return {
          position: [
            start.x + t * dx,
            start.y + t * dy,
            start.z + t * dz,
          ],
          normal: [
            steppedIndex === 0 ? -stepX : 0,
            steppedIndex === 1 ? -stepY : 0,
            steppedIndex === 2 ? -stepZ : 0,
          ],
          voxel,
        };
      }
      if (txMax < tyMax) {
        if (txMax < tzMax) {
          ix += stepX;
          t = txMax;
          txMax += txDelta;
          steppedIndex = 0;
        } else {
          iz += stepZ;
          t = tzMax;
          tzMax += tzDelta;
          steppedIndex = 2;
        }
      } else {
        if (tyMax < tzMax) {
          iy += stepY;
          t = tyMax;
          tyMax += tyDelta;
          steppedIndex = 1;
        } else {
          iz += stepZ;
          t = tzMax;
          tzMax += tzDelta;
          steppedIndex = 2;
        }
      }
    }
    return null;
  }
  replaceWorld(voxels){
    var _this=this;
    Object.keys(voxels).forEach(function (id){
      // console.log(id)
      if(voxels[id]!=_this.getVoxel(...id.split(":"))){
        _this.setVoxel(...id.split(":"),voxels[id]);
      }
    })
  }
  saveModel(geometry,name){
    this.models[name]=geometry;
  }
}


var al=new AssetLoader()
$.get(`assets/assetLoader.json?${Tools.uuidv4()}`,function (assets){
  al.load(assets,function (){
    console.log("AssetLoader: done loading!")
    init()
    animate()
  },al)
})

function init(){
  //basic setups
    canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({
      canvas,
      PixelRatio:window.devicePixelRatio
    });
    scene = new THREE.Scene();
    scene.background = new THREE.Color("lightblue");
    camera = new THREE.PerspectiveCamera(75, 2, 0.1, 64*5);
    camera.rotation.order = "YXZ"
    camera.position.set(26, 26, 26)

    
    var ambientLight = new THREE.AmbientLight(0xcccccc);
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0x333333, 2);
    directionalLight.position.set(1, 1, 0.5).normalize();
    scene.add(directionalLight);
    raycaster = new THREE.Raycaster();
    var fbxl = new FBXLoader();
    gameState="menu";
  

  //Snowflakes
    var geometry = new THREE.BufferGeometry();
    var vertices = [];
    materials=[]
    var sprite1 = al.get("snowflake1")
    var sprite2 = al.get("snowflake2")
    var sprite3 = al.get("snowflake3")
    var sprite4 = al.get("snowflake4")
    var sprite5 = al.get("snowflake5")
    for ( var i = 0; i < 1000; i ++ ) {
      var x = Math.random() * 2000 - 1000;
      var y = Math.random() * 2000 - 1000;
      var z = Math.random() * 2000 - 1000;
      vertices.push( x, y, z );
    }
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    parameters = [
      [[ 1.0, 0.2, 0.5 ], sprite2, 20 ],
      [[ 0.95, 0.1, 0.5 ], sprite3, 15 ],
      [[ 0.90, 0.05, 0.5 ], sprite1, 10 ],
      [[ 0.85, 0, 0.5 ], sprite5, 8 ],
      [[ 0.80, 0, 0.5 ], sprite4, 5 ]
    ];
    for ( var i = 0; i < parameters.length; i ++ ) {
      var color = parameters[ i ][ 0 ];
      var sprite = parameters[ i ][ 1 ];
      var size = parameters[ i ][ 2 ];
      materials[ i ] = new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true } );
      materials[ i ].color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ] );
      var particles = new THREE.Points( geometry, materials[ i ] );
      particles.rotation.x = Math.random() * 6;
      particles.rotation.y = Math.random() * 6;
      particles.rotation.z = Math.random() * 6;
      scene.add( particles );
    }
    for ( var i = 0; i < materials.length; i ++ ) {
      materials[ i ].map = parameters[ i ][ 1 ];
      materials[ i ].needsUpdate = true;
    }


  //Clouds
    var clouds=al.get("clouds");
    clouds.scale.x=0.1
    clouds.scale.y=0.1
    clouds.scale.z=0.1
    clouds.position.y=100
    scene.add( clouds );


  //Ghast1
    var ghast=al.get("ghastF")
    const texturex1 = al.get("ghast")
    texturex1.magFilter = THREE.NearestFilter;
    ghast.children[1].material.map=texturex1
    

    ghast.children[0].children[0].scale.set(0.01,0.01,0.01)
    ghast.children[1].material.color=new THREE.Color( 0xffffff );
    var mat=ghast.children[1].material.clone()
    scene.add(ghast)


  //Ghast2
    
    const ghast2=SkeletonUtils.clone(ghast);
    const texturex2 = al.get("ghastS")
    texturex2.magFilter = THREE.NearestFilter;

    ghast2.children[1].material=mat
    ghast2.children[1].material.map=texturex2
    ghast2.position.set(3,0,0)
    scene.add(ghast2)


  //Player
    var playerObject=al.get("player")
    var texturex = al.get("steve")
    texturex.magFilter = THREE.NearestFilter;
    playerObject.children[1].scale.set(1,1,1)
    playerObject.children[1].position.set(25,25,25)
    playerObject.children[0].material.map=texturex
    playerObject.children[0].material.color=new THREE.Color( 0xffffff );
    playerObject.children[1].scale.set(0.5,0.5,0.5)
  

  //Setup worlds
    var worldMaterial=new THREE.MeshLambertMaterial({
      side: 0,
      map:null
    })    

    var textureAtlasX = al.get("textureAtlasX")
    var textureMappingX = al.get("textureMappingX")

    var atlasCreator=new TextureAtlasCreator({
      textureX:textureAtlasX,
      textureMapping:textureMappingX
    })
    var savedTextures=[]
    for(var i=0;i<10;i++){
      var t=atlasCreator.gen(i).toDataURL();
      var tekstura=new THREE.TextureLoader().load(t);
      tekstura.magFilter = THREE.NearestFilter;
      savedTextures.push(tekstura)
    }
    var tickq=0;

    setInterval(function (){
      tickq++;
      var tekst=savedTextures[tickq%9];
      worldMaterial.map=tekst

      worldMaterial.map.needsUpdate=true;
    },100)
  

    terrain=new TerrainX({
      blocks:al.get("blocks"),
      blocksMapping:al.get("textureMappingJson"),
      material:worldMaterial,
      scene,
    })

  //Load Custom blocks models
    var blocks=al.get("blocks")
    var modelsNumber=0;
    var modelsLoaded=0;
    var modelsToLoad=[];
    Object.keys(blocks).forEach(function (p){
      if(!blocks[p].isBlock && p!=0){
        var modelPath=`assets/models/${blocks[p].model}`;
        modelsNumber++;
        modelsToLoad.push(blocks[p])
      }
    })
    for(var i=0;i<modelsToLoad.length;i++){
      (function () {
        var block=modelsToLoad[i];
        fbxl.load( `assets/models/${block.model}`, function ( object ) {
          var geometry=object.children[0].geometry;
          if(block.name=="anvil"){
            geometry.rotateX(-Math.PI/2)
            geometry.translate(0,0.17,0)
            geometry.translate(0,-0.25,0)
          }
          terrain.saveModel(geometry,block.name)
          modelsLoaded++;
          if(modelsLoaded==modelsNumber){
            console.log("Custom blocks models loaded!")
          }
        });
      })();
    }



  //Socket io setup
    socket=io.connect("http://localhost:35565");
    socket.on("connect",()=>{
      console.log("Połączono z serverem!")
    })
    socket.on("blockUpdate",function (block){
      terrain.setVoxel(...block)
    })


  //Socket.io players
    var playersx={}
    socket.on("playerUpdate",function (players){
      var sockets={};
      Object.keys(players).forEach(function (p){
        sockets[p]=true;
        if(playersx[p]==undefined && p!=socket.id){
          playersx[p]=SkeletonUtils.clone(playerObject);
          scene.add(playersx[p])
        }
        try{
          playersx[p].children[1].position.set(players[p].x,players[p].y-0.5,players[p].z)
          playersx[p].children[1].children[0].children[0].children[0].children[2].rotation.x=players[p].xyaw;
          playersx[p].children[1].children[0].rotation.z=players[p].zyaw
        }catch(e){}
      })
      Object.keys(playersx).forEach(function (p){
        if(sockets[p]==undefined){
          scene.remove(playersx[p]);
          delete playersx[p]
        }
      })
    })


  //Socket.io first world load
    socket.on("firstLoad",function (v){
      console.log("Otrzymano pakiet świata!")
      // console.log(v)
      terrain.replaceWorld(v)
      $(".initLoading").css("display","none")
      stats = new Stats();
      stats.showPanel(0);
      document.body.appendChild(stats.dom);
    })
  

  //Inventory Bar
    var inv_bar = new InventoryBar({
      boxSize: 60,
      boxes: 9,
      padding: 4,
      div: ".inventoryBar",
      activeBox: 1
    })
    inv_bar.setBox(1,"assets/images/grass_block.png")
    inv_bar.setBox(2,"assets/images/stone.png")
    inv_bar.setBox(3,"assets/images/oak_planks.png")
    inv_bar.setBox(4,"assets/images/smoker.gif")
    inv_bar.setBox(5,"assets/images/anvil.png")
    inv_bar.setBox(6,"assets/images/brick.png")
    inv_bar.setBox(7,"assets/images/furnace.png")
    inv_bar.setBox(8,"assets/images/bookshelf.png")
    inv_bar.setBox(9,"assets/images/tnt.png")
    inv_bar.setFocusOnly(1)
    $(window).on('wheel', function (event) {
      if (event.originalEvent.deltaY < 0) {
        inv_bar.moveBoxPlus()
      } else {
        inv_bar.moveBoxMinus()
      }
    })


  //First Person Controls
    FPC = new FirstPersonControls({
      canvas: document.getElementById("c"),
      camera,
      micromove: 0.3
    })
    function updatePosition(e) {
      FPC.camera.rotation.x -= FPC.degtorad(e.movementY / 10)
      FPC.camera.rotation.y -= FPC.degtorad(e.movementX / 10)
      if (FPC.radtodeg(FPC.camera.rotation.x) < -90) {
        FPC.camera.rotation.x = FPC.degtorad(-90)
      }
      if (FPC.radtodeg(FPC.camera.rotation.x) > 90) {
        FPC.camera.rotation.x = FPC.degtorad(90)
      }
    }
    function lockChangeAlert() {
      if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
        document.addEventListener("mousemove", updatePosition, false);
        $(".gameMenu").css("display", "none")
        gameState="game"
      } else {
        document.removeEventListener("mousemove", updatePosition, false);
        $(".gameMenu").css("display", "block")
        gameState="menu"
      }
    }
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
    $(document).keydown(function (z) {
      FPC.keys[z.keyCode] = true;
      inv_bar.directBoxChange(z)
    })
    $(document).keyup(function (z) {
      delete FPC.keys[z.keyCode];
    })
    $(".gameOn").click(function () {
      FPC.lockPointer()
    })
  

  //Raycast cube
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({
      color: 0x00ff00
    });
    var edges = new THREE.EdgesGeometry(geometry);
    cube = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 0.5
    }));
    scene.add(cube);


  //jquery events
    $(document).mousedown(function (e) {
      if (gameState=="game") {
        const start = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
        const end = new THREE.Vector3().set(0,0, 1).unproject(camera);
        const intersection = terrain.intersectsRay(start, end);
        if (e.which == 1) {
          var voxelId=0;
        } else {
          var voxelId=inv_bar.activeBox;
        }
        if(intersection){
          const pos = intersection.position.map((v, ndx) => {
            return v + intersection.normal[ndx] * (voxelId > 0 ? 0.5 : -0.5);
          });
          // world.setVoxel(...pos, voxelId);
          socket.emit("blockUpdate",[...pos,voxelId])
        }
      }
    })

}


function animate() {
  try{stats.begin();}catch(e){}
  render()
  try{stats.end();}catch(e){}
  
  requestAnimationFrame(animate)
}


function render() {
  var time = Date.now() * 0.00005;
  for ( var i = 0; i < scene.children.length; i ++ ) {
    var object = scene.children[ i ];
    if ( object instanceof THREE.Points ) {
      object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );
    }
  }
  for ( var i = 0; i < materials.length; i ++ ) {
    var color = parameters[ i ][ 0 ];
    var h = ( 360 * ( color[ 0 ] + time ) % 360 ) / 360;
    materials[ i ].color.setHSL( h, color[ 1 ], color[ 2 ] );
  }


  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
    
  if (gameState=="game") {
    socket.emit("playerUpdate",{
      x:camera.position.x,
      y:camera.position.y,
      z:camera.position.z,
      xyaw:-camera.rotation.x,
      zyaw:camera.rotation.y+Math.PI
    })
    FPC.camMicroMove()

  }
  renderer.render(scene, camera);
  terrain.updateCells()
  

  const start = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
  const end = new THREE.Vector3().set(0,0, 1).unproject(camera);
  const intersection = terrain.intersectsRay(start, end);
  if(intersection){
    const pos = intersection.position.map((v, ndx) => {
      return v + intersection.normal[ndx] * -0.5;
    });
    pos[0]=Math.floor(pos[0])
    pos[1]=Math.floor(pos[1])
    pos[2]=Math.floor(pos[2])
    cube.position.set(...pos)
    // console.log(pos)
    cube.visible=true;
  }else{
    cube.visible=false;
  }
}