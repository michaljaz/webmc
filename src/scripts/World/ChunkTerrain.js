var modulo = function (a, b) {
    return ((+a % (b = +b)) + b) % b;
};

class ChunkTerrain {
    constructor(options) {
        this.chunkSize = 16;
        this.chunks = {};
        this.blocksDef = options.blocksDef;
        this.neighbours = {
            px: [-1, 0, 0],
            nx: [1, 0, 0],
            ny: [0, -1, 0],
            py: [0, 1, 0],
            pz: [0, 0, 1],
            nz: [0, 0, -1],
        };
    }

    vecToStr(x, y, z) {
        return `${parseInt(x)}:${parseInt(y)}:${parseInt(z)}`;
    }

    strToVec(str) {
        str = str.split(":");
        return [parseInt(str[0]), parseInt(str[1]), parseInt(str[2])];
    }

    computeVoxelOffset(voxelX, voxelY, voxelZ) {
        var x = modulo(voxelX, this.chunkSize) | 0;
        var y = modulo(voxelY, this.chunkSize) | 0;
        var z = modulo(voxelZ, this.chunkSize) | 0;
        return y * this.chunkSize * this.chunkSize + z * this.chunkSize + x;
    }

    computeChunkForVoxel(voxelX, voxelY, voxelZ) {
        return [
            Math.floor(voxelX / this.chunkSize),
            Math.floor(voxelY / this.chunkSize),
            Math.floor(voxelZ / this.chunkSize),
        ];
    }

    addChunkForVoxel(voxelX, voxelY, voxelZ) {
        var cellId = this.vecToStr(
            ...this.computeChunkForVoxel(voxelX, voxelY, voxelZ)
        );
        var cell = this.chunks[cellId];
        if (!cell) {
            cell = new Uint32Array(
                this.chunkSize * this.chunkSize * this.chunkSize
            );
            this.chunks[cellId] = cell;
        }
        return cell;
    }

    getChunkForVoxel(voxelX, voxelY, voxelZ) {
        var cellId = this.vecToStr(
            ...this.computeChunkForVoxel(voxelX, voxelY, voxelZ)
        );
        return this.chunks[cellId];
    }

    setVoxel(voxelX, voxelY, voxelZ, value) {
        var cell = this.getChunkForVoxel(voxelX, voxelY, voxelZ);
        if (!cell) {
            cell = this.addChunkForVoxel(voxelX, voxelY, voxelZ);
        }
        var voff = this.computeVoxelOffset(voxelX, voxelY, voxelZ);
        cell[voff] = value;
    }

    getVoxel(voxelX, voxelY, voxelZ) {
        var cell = this.getChunkForVoxel(voxelX, voxelY, voxelZ);
        if (!cell) {
            return 0;
        }
        var voff = this.computeVoxelOffset(voxelX, voxelY, voxelZ);
        return cell[voff];
    }

    setChunk(chunkX, chunkY, chunkZ, buffer) {
        this.chunks[this.vecToStr(chunkX, chunkY, chunkZ)] = buffer;
    }

    getBlock(blockX, blockY, blockZ) {
        var stateId = this.getVoxel(blockX, blockY, blockZ);
        var def = this.blocksDef[stateId];
        if (def !== void 0) {
            return {
                name: def[0],
                stateId,
                boundingBox: def[1] === 1 ? "block" : "empty",
                transparent: def[2],
            };
        } else {
            return false;
        }
    }

    getBlockNeighbours(blockX, blockY, blockZ) {
        let neighbours = {};
        let main = this.getBlock(blockX, blockY, blockZ);
        for (let side in this.neighbours) {
            let offset = this.neighbours[side];
            neighbours[side] = this.getBlock(
                blockX + offset[0],
                blockY + offset[1],
                blockZ + offset[2]
            );
        }
        return [main, neighbours];
    }

    reset() {
        this.chunks = {};
    }
}

export { ChunkTerrain };
