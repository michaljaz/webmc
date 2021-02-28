class ChunkMesher {
    constructor(options) {
        this.cellSize = 16;
        this.undefinedBlock = "black_shulker_box";
        this.blocksTex = options.blocksTex;
        this.blocksMapping = options.blocksMapping;
        this.chunkTerrain = options.chunkTerrain;
        this.toxelSize = options.toxelSize;
        this.q = 1 / this.toxelSize;
        this.neighbours = {
            px: [-1, 0, 0],
            nx: [1, 0, 0],
            ny: [0, -1, 0],
            py: [0, 1, 0],
            pz: [0, 0, 1],
            nz: [0, 0, -1],
        };
    }

    getUvForFace(block, type) {
        var xd, toxX, toxY;
        if (
            this.blocksTex[block.name] !== void 0 ||
            this.blocksTex[String(block.stateId)] !== void 0
        ) {
            if (this.blocksTex[String(block.stateId)] !== void 0) {
                xd = this.blocksTex[String(block.stateId)];
            } else {
                xd = this.blocksTex[block.name];
            }
            if (xd["all"] !== void 0) {
                toxX = this.blocksMapping[xd.all]["x"];
                toxY = this.blocksMapping[xd.all]["y"];
            } else if (xd["side"] !== void 0) {
                var mapka = {
                    py: "top",
                    ny: "bottom",
                };
                if (mapka[type] !== void 0) {
                    toxX = this.blocksMapping[xd[mapka[type]]]["x"];
                    toxY = this.blocksMapping[xd[mapka[type]]]["y"];
                } else {
                    toxX = this.blocksMapping[xd["side"]]["x"];
                    toxY = this.blocksMapping[xd["side"]]["y"];
                }
            } else {
                toxX = this.blocksMapping[xd[type]]["x"];
                toxY = this.blocksMapping[xd[type]]["y"];
            }
        } else if (block.name === "water") {
            toxX = this.blocksMapping["water_flow"]["x"];
            toxY = this.blocksMapping["water_flow"]["y"];
        } else if (block.name === "lava") {
            toxX = this.blocksMapping["lava_flow"]["x"];
            toxY = this.blocksMapping["lava_flow"]["y"];
        } else if (this.blocksMapping[block.name]) {
            toxX = this.blocksMapping[block.name]["x"];
            toxY = this.blocksMapping[block.name]["y"];
        } else {
            toxX = this.blocksMapping[this.undefinedBlock]["x"];
            toxY = this.blocksMapping[this.undefinedBlock]["y"];
        }
        toxX -= 1;
        toxY -= 1;
        var x1 = this.q * toxX;
        var y1 = 1 - this.q * toxY - this.q;
        var x2 = this.q * toxX + this.q;
        var y2 = 1 - this.q * toxY;
        return [
            [x1, y1],
            [x1, y2],
            [x2, y1],
            [x2, y2],
        ];
    }

    genBlockFace(type, block, pos) {
        var uv = this.getUvForFace(block, type);
        // prettier-ignore
        switch (type) {
            case "pz":
                return {
                    pos: [
                        -0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
                        0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
                        -0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2],
                        -0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2],
                        0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
                        0.5 + pos[0],0.5 + pos[1], 0.5 + pos[2],
                    ],
                    norm: [
                        0, 0, 1,
                        0, 0, 1,
                        0, 0, 1,
                        0, 0, 1,
                        0, 0, 1,
                        0, 0, 1,
                    ],
                    uv: [
                        ...uv[0],
                        ...uv[2],
                        ...uv[1],
                        ...uv[1],
                        ...uv[2],
                        ...uv[3],
                    ],
                };
            case "nx":
                return {
                    pos: [
                        0.5 + pos[0], -0.5 + pos[1],0.5 + pos[2],
                        0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
                        0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2],
                        0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2],
                        0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
                        0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
                    ],
                    norm: [
                        1, 0, 0,
                        1, 0, 0,
                        1, 0, 0,
                        1, 0, 0,
                        1, 0, 0,
                        1, 0, 0,
                    ],
                    uv: [
                        ...uv[0],
                        ...uv[2],
                        ...uv[1],
                        ...uv[1],
                        ...uv[2],
                        ...uv[3],
                    ],
                };
            case "nz":
                return {
                    pos: [
                        0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
                        -0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
                        0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
                        0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
                        -0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
                        -0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
                    ],
                    norm: [
                        0, 0, -1,
                        0, 0, -1,
                        0, 0, -1,
                        0, 0, -1,
                        0, 0, -1,
                        0, 0, -1,
                    ],
                    uv: [
                        ...uv[0],
                        ...uv[2],
                        ...uv[1],
                        ...uv[1],
                        ...uv[2],
                        ...uv[3],
                    ],
                };
            case "px":
                return {
                    pos: [
                        -0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
                        -0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
                        -0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
                        -0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
                        -0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
                        -0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2],
                    ],
                    norm: [
                        -1, 0, 0,
                        -1, 0, 0,
                        -1, 0, 0,
                        -1, 0, 0,
                        -1, 0, 0,
                        -1, 0, 0,
                    ],
                    uv: [
                        ...uv[0],
                        ...uv[2],
                        ...uv[1],
                        ...uv[1],
                        ...uv[2],
                        ...uv[3],
                    ],
                };
            case "py":
                return {
                    pos: [
                        0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
                        -0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
                        0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2],
                        0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2],
                        -0.5 + pos[0], 0.5 + pos[1], -0.5 + pos[2],
                        -0.5 + pos[0], 0.5 + pos[1], 0.5 + pos[2],
                    ],
                    norm: [
                        0, 1, 0,
                        0, 1, 0,
                        0, 1, 0,
                        0, 1, 0,
                        0, 1, 0,
                        0, 1, 0,
                    ],
                    uv: [
                        ...uv[0],
                        ...uv[2],
                        ...uv[1],
                        ...uv[1],
                        ...uv[2],
                        ...uv[3],
                    ],
                };
            case "ny":
                return {
                    pos: [
                        0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
                        -0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
                        0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
                        0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
                        -0.5 + pos[0], -0.5 + pos[1], 0.5 + pos[2],
                        -0.5 + pos[0], -0.5 + pos[1], -0.5 + pos[2],
                    ],
                    norm: [
                        0, -1, 0,
                        0, -1, 0,
                        0, -1, 0,
                        0, -1, 0,
                        0, -1, 0,
                        0, -1, 0,
                    ],
                    uv: [
                        ...uv[0],
                        ...uv[2],
                        ...uv[1],
                        ...uv[1],
                        ...uv[2],
                        ...uv[3],
                    ],
                };
        }
    }

    genChunkGeo(cellX, cellY, cellZ) {
        var positions = [];
        var normals = [];
        var uvs = [];
        var colors = [];
        var t_positions = [];
        var t_normals = [];
        var t_uvs = [];
        var t_colors = [];
        var aoColor = function (type) {
            if (type === 0) {
                return [0.9, 0.9, 0.9];
            } else if (type === 1) {
                return [0.7, 0.7, 0.7];
            } else if (type === 2) {
                return [0.5, 0.5, 0.5];
            } else {
                return [0.3, 0.3, 0.3];
            }
        };
        var addFace = (type, pos) => {
            var block = this.chunkTerrain.getBlock(...pos);
            var faceVertex = this.genBlockFace(type, block, pos);
            var loaded = {};
            for (var x = -1; x <= 1; x++) {
                for (var y = -1; y <= 1; y++) {
                    for (var z = -1; z <= 1; z++) {
                        loaded[`${x}:${y}:${z}`] =
                            this.chunkTerrain.getBlock(
                                pos[0] + x,
                                pos[1] + y,
                                pos[2] + z
                            ).boundingBox === "block"
                                ? 1
                                : 0;
                    }
                }
            }
            var col1 = aoColor(0);
            var col2 = aoColor(0);
            var col3 = aoColor(0);
            var col4 = aoColor(0);
            if (type === "py") {
                col1 = aoColor(
                    loaded["1:1:-1"] + loaded["0:1:-1"] + loaded["1:1:0"]
                );
                col2 = aoColor(
                    loaded["1:1:1"] + loaded["0:1:1"] + loaded["1:1:0"]
                );
                col3 = aoColor(
                    loaded["-1:1:-1"] + loaded["0:1:-1"] + loaded["-1:1:0"]
                );
                col4 = aoColor(
                    loaded["-1:1:1"] + loaded["0:1:1"] + loaded["-1:1:0"]
                );
            }
            if (type === "ny") {
                col2 = aoColor(
                    loaded["1:-1:-1"] + loaded["0:-1:-1"] + loaded["1:-1:0"]
                );
                col1 = aoColor(
                    loaded["1:-1:1"] + loaded["0:-1:1"] + loaded["1:-1:0"]
                );
                col4 = aoColor(
                    loaded["-1:-1:-1"] + loaded["0:-1:-1"] + loaded["-1:-1:0"]
                );
                col3 = aoColor(
                    loaded["-1:-1:1"] + loaded["0:-1:1"] + loaded["-1:-1:0"]
                );
            }
            if (type === "px") {
                col1 = aoColor(
                    loaded["-1:-1:0"] + loaded["-1:-1:-1"] + loaded["-1:0:-1"]
                );
                col2 = aoColor(
                    loaded["-1:1:0"] + loaded["-1:1:-1"] + loaded["-1:0:-1"]
                );
                col3 = aoColor(
                    loaded["-1:-1:0"] + loaded["-1:-1:1"] + loaded["-1:0:1"]
                );
                col4 = aoColor(
                    loaded["-1:1:0"] + loaded["-1:1:1"] + loaded["-1:0:1"]
                );
            }
            if (type === "nx") {
                col3 = aoColor(
                    loaded["1:-1:0"] + loaded["1:-1:-1"] + loaded["1:0:-1"]
                );
                col4 = aoColor(
                    loaded["1:1:0"] + loaded["1:1:-1"] + loaded["1:0:-1"]
                );
                col1 = aoColor(
                    loaded["1:-1:0"] + loaded["1:-1:1"] + loaded["1:0:1"]
                );
                col2 = aoColor(
                    loaded["1:1:0"] + loaded["1:1:1"] + loaded["1:0:1"]
                );
            }
            if (type === "pz") {
                col1 = aoColor(
                    loaded["0:-1:1"] + loaded["-1:-1:1"] + loaded["-1:0:1"]
                );
                col2 = aoColor(
                    loaded["0:1:1"] + loaded["-1:1:1"] + loaded["-1:0:1"]
                );
                col3 = aoColor(
                    loaded["0:-1:1"] + loaded["1:-1:1"] + loaded["1:0:1"]
                );
                col4 = aoColor(
                    loaded["0:1:1"] + loaded["1:1:1"] + loaded["1:0:1"]
                );
            }
            if (type === "nz") {
                col3 = aoColor(
                    loaded["0:-1:-1"] + loaded["-1:-1:-1"] + loaded["-1:0:-1"]
                );
                col4 = aoColor(
                    loaded["0:1:-1"] + loaded["-1:1:-1"] + loaded["-1:0:-1"]
                );
                col1 = aoColor(
                    loaded["0:-1:-1"] + loaded["1:-1:-1"] + loaded["1:0:-1"]
                );
                col2 = aoColor(
                    loaded["0:1:-1"] + loaded["1:1:-1"] + loaded["1:0:-1"]
                );
            }
            var ile = 4;
            if (block.name === "water") {
                col1[0] /= ile;
                col1[1] /= ile;
                col2[0] /= ile;
                col2[1] /= ile;
                col3[0] /= ile;
                col3[1] /= ile;
                col4[0] /= ile;
                col4[1] /= ile;
            } else if (block.name === "grass_block" && type === "py") {
                col1[0] /= ile;
                col1[2] /= ile;
                col2[0] /= ile;
                col2[2] /= ile;
                col3[0] /= ile;
                col3[2] /= ile;
                col4[0] /= ile;
                col4[2] /= ile;
            } else if (block.name.includes("leaves")) {
                col1[0] /= ile;
                col1[2] /= ile;
                col2[0] /= ile;
                col2[2] /= ile;
                col3[0] /= ile;
                col3[2] /= ile;
                col4[0] /= ile;
                col4[2] /= ile;
            }
            if (this.chunkTerrain.getBlock(...pos).transparent) {
                t_positions.push(...faceVertex.pos);
                t_normals.push(...faceVertex.norm);
                t_uvs.push(...faceVertex.uv);
                t_colors.push(
                    ...col1,
                    ...col3,
                    ...col2,
                    ...col2,
                    ...col3,
                    ...col4
                );
            } else {
                positions.push(...faceVertex.pos);
                normals.push(...faceVertex.norm);
                uvs.push(...faceVertex.uv);
                colors.push(
                    ...col1,
                    ...col3,
                    ...col2,
                    ...col2,
                    ...col3,
                    ...col4
                );
            }
        };
        for (var i = 0; i < this.cellSize; i++) {
            for (var j = 0; j < this.cellSize; j++) {
                for (var k = 0; k < this.cellSize; k++) {
                    var pos = [
                        cellX * this.cellSize + i,
                        cellY * this.cellSize + j,
                        cellZ * this.cellSize + k,
                    ];
                    if (
                        this.chunkTerrain.getBlock(...pos).boundingBox ===
                        "block"
                    ) {
                        for (let l in this.neighbours) {
                            let m = this.neighbours[l];
                            if (
                                this.chunkTerrain.getBlock(...pos).transparent
                            ) {
                                if (
                                    this.chunkTerrain.getBlock(
                                        pos[0] + m[0],
                                        pos[1] + m[1],
                                        pos[2] + m[2]
                                    ).boundingBox !== "block"
                                ) {
                                    addFace(l, pos);
                                }
                            } else {
                                if (
                                    this.chunkTerrain.getBlock(
                                        pos[0] + m[0],
                                        pos[1] + m[1],
                                        pos[2] + m[2]
                                    ).boundingBox !== "block" ||
                                    this.chunkTerrain.getBlock(
                                        pos[0] + m[0],
                                        pos[1] + m[1],
                                        pos[2] + m[2]
                                    ).transparent
                                ) {
                                    addFace(l, pos);
                                }
                            }
                        }
                    } else if (
                        this.chunkTerrain.getBlock(...pos).name === "water" ||
                        this.chunkTerrain.getBlock(...pos).name === "lava"
                    ) {
                        for (var l in this.neighbours) {
                            let m = this.neighbours[l];
                            if (
                                this.chunkTerrain.getBlock(
                                    pos[0] + m[0],
                                    pos[1] + m[1],
                                    pos[2] + m[2]
                                ).name === "air"
                            ) {
                                addFace(l, pos);
                            }
                        }
                    }
                }
            }
        }
        positions.push(...t_positions);
        normals.push(...t_normals);
        uvs.push(...t_uvs);
        colors.push(...t_colors);
        return {
            positions,
            normals,
            uvs,
            colors,
        };
    }
}

export { ChunkMesher };
