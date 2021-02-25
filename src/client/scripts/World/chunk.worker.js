import { CellTerrain } from "./CellTerrain.js";
var terrain = null;

var TerrainManager = class TerrainManager {
    constructor(options) {
        this.cellSize = options.cellSize;
        this.cellTerrain = new CellTerrain({
            cellSize: this.cellSize,
            blocksDef: options.blocksDef,
        });
        this.toxelSize = options.toxelSize;
        this.q = 1 / this.toxelSize;
        this.blocksMapping = options.blocksMapping;
        this.blocksTex = options.blocksTex;
        this.cellNeedsUpdate = {};
        this.loadedMeshes = {};
        this.undefinedBlock = "black_shulker_box";
        this.neighbours = {
            px: [-1, 0, 0],
            nx: [1, 0, 0],
            ny: [0, -1, 0],
            py: [0, 1, 0],
            pz: [0, 0, 1],
            nz: [0, 0, -1],
        };
        this.chunkQueue = [];
        this.playerChunk = null;
    }

    genBlockFace(type, block, pos) {
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
        var uv = [
            [x1, y1],
            [x1, y2],
            [x2, y1],
            [x2, y2],
        ];
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

    genCellGeo(cellX, cellY, cellZ) {
        var _this = this;
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
        var addFace = function (type, pos) {
            var block = _this.cellTerrain.getBlock(...pos);
            var faceVertex = _this.genBlockFace(type, block, pos);
            var loaded = {};
            for (var x = -1; x <= 1; x++) {
                for (var y = -1; y <= 1; y++) {
                    for (var z = -1; z <= 1; z++) {
                        loaded[`${x}:${y}:${z}`] =
                            _this.cellTerrain.getBlock(
                                pos[0] + x,
                                pos[1] + y,
                                pos[2] + z
                            ).boundingBox === "block"
                                ? 1
                                : 0;
                    }
                }
            }
            var aoMap = {
                py: [
                    [1, 1, -1, 0, 1, -1, 1, 1, 0],
                    [1, 1, 1, 0, 1, 1, 1, 1, 0],
                    [-1, 1, -1, 0, 1, -1, -1, 1, 0],
                    [-1, 1, 1, 0, 1, 1, -1, 1, 0],
                ],
                ny: [
                    [1, -1, 1, 0, -1, 1, 1, -1, 0],
                    [1, -1, -1, 0, -1, -1, 1, -1, 0],
                    [-1, -1, 1, 0, -1, 1, -1, -1, 0],
                    [-1, -1, -1, 0, -1, -1, -1, -1, 0],
                ],
                px: [
                    [-1, -1, 0, -1, -1, -1, -1, 0, -1],
                    [-1, 1, 0, -1, 1, -1, -1, 0, -1],
                    [-1, -1, 0, -1, -1, 1, -1, 0, 1],
                    [-1, 1, 0, -1, 1, 1, -1, 0, 1],
                ],
                nx: [
                    [1, -1, 0, 1, -1, 1, 1, 0, 1],
                    [1, 1, 0, 1, 1, 1, 1, 0, 1],
                    [1, -1, 0, 1, -1, -1, 1, 0, -1],
                    [1, 1, 0, 1, 1, -1, 1, 0, -1],
                ],
                pz: [
                    [0, -1, 1, -1, -1, 1, -1, 0, 1],
                    [0, 1, 1, -1, 1, 1, -1, 0, 1],
                    [0, -1, 1, 1, -1, 1, 1, 0, 1],
                    [0, 1, 1, 1, 1, 1, 1, 0, 1],
                ],
                nz: [
                    [0, -1, -1, 1, -1, -1, 1, 0, -1],
                    [0, 1, -1, 1, 1, -1, 1, 0, -1],
                    [0, -1, -1, -1, -1, -1, -1, 0, -1],
                    [0, 1, -1, -1, 1, -1, -1, 0, -1],
                ],
            };
            var c1 = aoMap[type];
            var num = 0;
            var col1 = aoColor(
                loaded[`${c1[num][0]}:${c1[num][1]}:${c1[num][2]}`] +
                    loaded[`${c1[num][3]}:${c1[num][4]}:${c1[num][5]}`] +
                    loaded[`${c1[num][6]}:${c1[num][7]}:${c1[num][8]}`]
            );
            num = 1;
            var col2 = aoColor(
                loaded[`${c1[num][0]}:${c1[num][1]}:${c1[num][2]}`] +
                    loaded[`${c1[num][3]}:${c1[num][4]}:${c1[num][5]}`] +
                    loaded[`${c1[num][6]}:${c1[num][7]}:${c1[num][8]}`]
            );
            num = 2;
            var col3 = aoColor(
                loaded[`${c1[num][0]}:${c1[num][1]}:${c1[num][2]}`] +
                    loaded[`${c1[num][3]}:${c1[num][4]}:${c1[num][5]}`] +
                    loaded[`${c1[num][6]}:${c1[num][7]}:${c1[num][8]}`]
            );
            num = 3;
            var col4 = aoColor(
                loaded[`${c1[num][0]}:${c1[num][1]}:${c1[num][2]}`] +
                    loaded[`${c1[num][3]}:${c1[num][4]}:${c1[num][5]}`] +
                    loaded[`${c1[num][6]}:${c1[num][7]}:${c1[num][8]}`]
            );
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
            if (_this.cellTerrain.getBlock(...pos).transparent) {
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
                    var mainBlock = this.cellTerrain.getBlock(...pos);
                    for (let l in this.neighbours) {
                        let m = this.neighbours[l];
                        var neiBlock = this.cellTerrain.getBlock(
                            pos[0] + m[0],
                            pos[1] + m[1],
                            pos[2] + m[2]
                        );
                        if (mainBlock.boundingBox === "block") {
                            if (
                                mainBlock.transparent &&
                                neiBlock.boundingBox !== "block"
                            ) {
                                addFace(l, pos);
                            } else if (
                                neiBlock.boundingBox !== "block" ||
                                neiBlock.transparent
                            ) {
                                addFace(l, pos);
                            }
                        } else if (
                            (mainBlock.name === "water" ||
                                mainBlock.name === "lava") &&
                            neiBlock.name === "air"
                        ) {
                            addFace(l, pos);
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
};

var handler = function (msg) {
    var data = msg.data.data;
    let neighbours = [
        [-1, 0, 0],
        [1, 0, 0],
        [0, -1, 0],
        [0, 1, 0],
        [0, 0, -1],
        [0, 0, 1],
    ];
    switch (msg.data.type) {
        case "init":
            terrain = new TerrainManager({
                models: data.models,
                blocks: data.blocks,
                blocksMapping: data.blocksMapping,
                toxelSize: data.toxelSize,
                cellSize: data.cellSize,
                blocksTex: data.blocksTex,
                blocksDef: data.blocksDef,
            });
            break;
        case "setVoxel":
            terrain.cellTerrain.setVoxel(...data);
            var cellId = terrain.cellTerrain.vec3(
                ...terrain.cellTerrain.computeCellForVoxel(
                    data[0],
                    data[1],
                    data[2]
                )
            );
            terrain.cellNeedsUpdate[cellId] = true;

            for (let l = 0, len = neighbours.length; l < len; l++) {
                let nei = neighbours[l];
                let neiCellId = terrain.cellTerrain.vec3(
                    ...terrain.cellTerrain.computeCellForVoxel(
                        data[0] + nei[0],
                        data[1] + nei[1],
                        data[2] + nei[2]
                    )
                );
                terrain.cellNeedsUpdate[neiCellId] = true;
            }
            break;
        case "genCellGeo":
            if (
                terrain.cellTerrain.vec3(...data) in
                    terrain.cellTerrain.cells ===
                true
            ) {
                var geo = terrain.genCellGeo(...data);
                postMessage({
                    type: "cellGeo",
                    data: {
                        cell: geo,
                        info: data,
                        p: performance.now(),
                    },
                });
            }
            break;
        case "setCell":
            terrain.cellNeedsUpdate[
                terrain.cellTerrain.vec3(data[0], data[1], data[2])
            ] = true;
            terrain.cellTerrain.setCell(data[0], data[1], data[2], data[3]);
            for (let l = 0; l < neighbours.length; l++) {
                let nei = neighbours[l];
                let neiCellId = terrain.cellTerrain.vec3(
                    data[0] + nei[0],
                    data[1] + nei[1],
                    data[2] + nei[2]
                );
                terrain.cellNeedsUpdate[neiCellId] = true;
            }
            break;
        case "resetWorld":
            console.log("RESET WORLD!");
            terrain.cellTerrain.cells = {};
            break;
        case "updateCellsAroundPlayer":
            var cell = data[0];
            var radius = data[1];
            var odw = {};
            var cellBlackList = {};
            for (var k in terrain.loadedMeshes) {
                var v = terrain.loadedMeshes[k];
                if (v === true) {
                    cellBlackList[k] = true;
                }
            }
            for (var i = 0; i <= radius; i++) {
                for (var x = -i; x <= i; x++) {
                    for (var y = -i; y <= i; y++) {
                        for (var z = -i; z <= i; z++) {
                            if (!odw[`${x}:${y}:${z}`]) {
                                odw[`${x}:${y}:${z}`] = true;
                                var pcell = [
                                    cell[0] + x,
                                    cell[1] + y,
                                    cell[2] + z,
                                ];
                                cellId = terrain.cellTerrain.vec3(...pcell);
                                cellBlackList[cellId] = false;
                                var gen = false;
                                if (terrain.cellNeedsUpdate[cellId]) {
                                    delete terrain.cellNeedsUpdate[cellId];
                                    handler({
                                        data: {
                                            type: "genCellGeo",
                                            data: pcell,
                                        },
                                    });
                                    gen = true;
                                }
                                if (
                                    terrain.loadedMeshes[cellId] === "disposed"
                                ) {
                                    if (!gen) {
                                        handler({
                                            data: {
                                                type: "genCellGeo",
                                                data: pcell,
                                            },
                                        });
                                    }
                                }
                                terrain.loadedMeshes[cellId] = true;
                            }
                        }
                    }
                }
            }
            for (k in cellBlackList) {
                v = cellBlackList[k];
                if (v === true) {
                    terrain.loadedMeshes[k] = "disposed";
                    postMessage({
                        type: "removeCell",
                        data: k,
                    });
                }
            }
            break;
    }
};

addEventListener("message", handler);
