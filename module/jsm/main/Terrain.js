import {BufferGeometryUtils} from "../utils/BufferGeometryUtils.js"
import * as THREE from "../../build/three.module.js"

class Terrain {
  constructor(options) {
    this.textureMaterial = options.textureMaterial;
    this.textureRows = options.textureRows;
    this.textureCols = options.textureCols;
    this.cellSize = options.cellSize;
    this.scene=options.scene;
    this.textureAtlasMapping=options.textureAtlasMapping;
    this.cells = {};
    this.cells_meshes = {};
    this.neighbours = [
      [-1, 0, 0],
      [1, 0, 0],
      [0, -1, 0],
      [0, 1, 0],
      [0, 0, -1],
      [0, 0, 1]
    ]
    this.models={}
  }
  parseVec(x, y, z) {
    return `${x}:${y}:${z}`;
  }
  computeVoxelOffset(x, y, z) {
    const {
      cellSize
    } = this;
    x = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
    y = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
    z = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
    return [x, y, z]
  }
  computeCellId(x, y, z) {
    const {
      cellSize
    } = this;
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    const cellZ = Math.floor(z / cellSize);
    return this.parseVec(cellX,cellY,cellZ)
  }
  getCellForVoxel(x, y, z) {
    return this.cells[this.computeCellId(x, y, z)];
  }
  setVoxel(x, y, z, v) {
    var voxel = this.computeVoxelOffset(x, y, z);
    var cellId = this.computeCellId(x, y, z);
    if (this.cells[cellId] != undefined) {
      this.cells[cellId][this.parseVec(...voxel)] = v;
    } else {
      this.cells[cellId] = {
        [this.parseVec(...voxel)]: v
      };
    }
    this.cells[cellId].needsUpdate = true;
    // console.log(this.neighbours)
    for (var i = 0; i < this.neighbours.length; i++) {
      var neigh = this.neighbours[i];
      var cellIdX = this.computeCellId(x + neigh[0], y + neigh[1], z + neigh[2]);
      try {
        this.cells[cellIdX].needsUpdate = true;
      } catch (e) {}

    }
  }
  getVoxel(x, y, z) {
    var voxel = this.computeVoxelOffset(x, y, z);
    var cellId = this.computeCellId(x, y, z);
    if (this.cells[cellId] != undefined) {
      var val = this.cells[cellId][this.parseVec(...voxel)];
      if (val != undefined) {
        return val;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }
  updateCells(world) {
    const {
      cells
    } = this;
    Object.keys(cells).forEach(function (id) {
      if (cells[id].needsUpdate) {
        world.updateCellGeometry(...id.split(":"))
      }
    })
  }
  updateCellGeometry(x, y, z) {
    console.warn(`updating Chunk: ${x}:${y}:${z}`)
    if (this.cells[this.parseVec(x, y, z)].needsUpdate) {
      var mesh = this.cells_meshes[this.parseVec(x, y, z)];
      var geometry = this.generateCellGeometry(x, y, z);
      if (geometry != null) {
        geometry.dynamic = false;
        if (mesh != undefined) {
          mesh.geometry = geometry;
        } else {
          var geometry = geometry;
          var mesh = new THREE.Mesh(geometry, this.textureMaterial);
          // mesh.computeAngleVertexNormals(Math.PI/2);
          this.scene.add(mesh)
          this.cells_meshes[this.parseVec(x, y, z)] = mesh;
        }
      } else {
        this.scene.remove(this.cells_meshes[this.parseVec(x, y, z)])
        delete this.cells_meshes[this.parseVec(x, y, z)]
        // delete this.cells[this.parseVec(x,y,z)]
      }
      try {
        this.cells[this.parseVec(x, y, z)].needsUpdate = false;
      } catch (e) {}

    }
  }
  generateCellGeometry(x, y, z) {
    const {
      cellSize
    } = this;
    var geometries = [];
    for (var i = 0; i < cellSize; i++) {
      for (var j = 0; j < cellSize; j++) {
        for (var k = 0; k < cellSize; k++) {
          var voxelGeometries = this.generateVoxelGeometry(x * cellSize + i, y * cellSize + j, z * cellSize + k);
          for (var l = 0; l < voxelGeometries.length; l++) {
            if(voxelGeometries[l].index!=null){
              voxelGeometries[l]=voxelGeometries[l].toNonIndexed()
            }
            geometries.push(voxelGeometries[l]);

          }
        }
      }
    }
    if (geometries.length != 0) {
      var geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
      geometry.computeBoundingSphere();
      geometry.computeVertexNormals();
    } else {
      var geometry = null;
    }
    return geometry;
  }
  generateVoxelGeometry(x, y, z) {
    var voxel = this.getVoxel(x, y, z);
    var matrix = new THREE.Matrix4();
    matrix.makeTranslation(x, y, z);
    if(voxel){
      if(this.blocks[voxel].isBlock){
        //Normal block
        var geometries = [];
        if (!this.blocks[this.getVoxel(x - 1, y, z)].isBlock) {
          var nxGeometry = this.generateFace("nx", voxel);
          geometries.push(nxGeometry.applyMatrix4(matrix))
        }
        if (!this.blocks[this.getVoxel(x + 1, y, z)].isBlock) {
          var pxGeometry = this.generateFace("px", voxel);
          geometries.push(pxGeometry.applyMatrix4(matrix))
        }
        if (!this.blocks[this.getVoxel(x, y - 1, z)].isBlock) {
          var nyGeometry = this.generateFace("ny", voxel);
          geometries.push(nyGeometry.applyMatrix4(matrix))
        }
        if (!this.blocks[this.getVoxel(x, y + 1, z)].isBlock) {
          var pyGeometry = this.generateFace("py", voxel);
          geometries.push(pyGeometry.applyMatrix4(matrix))
        }
        if (!this.blocks[this.getVoxel(x, y, z - 1)].isBlock) {
          var nzGeometry = this.generateFace("nz", voxel);
          geometries.push(nzGeometry.applyMatrix4(matrix))
        }
        if (!this.blocks[this.getVoxel(x, y, z + 1)].isBlock) {
          var pzGeometry = this.generateFace("pz", voxel);
          geometries.push(pzGeometry.applyMatrix4(matrix))
        }
        return geometries; 
      }else{
        var blockName=this.blocks[voxel].name
        var geo=this.models[blockName].clone()
        geo=geo.applyMatrix4(matrix)
        return [geo]
      }
    }else{
      return []
    } 
  }
  generateFace(type, voxel) {
    const {textureAtlasMapping}=this;
    var geometry = new THREE.PlaneBufferGeometry(1, 1);
    var light = new THREE.Color( 0xffffff );
    var shadow = new THREE.Color( 0x505050 );
    if (type == "px") {
      geometry.rotateY(Math.PI / 2);
      geometry.translate(0.5, 0, 0);
    }
    if (type == "nx") {
      geometry.rotateY(-Math.PI / 2);
      geometry.translate(-0.5, 0, 0);
    }
    if (type == "py") {
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(0, 0.5, 0);
    }
    if (type == "ny") {
      geometry.rotateX(Math.PI / 2);
      geometry.translate(0, -0.5, 0);
    }
    if (type == "pz") {
      geometry.translate(0, 0, 0.5);
    }
    if (type == "nz") {
      geometry.rotateY(Math.PI);
      geometry.translate(0, 0, -0.5);
    }
    var uv = this.blocks[voxel]["faces"][type]
    try{
      var uvX=textureAtlasMapping[uv]["x"]-1
      var uvY=27-textureAtlasMapping[uv]["y"]
    }catch(e){
      var uvX=textureAtlasMapping["debug"]["x"]-1
      var uvY=27-textureAtlasMapping["debug"]["y"]
    }
    

    this.setUv(geometry, uvX,uvY, 180)
    return geometry;
  }
  setUv(geometry, x, y, rotation = 0) {
    const {
      textureRows,
      textureCols
    } = this;
    var textureSizeX = 1 / textureRows;
    var textureSizeY = 1 / textureCols;
    if (rotation == 0) {
      geometry.attributes.uv.array[0] = textureSizeX * x;
      geometry.attributes.uv.array[1] = textureSizeY * y;

      geometry.attributes.uv.array[2] = textureSizeX + textureSizeX * x;
      geometry.attributes.uv.array[3] = 0 + textureSizeY * y;

      geometry.attributes.uv.array[4] = 0 + textureSizeX * x;
      geometry.attributes.uv.array[5] = textureSizeY + textureSizeY * y;

      geometry.attributes.uv.array[6] = textureSizeX + textureSizeX * x;
      geometry.attributes.uv.array[7] = textureSizeY + textureSizeY * y;
    } else if (rotation == 180) {
      geometry.attributes.uv.array[4] = textureSizeX * x;
      geometry.attributes.uv.array[5] = textureSizeY * y;

      geometry.attributes.uv.array[6] = textureSizeX + textureSizeX * x;
      geometry.attributes.uv.array[7] = 0 + textureSizeY * y;

      geometry.attributes.uv.array[0] = 0 + textureSizeX * x;
      geometry.attributes.uv.array[1] = textureSizeY + textureSizeY * y;

      geometry.attributes.uv.array[2] = textureSizeX + textureSizeX * x;
      geometry.attributes.uv.array[3] = textureSizeY + textureSizeY * y;
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
  replaceWorld(voxels,world){
    Object.keys(voxels).forEach(function (id){
      // console.log(id)
      if(voxels[id]!=world.getVoxel(...id.split(":"))){
        world.setVoxel(...id.split(":"),voxels[id]);
      }
    })
  }
  saveModel(geometry,name){
    this.models[name]=geometry;
  }
}

export {Terrain};