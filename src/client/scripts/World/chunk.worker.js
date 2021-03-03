import { ChunkTerrain } from "./ChunkTerrain.js";
import { ChunkMesher } from "./ChunkMesher.js";

var terrain = null;

class TerrainManager {
    constructor(data) {
        this.chunkTerrain = new ChunkTerrain({
            blocksDef: data.blocksDef,
        });
        this.chunkNeedsUpdate = {};
        this.loadedMeshes = {};
        this.chunkMesher = new ChunkMesher({
            blocksTex: data.blocksTex,
            blocksMapping: data.blocksMapping,
            toxelSize: data.toxelSize,
            chunkTerrain: this.chunkTerrain,
        });
        this.neighbours = [
            [-1, 0, 0],
            [1, 0, 0],
            [0, -1, 0],
            [0, 1, 0],
            [0, 0, -1],
            [0, 0, 1],
        ];
    }
    setVoxel(data) {
        this.chunkTerrain.setVoxel(...data);
        var chunkId = this.chunkTerrain.vec3(
            ...terrain.chunkTerrain.computeChunkForVoxel(
                data[0],
                data[1],
                data[2]
            )
        );
        this.chunkNeedsUpdate[chunkId] = true;
        for (var l = 0; l < this.neighbours.length; l++) {
            var nei = this.neighbours[l];
            var neiChunkId = this.chunkTerrain.vec3(
                ...this.chunkTerrain.computeChunkForVoxel(
                    data[0] + nei[0],
                    data[1] + nei[1],
                    data[2] + nei[2]
                )
            );
            this.chunkNeedsUpdate[neiChunkId] = true;
        }
    }
    genChunkGeo(data) {
        queueMicrotask(() => {
            if (
                this.chunkTerrain.vec3(...data) in this.chunkTerrain.chunks ===
                true
            ) {
                var geo = this.chunkMesher.genChunkGeo(...data);
                postMessage({
                    type: "cellGeo",
                    data: {
                        cell: geo,
                        info: data,
                        p: performance.now(),
                    },
                });
            }
        });
    }
    setChunk(data) {
        this.chunkNeedsUpdate[
            terrain.chunkTerrain.vec3(data[0], data[1], data[2])
        ] = true;
        this.chunkTerrain.setChunk(data[0], data[1], data[2], data[3]);
        for (var l = 0; l < this.neighbours.length; l++) {
            var nei = this.neighbours[l];
            var neiCellId = this.chunkTerrain.vec3(
                data[0] + nei[0],
                data[1] + nei[1],
                data[2] + nei[2]
            );
            this.chunkNeedsUpdate[neiCellId] = true;
        }
    }
    updateChunksAroundPlayer(data) {
        var chunk = data[0];
        var radius = data[1];
        var odw = {};
        var chunkBlackList = {};
        for (var k in this.loadedMeshes) {
            var v = this.loadedMeshes[k];
            if (v === true) {
                chunkBlackList[k] = true;
            }
        }
        for (var i = 0; i <= radius; i++) {
            for (var x = -i; x <= i; x++) {
                for (var y = -i; y <= i; y++) {
                    for (var z = -i; z <= i; z++) {
                        if (!odw[`${x}:${y}:${z}`]) {
                            odw[`${x}:${y}:${z}`] = true;
                            var pchunk = [
                                chunk[0] + x,
                                chunk[1] + y,
                                chunk[2] + z,
                            ];
                            var chunkId = this.chunkTerrain.vec3(...pchunk);
                            chunkBlackList[chunkId] = false;
                            var gen = false;
                            if (this.chunkNeedsUpdate[chunkId]) {
                                delete terrain.chunkNeedsUpdate[chunkId];
                                this.genChunkGeo(pchunk);
                                gen = true;
                            }
                            if (this.loadedMeshes[chunkId] === "disposed") {
                                if (!gen) {
                                    this.genChunkGeo(pchunk);
                                }
                            }
                            this.loadedMeshes[chunkId] = true;
                        }
                    }
                }
            }
        }
        for (k in chunkBlackList) {
            v = chunkBlackList[k];
            if (v === true) {
                this.loadedMeshes[k] = "disposed";
                postMessage({
                    type: "removeCell",
                    data: k,
                });
            }
        }
    }
}

addEventListener("message", function (e) {
    var type = e.data.type;
    var data = e.data.data;
    switch (type) {
        case "init":
            terrain = new TerrainManager(data);
            break;
        case "setVoxel":
            terrain.setVoxel(data);
            break;
        case "genChunkGeo":
            terrain.genChunkGeo(data);
            break;
        case "setChunk":
            terrain.setChunk(data);
            break;
        case "resetWorld":
            console.log("RESET WORLD!");
            terrain.chunkTerrain.reset();
            break;
        case "updateChunksAroundPlayer":
            terrain.updateChunksAroundPlayer(data);
            break;
    }
});
