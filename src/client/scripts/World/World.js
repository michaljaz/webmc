
var World;

import * as THREE from 'three';

import {
  CellTerrain
} from './CellTerrain.js';

import {
  AnimatedTextureAtlas
} from './AnimatedTextureAtlas.js';

import {
  SectionComputer
} from "./SectionComputer.js";

import vec3 from "vec3";

import chunkWorker from "./chunk.worker.js";

World = class World {
  constructor(game) {
    var _this;
    _this = this;
    this.game = game;
    this.cellBlackList = {};
    this.cellMesh = {};
    this.cellNeedsUpdate = {};
    this.blocksDef = this.game.al.get("blocksDef");
    this.models = {};
    this.cellTerrain = new CellTerrain({
      cellSize: this.game.cellSize,
      blocksDef: this.blocksDef
    });
    this.ATA = new AnimatedTextureAtlas(this.game);
    this.material = this.ATA.material;
    this.cellUpdateTime = null;
    this.renderTime = 100;
    this.neighbours = [[-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1]];
    this.chunkWorker = new chunkWorker();
    this.chunkWorker.onmessage = function(message) {
      if (message.data.type === "cellGeo") {
        return _this.updateCell(message.data.data);
      } else if (message.data.type === "removeCell") {
        if (_this.cellMesh[message.data.data] !== void 0) {
          _this.cellMesh[message.data.data].geometry.dispose();
          _this.game.scene.remove(_this.cellMesh[message.data.data]);
          delete _this.cellMesh[message.data.data];
          return _this.game.renderer.renderLists.dispose();
        }
      }
    };
    this.chunkWorker.postMessage({
      type: 'init',
      data: {
        blocksMapping: this.game.al.get("blocksMapping"),
        toxelSize: this.game.toxelSize,
        cellSize: this.game.cellSize,
        blocksTex: this.game.al.get("blocksTex"),
        blocksDef: this.blocksDef
      }
    });
    return;
  }

  updateRenderOrder(cell) {
    var c, i, n, x;
    c = new vec3(...cell);
    for (i in this.cellMesh) {
      n = i.split(":");
      x = new vec3(parseInt(n[0]), parseInt(n[1]), parseInt(n[2]));
      this.cellMesh[i].renderOrder = -c.distanceTo(x);
    }
  }

  setCell(cellX, cellY, cellZ, buffer) {
    this._setCell(cellX, cellY, cellZ, buffer);
    return this.cellTerrain.setCell(cellX, cellY, cellZ, buffer);
  }

  setBlock(voxelX, voxelY, voxelZ, value) {
    voxelX = parseInt(voxelX);
    voxelY = parseInt(voxelY);
    voxelZ = parseInt(voxelZ);
    if ((this.cellTerrain.getVoxel(voxelX, voxelY, voxelZ)) !== value) {
      this._setVoxel(voxelX, voxelY, voxelZ, value);
      this.cellTerrain.setVoxel(voxelX, voxelY, voxelZ, value);
    }
  }

  resetWorld() {
    var i;
    for (i in this.cellMesh) {
      if (this.cellMesh[i].geometry !== void 0) {
        this.cellMesh[i].geometry.dispose();
        this.game.scene.remove(this.cellMesh[i]);
      }
      delete this.cellMesh[i];
    }
    this.cellTerrain.cells = {};
    this._resetWorld();
  }

  updateCell(data) {
    var _this, cell, cellId, geometry, mesh;
    cellId = this.cellTerrain.vec3(...data.info);
    cell = data.cell;
    mesh = this.cellMesh[cellId];
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cell.positions), 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(cell.normals), 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(cell.uvs), 2));
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(cell.colors), 3));
    geometry.matrixAutoUpdate = false;
    if (mesh === void 0) {
      this.cellMesh[cellId] = new THREE.Mesh(geometry, this.material);
      this.cellMesh[cellId].matrixAutoUpdate = false;
      this.cellMesh[cellId].frustumCulled = false;
      _this = this;
      this.cellMesh[cellId].onAfterRender = function() {
        _this.cellMesh[cellId].frustumCulled = true;
        return _this.cellMesh[cellId].onAfterRender = function() {};
      };
      this.game.scene.add(this.cellMesh[cellId]);
    } else {
      this.cellMesh[cellId].geometry = geometry;
    }
  }

  intersectsRay(start, end) {
    var block, dx, dy, dz, ix, iy, iz, len, lenSq, stepX, stepY, stepZ, steppedIndex, t, txDelta, txMax, tyDelta, tyMax, tzDelta, tzMax, voxel, xDist, yDist, zDist;
    start.x += 0.5;
    start.y += 0.5;
    start.z += 0.5;
    end.x += 0.5;
    end.y += 0.5;
    end.z += 0.5;
    dx = end.x - start.x;
    dy = end.y - start.y;
    dz = end.z - start.z;
    lenSq = dx * dx + dy * dy + dz * dz;
    len = Math.sqrt(lenSq);
    dx /= len;
    dy /= len;
    dz /= len;
    t = 0.0;
    ix = Math.floor(start.x);
    iy = Math.floor(start.y);
    iz = Math.floor(start.z);
    stepX = dx > 0 ? 1 : -1;
    stepY = dy > 0 ? 1 : -1;
    stepZ = dz > 0 ? 1 : -1;
    txDelta = Math.abs(1 / dx);
    tyDelta = Math.abs(1 / dy);
    tzDelta = Math.abs(1 / dz);
    xDist = stepX > 0 ? ix + 1 - start.x : start.x - ix;
    yDist = stepY > 0 ? iy + 1 - start.y : start.y - iy;
    zDist = stepZ > 0 ? iz + 1 - start.z : start.z - iz;
    txMax = txDelta < 2e308 ? txDelta * xDist : 2e308;
    tyMax = tyDelta < 2e308 ? tyDelta * yDist : 2e308;
    tzMax = tzDelta < 2e308 ? tzDelta * zDist : 2e308;
    steppedIndex = -1;
    while (t <= len) {
      block = this.cellTerrain.getBlock(ix, iy, iz);
      if (block.name === "air" || block.name === "cave_air" || block.name === "void_air" || block.name === "water") {
        voxel = 0;
      } else {
        voxel = 1;
      }
      if (voxel) {
        return {
          position: [start.x + t * dx, start.y + t * dy, start.z + t * dz],
          normal: [steppedIndex === 0 ? -stepX : 0, steppedIndex === 1 ? -stepY : 0, steppedIndex === 2 ? -stepZ : 0],
          voxel
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

  getRayBlock() {
    var end, intersection, posBreak, posPlace, start;
    start = new THREE.Vector3().setFromMatrixPosition(this.game.camera.matrixWorld);
    end = new THREE.Vector3().set(0, 0, 1).unproject(this.game.camera);
    intersection = this.intersectsRay(start, end);
    if (intersection) {
      posPlace = intersection.position.map(function(v, ndx) {
        return Math.floor(v + intersection.normal[ndx] * 0.5);
      });
      posBreak = intersection.position.map(function(v, ndx) {
        return Math.floor(v + intersection.normal[ndx] * -0.5);
      });
      return {posPlace, posBreak};
    } else {
      return false;
    }
  }

  _setCell(cellX, cellY, cellZ, buffer, biome) {
    this.cellUpdateTime = performance.now();
    return this.chunkWorker.postMessage({
      type: "setCell",
      data: [cellX, cellY, cellZ, buffer, biome]
    });
  }

  _resetWorld() {
    this.chunkWorker.postMessage({
      type: "resetWorld",
      data: null
    });
  }

  _setVoxel(voxelX, voxelY, voxelZ, value) {
    return this.chunkWorker.postMessage({
      type: "setVoxel",
      data: [voxelX, voxelY, voxelZ, value]
    });
  }

  _genCellGeo(cellX, cellY, cellZ) {
    cellX = parseInt(cellX);
    cellY = parseInt(cellY);
    cellZ = parseInt(cellZ);
    return this.chunkWorker.postMessage({
      type: "genCellGeo",
      data: [cellX, cellY, cellZ]
    });
  }

  _updateCellsAroundPlayer(radius) {
    var cell, pos;
    pos = this.game.camera.position;
    cell = this.cellTerrain.computeCellForVoxel(Math.floor(pos.x + 0.5), Math.floor(pos.y + 0.5), Math.floor(pos.z + 0.5));
    this.updateRenderOrder(cell);
    if (this.cellUpdateTime !== null && (performance.now() - this.cellUpdateTime > this.renderTime)) {
      this.chunkWorker.postMessage({
        type: "updateCellsAroundPlayer",
        data: [cell, radius]
      });
    }
  }

  _computeSections(sections, x, z, biomes) {
    var i, j, len1, result, results;
    result = SectionComputer({sections, x, z, biomes});
    results = [];
    for (j = 0, len1 = result.length; j < len1; j++) {
      i = result[j];
      if (i !== null) {
        results.push(this.setCell(i.x, i.y, i.z, i.cell));
      } else {
        results.push(void 0);
      }
    }
    return results;
  }

};

export {
  World
};
