import { ChunkTerrain } from "./ChunkTerrain.js";
import { ChunkMesher } from "./ChunkMesher.js";
import vec3 from "vec3";

var terrain = null;

class TerrainManager {
    constructor(data) {
        this.chunkTerrain = new ChunkTerrain({
            blocksDef: data.blocksDef,
        });
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
        this.states = {
            needsUpdate: 0,
            disposed: 1,
        };
        this.chunkState = {};
        this.generatedChunks = {};
        this.renderRadius = 10;
        this.playerChunk = [0, 0, 0];
        this.loop();
    }

    distance(chunkId) {
        var data = this.chunkTerrain.strToVec(chunkId);
        var chunk = vec3(...data);
        var chunkP = vec3(...this.playerChunk);
        return chunkP.distanceTo(chunk);
    }

    setVoxel(data) {
        this.chunkTerrain.setVoxel(...data);
        var chunkId = this.chunkTerrain.vecToStr(
            ...terrain.chunkTerrain.computeChunkForVoxel(
                data[0],
                data[1],
                data[2]
            )
        );
        this.chunkState[chunkId] = this.states.needsUpdate;
        for (var l = 0; l < this.neighbours.length; l++) {
            var nei = this.neighbours[l];
            var neiChunkId = this.chunkTerrain.vecToStr(
                ...this.chunkTerrain.computeChunkForVoxel(
                    data[0] + nei[0],
                    data[1] + nei[1],
                    data[2] + nei[2]
                )
            );
            this.chunkState[neiChunkId] = this.states.needsUpdate;
        }
    }

    setChunk(data) {
        this.chunkTerrain.setChunk(data[0], data[1], data[2], data[3]);
        var chunkId = terrain.chunkTerrain.vecToStr(data[0], data[1], data[2]);
        this.chunkState[chunkId] = this.states.needsUpdate;
        for (var l = 0; l < this.neighbours.length; l++) {
            var nei = this.neighbours[l];
            var neiChunkId = this.chunkTerrain.vecToStr(
                data[0] + nei[0],
                data[1] + nei[1],
                data[2] + nei[2]
            );
            this.chunkState[neiChunkId] = this.states.needsUpdate;
        }
    }

    sortQueue() {
        this.chunkQueue.sort((a, b) => {
            var chunkA = vec3(...this.chunkTerrain.strToVec(a));
            var chunkB = vec3(...this.chunkTerrain.strToVec(b));
            var chunkP = vec3(...this.playerChunk);
            var roz1 = chunkP.distanceTo(chunkA);
            var roz2 = chunkP.distanceTo(chunkB);
            if (roz1 < roz2) {
                return -1;
            } else if (roz1 > roz2) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    genNearestChunk() {
        var nearestChunkId = "";
        var nearestDistance = -1;
        var isNearest = false;
        for (var chunkId in this.chunkState) {
            var dist = this.distance(chunkId);
            if (
                (nearestDistance === -1 || nearestDistance > dist) &&
                dist <= this.renderRadius
            ) {
                isNearest = true;
                nearestDistance = dist;
                nearestChunkId = chunkId;
            }
        }
        if (isNearest) {
            var data = this.chunkTerrain.strToVec(nearestChunkId);
            this.generatedChunks[nearestChunkId] = true;
            postMessage({
                type: "cellGeo",
                data: {
                    cell: this.chunkMesher.genChunkGeo(...data),
                    info: data,
                    p: performance.now(),
                },
            });
            delete this.chunkState[nearestChunkId];
        }
    }

    removeChunks() {
        for (var chunkId in this.generatedChunks) {
            var dist = this.distance(chunkId);
            if (dist > this.renderRadius) {
                delete this.generatedChunks[chunkId];
                this.chunkState[chunkId] = this.states.disposed;
                postMessage({
                    type: "removeCell",
                    data: chunkId,
                });
            }
        }
    }

    loop() {
        this.removeChunks();
        this.genNearestChunk();
        requestAnimationFrame(() => {
            this.loop();
        });
    }

    updateChunksAroundPlayer(data) {
        this.playerChunk = data[0];
        this.renderRadius = data[1];
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
