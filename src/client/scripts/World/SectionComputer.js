var modulo = function (a, b) {
    return ((+a % (b = +b)) + b) % b;
};

class BitArray {
    constructor(options) {
        if (options === null) {
            return;
        }
        if (!options.bitsPerValue > 0) {
            console.error("bits per value must at least 1");
        }
        if (!(options.bitsPerValue <= 32)) {
            console.error("bits per value exceeds 32");
        }
        let valuesPerLong = Math.floor(64 / options.bitsPerValue);
        let length = Math.ceil(options.capacity / valuesPerLong);
        if (!options.data) {
            options.data = Array(length * 2).fill(0);
        }
        let valueMask = (1 << options.bitsPerValue) - 1;
        this.data = options.data;
        this.capacity = options.capacity;
        this.bitsPerValue = options.bitsPerValue;
        this.valuesPerLong = valuesPerLong;
        this.valueMask = valueMask;
        return;
    }

    get(index) {
        if (!(index >= 0 && index < this.capacity)) {
            console.error("index is out of bounds");
        }
        var startLongIndex = Math.floor(index / this.valuesPerLong);
        var indexInLong =
            (index - startLongIndex * this.valuesPerLong) * this.bitsPerValue;
        if (indexInLong >= 32) {
            let indexInStartLong = indexInLong - 32;
            let startLong = this.data[startLongIndex * 2 + 1];
            return (startLong >>> indexInStartLong) & this.valueMask;
        }
        let startLong = this.data[startLongIndex * 2];
        let indexInStartLong = indexInLong;
        var result = startLong >>> indexInStartLong;
        var endBitOffset = indexInStartLong + this.bitsPerValue;
        if (endBitOffset > 32) {
            var endLong = this.data[startLongIndex * 2 + 1];
            result |= endLong << (32 - indexInStartLong);
        }
        return result & this.valueMask;
    }
}

var ChunkDecoder = class ChunkDecoder {
    getBlockIndex(pos) {
        return (pos.y << 8) | (pos.z << 4) | pos.x;
    }

    cvo(voxelX, voxelY, voxelZ) {
        var x, y, z;
        x = modulo(voxelX, 16) | 0;
        y = modulo(voxelY, 16) | 0;
        z = modulo(voxelZ, 16) | 0;
        return y * 16 * 16 + z * 16 + x;
    }

    computeSections(packet) {
        var sections = packet.sections;
        var num = 0;
        var result = [];
        for (var j = 0; j < sections.length; j++) {
            var i = sections[j];
            num += 1;
            if (i !== null) {
                var palette = i.palette;
                var data = new BitArray(i.data);
                var cell = new Uint32Array(16 * 16 * 16);
                for (var x = 0; x < 16; x++) {
                    for (var y = 0; y < 16; y++) {
                        for (var z = 0; z < 16; z++) {
                            cell[this.cvo(x, y, z)] =
                                palette[
                                    data.get(this.getBlockIndex({ x, y, z }))
                                ];
                        }
                    }
                }
                result.push({
                    x: packet.x,
                    y: num,
                    z: packet.z,
                    cell,
                });
            } else {
                result.push(null);
            }
        }
        return result;
    }
};

var cd = new ChunkDecoder();

var SectionComputer = function (data) {
    return cd.computeSections(data);
};

export { SectionComputer };
