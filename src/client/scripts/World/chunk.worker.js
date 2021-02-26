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
                        if (
                            _this.cellTerrain.getBlock(
                                pos[0] + x,
                                pos[1] + y,
                                pos[2] + z
                            ).boundingBox === "block"
                        ) {
                            loaded[`${x}:${y}:${z}`] = 1;
                        } else {
                            loaded[`${x}:${y}:${z}`] = 0;
                        }
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
                    if (
                        this.cellTerrain.getBlock(...pos).boundingBox ===
                        "block"
                    ) {
                        for (let l in this.neighbours) {
                            let m = this.neighbours[l];
                            if (this.cellTerrain.getBlock(...pos).transparent) {
                                if (
                                    this.cellTerrain.getBlock(
                                        pos[0] + m[0],
                                        pos[1] + m[1],
                                        pos[2] + m[2]
                                    ).boundingBox !== "block"
                                ) {
                                    addFace(l, pos);
                                }
                            } else {
                                if (
                                    this.cellTerrain.getBlock(
                                        pos[0] + m[0],
                                        pos[1] + m[1],
                                        pos[2] + m[2]
                                    ).boundingBox !== "block" ||
                                    this.cellTerrain.getBlock(
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
                        this.cellTerrain.getBlock(...pos).name === "water" ||
                        this.cellTerrain.getBlock(...pos).name === "lava"
                    ) {
                        for (var l in this.neighbours) {
                            let m = this.neighbours[l];
                            if (
                                this.cellTerrain.getBlock(
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
};

var handlers = {
    init: function (data) {
        terrain = new TerrainManager({
            models: data.models,
            blocks: data.blocks,
            blocksMapping: data.blocksMapping,
            toxelSize: data.toxelSize,
            cellSize: data.cellSize,
            blocksTex: data.blocksTex,
            blocksDef: data.blocksDef,
        });
    },
    setVoxel: function (data) {
        var cellId, l, len, nei, neiCellId, neighbours;
        terrain.cellTerrain.setVoxel(...data);
        cellId = terrain.cellTerrain.vec3(
            ...terrain.cellTerrain.computeCellForVoxel(
                data[0],
                data[1],
                data[2]
            )
        );
        terrain.cellNeedsUpdate[cellId] = true;
        neighbours = [
            [-1, 0, 0],
            [1, 0, 0],
            [0, -1, 0],
            [0, 1, 0],
            [0, 0, -1],
            [0, 0, 1],
        ];
        for (l = 0, len = neighbours.length; l < len; l++) {
            nei = neighbours[l];
            neiCellId = terrain.cellTerrain.vec3(
                ...terrain.cellTerrain.computeCellForVoxel(
                    data[0] + nei[0],
                    data[1] + nei[1],
                    data[2] + nei[2]
                )
            );
            terrain.cellNeedsUpdate[neiCellId] = true;
        }
    },
    genCellGeo: function (data) {
        if (
            terrain.cellTerrain.vec3(...data) in terrain.cellTerrain.cells ===
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
    },
    setCell: function (data) {
        var neighbours = [
            [-1, 0, 0],
            [1, 0, 0],
            [0, -1, 0],
            [0, 1, 0],
            [0, 0, -1],
            [0, 0, 1],
        ];
        terrain.cellNeedsUpdate[
            terrain.cellTerrain.vec3(data[0], data[1], data[2])
        ] = true;
        terrain.cellTerrain.setCell(data[0], data[1], data[2], data[3]);
        for (var l = 0; l < neighbours.length; l++) {
            var nei = neighbours[l];
            var neiCellId = terrain.cellTerrain.vec3(
                data[0] + nei[0],
                data[1] + nei[1],
                data[2] + nei[2]
            );
            terrain.cellNeedsUpdate[neiCellId] = true;
        }
    },
    resetWorld: function () {
        console.log("RESET WORLD!");
        terrain.cellTerrain.cells = {};
    },
    updateCellsAroundPlayer: function (data) {
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
                            var pcell = [cell[0] + x, cell[1] + y, cell[2] + z];
                            var cellId = terrain.cellTerrain.vec3(...pcell);
                            cellBlackList[cellId] = false;
                            var gen = false;
                            if (terrain.cellNeedsUpdate[cellId]) {
                                delete terrain.cellNeedsUpdate[cellId];
                                handlers.genCellGeo(pcell);
                                gen = true;
                            }
                            if (terrain.loadedMeshes[cellId] === "disposed") {
                                if (!gen) {
                                    handlers.genCellGeo(pcell);
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
    },
};

addEventListener("message", function (e) {
    var fn = handlers[e.data.type];
    if (!fn) {
        throw new Error(`no handler for type: ${e.data.type}`);
    }
    fn(e.data.data);
});
