import * as THREE from "three";
import { ChunkTerrain } from "./ChunkTerrain.js";
import { AnimatedTextureAtlas } from "./AnimatedTextureAtlas.js";
import { SectionComputer } from "./SectionComputer.js";
import vec3 from "vec3";
import chunkWorker from "./chunk.worker.js";

/** Class to manage world (chunks,generating terrain,etc.) */
var World = class World {
    /**
     * World init function
     * @param game - Object of main game
     */
    constructor(game) {
        this.game = game;
        this.cellMesh = {};
        this.blocksDef = this.game.al.get("blocksDef");
        this.models = {};
        this.chunkTerrain = new ChunkTerrain({
            blocksDef: this.blocksDef,
        });
        this.ATA = new AnimatedTextureAtlas(this.game);
        this.material = this.ATA.material;
        this.cellUpdateTime = null;
        this.renderTime = 100;
        this.neighbours = [
            [-1, 0, 0],
            [1, 0, 0],
            [0, -1, 0],
            [0, 1, 0],
            [0, 0, -1],
            [0, 0, 1],
        ];
        this.chunkWorker = new chunkWorker();
        this.chunkWorker.onmessage = (message) => {
            if (message.data.type === "cellGeo") {
                return this.updateCell(message.data.data);
            } else if (message.data.type === "removeCell") {
                if (this.cellMesh[message.data.data] !== void 0) {
                    this.cellMesh[message.data.data].geometry.dispose();
                    this.game.scene.remove(this.cellMesh[message.data.data]);
                    delete this.cellMesh[message.data.data];
                    return this.game.renderer.renderLists.dispose();
                }
            }
        };
        this.chunkWorker.postMessage({
            type: "init",
            data: {
                blocksMapping: this.game.al.get("blocksMapping"),
                toxelSize: this.game.toxelSize,
                blocksTex: this.game.al.get("blocksTex"),
                blocksDef: this.blocksDef,
            },
        });
        this.lastPlayerChunk = null;
        this.blocksUpdate = false;
    }
    /**
     * Updates render order of chunk meshes
     * @param cell - player cell
     */
    updateRenderOrder(cell) {
        var c = new vec3(...cell);
        for (var i in this.cellMesh) {
            var n = i.split(":");
            var x = new vec3(parseInt(n[0]), parseInt(n[1]), parseInt(n[2]));
            this.cellMesh[i].renderOrder = -c.distanceTo(x);
        }
    }
    /**
     * Sets custom cell buffer
     * @param cellX - cell X coord
     * @param cellY - cell Y coord
     * @param cellZ - cell Z coord
     * @param buffer - cell Buffer
     */
    setCell(cellX, cellY, cellZ, buffer) {
        this.cellUpdateTime = performance.now();
        this.chunkWorker.postMessage({
            type: "setCell",
            data: [cellX, cellY, cellZ, buffer],
        });
        this.chunkTerrain.setCell(cellX, cellY, cellZ, buffer);
    }
    /**
     * Sets custom block to some value
     * @param voxelX - block X coord
     * @param voxelY - block Y coord
     * @param voxelZ - block Z coord
     * @param value - new value of block
     */
    setBlock(voxelX, voxelY, voxelZ, value) {
        voxelX = parseInt(voxelX);
        voxelY = parseInt(voxelY);
        voxelZ = parseInt(voxelZ);
        this.blocksUpdate = true;
        if (this.chunkTerrain.getVoxel(voxelX, voxelY, voxelZ) !== value) {
            this.chunkWorker.postMessage({
                type: "setVoxel",
                data: [voxelX, voxelY, voxelZ, value],
            });
            this.chunkTerrain.setVoxel(voxelX, voxelY, voxelZ, value);
        }
    }
    /**
     * Resets all chunk meshes
     */
    resetWorld() {
        for (var i in this.cellMesh) {
            if (this.cellMesh[i].geometry !== void 0) {
                this.cellMesh[i].geometry.dispose();
                this.game.scene.remove(this.cellMesh[i]);
            }
            delete this.cellMesh[i];
        }
        this.chunkTerrain.cells = {};
        this.chunkWorker.postMessage({
            type: "resetWorld",
            data: null,
        });
    }
    /**
     * Updates cell
     * @param data - cell Data
     */
    updateCell(data) {
        var cellId = this.chunkTerrain.vec3(...data.info);
        var cell = data.cell;
        var mesh = this.cellMesh[cellId];
        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(cell.positions), 3)
        );
        geometry.setAttribute(
            "normal",
            new THREE.BufferAttribute(new Float32Array(cell.normals), 3)
        );
        geometry.setAttribute(
            "uv",
            new THREE.BufferAttribute(new Float32Array(cell.uvs), 2)
        );
        geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(new Float32Array(cell.colors), 3)
        );
        geometry.matrixAutoUpdate = false;
        if (mesh === void 0) {
            this.cellMesh[cellId] = new THREE.Mesh(geometry, this.material);
            this.cellMesh[cellId].matrixAutoUpdate = false;
            this.cellMesh[cellId].frustumCulled = false;
            this.cellMesh[cellId].onAfterRender = () => {
                this.cellMesh[cellId].frustumCulled = true;
                this.cellMesh[cellId].onAfterRender = function () {};
            };
            this.game.scene.add(this.cellMesh[cellId]);
            if (this.lastPlayerChunk !== null) {
                this.updateRenderOrder(JSON.parse(this.lastPlayerChunk));
            }
        } else {
            this.cellMesh[cellId].geometry = geometry;
        }
    }
    /**
     * Intersect raycast vector
     * @param start - vector start
     * @param end - vector end
     */
    intersectsRay(start, end) {
        start.x += 0.5;
        start.y += 0.5;
        start.z += 0.5;
        end.x += 0.5;
        end.y += 0.5;
        end.z += 0.5;
        var dx = end.x - start.x;
        var dy = end.y - start.y;
        var dz = end.z - start.z;
        var lenSq = dx * dx + dy * dy + dz * dz;
        var len = Math.sqrt(lenSq);
        dx /= len;
        dy /= len;
        dz /= len;
        var t = 0.0;
        var ix = Math.floor(start.x);
        var iy = Math.floor(start.y);
        var iz = Math.floor(start.z);
        var stepX = dx > 0 ? 1 : -1;
        var stepY = dy > 0 ? 1 : -1;
        var stepZ = dz > 0 ? 1 : -1;
        var txDelta = Math.abs(1 / dx);
        var tyDelta = Math.abs(1 / dy);
        var tzDelta = Math.abs(1 / dz);
        var xDist = stepX > 0 ? ix + 1 - start.x : start.x - ix;
        var yDist = stepY > 0 ? iy + 1 - start.y : start.y - iy;
        var zDist = stepZ > 0 ? iz + 1 - start.z : start.z - iz;
        var txMax = txDelta < 2e308 ? txDelta * xDist : 2e308;
        var tyMax = tyDelta < 2e308 ? tyDelta * yDist : 2e308;
        var tzMax = tzDelta < 2e308 ? tzDelta * zDist : 2e308;
        var steppedIndex = -1;
        while (t <= len) {
            var block = this.chunkTerrain.getBlock(ix, iy, iz);
            var voxel;
            if (
                block.name === "air" ||
                block.name === "cave_air" ||
                block.name === "void_air" ||
                block.name === "water"
            ) {
                voxel = 0;
            } else {
                voxel = 1;
            }
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
    /**
     * Get Block player is pointing at
     * @returns Pointing block
     */
    getRayBlock() {
        var start = new THREE.Vector3().setFromMatrixPosition(
            this.game.camera.matrixWorld
        );
        var end = new THREE.Vector3().set(0, 0, 1).unproject(this.game.camera);
        var intersection = this.intersectsRay(start, end);
        if (intersection) {
            var posPlace = intersection.position.map(function (v, ndx) {
                return Math.floor(v + intersection.normal[ndx] * 0.5);
            });
            var posBreak = intersection.position.map(function (v, ndx) {
                return Math.floor(v + intersection.normal[ndx] * -0.5);
            });
            return { posPlace, posBreak };
        } else {
            return false;
        }
    }
    /**
     * Update chunks around player in radius
     * @param radius - radius from player
     */
    updateCellsAroundPlayer(radius) {
        var pos = this.game.camera.position;
        var cell = this.chunkTerrain.computeCellForVoxel(
            Math.floor(pos.x + 0.5),
            Math.floor(pos.y + 0.5),
            Math.floor(pos.z + 0.5)
        );
        if (this.blocksUpdate) {
            this.blocksUpdate = false;
            this.chunkWorker.postMessage({
                type: "updateCellsAroundPlayer",
                data: [cell, radius],
            });
        } else if (this.lastPlayerChunk != JSON.stringify(cell)) {
            if (
                this.cellUpdateTime !== null &&
                performance.now() - this.cellUpdateTime > this.renderTime
            ) {
                this.updateRenderOrder(cell);
                this.lastPlayerChunk = JSON.stringify(cell);
                this.chunkWorker.postMessage({
                    type: "updateCellsAroundPlayer",
                    data: [cell, radius],
                });
            }
        }
    }
    /**
     * Computes Buffer sent from server to readable section
     * @param sections - section buffer
     * @param x - section x
     * @param z - section z
     */
    computeSections(sections, x, z) {
        var result = SectionComputer({ sections, x, z });
        // console.log(result);
        var results = [];
        for (var i in result) {
            var j = result[i];
            if (j !== null) {
                results.push(this.setCell(j.x, j.y, j.z, j.cell));
            } else {
                results.push(void 0);
            }
        }
        return results;
    }
};

export { World };
