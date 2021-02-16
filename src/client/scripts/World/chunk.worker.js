var TerrainManager, handlers, terrain;

import { CellTerrain } from "./CellTerrain.js";

terrain = null;

TerrainManager = class TerrainManager {
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
    }

    genBlockFace(type, block, pos) {
        var mapka, toxX, toxY, uv, x1, x2, xd, y1, y2;
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
                mapka = {
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
        x1 = this.q * toxX;
        y1 = 1 - this.q * toxY - this.q;
        x2 = this.q * toxX + this.q;
        y2 = 1 - this.q * toxY;
        uv = [
            [x1, y1],
            [x1, y2],
            [x2, y1],
            [x2, y2],
        ];
        switch (type) {
            case "pz":
                return {
                    pos: [
                        -0.5 + pos[0],
                        -0.5 + pos[1],
                        0.5 + pos[2],
                        0.5 + pos[0],
                        -0.5 + pos[1],
                        0.5 + pos[2],
                        -0.5 + pos[0],
                        0.5 + pos[1],
                        0.5 + pos[2],
                        -0.5 + pos[0],
                        0.5 + pos[1],
                        0.5 + pos[2],
                        0.5 + pos[0],
                        -0.5 + pos[1],
                        0.5 + pos[2],
                        0.5 + pos[0],
                        0.5 + pos[1],
                        0.5 + pos[2],
                    ],
                    norm: [
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
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
                        0.5 + pos[0],
                        -0.5 + pos[1],
                        0.5 + pos[2],
                        0.5 + pos[0],
                        -0.5 + pos[1],
                        -0.5 + pos[2],
                        0.5 + pos[0],
                        0.5 + pos[1],
                        0.5 + pos[2],
                        0.5 + pos[0],
                        0.5 + pos[1],
                        0.5 + pos[2],
                        0.5 + pos[0],
                        -0.5 + pos[1],
                        -0.5 + pos[2],
                        0.5 + pos[0],
                        0.5 + pos[1],
                        -0.5 + pos[2],
                    ],
                    norm: [
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
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
                        0.5 + pos[0],
                        -0.5 + pos[1],
                        -0.5 + pos[2],
                        -0.5 + pos[0],
                        -0.5 + pos[1],
                        -0.5 + pos[2],
                        0.5 + pos[0],
                        0.5 + pos[1],
                        -0.5 + pos[2],
                        0.5 + pos[0],
                        0.5 + pos[1],
                        -0.5 + pos[2],
                        -0.5 + pos[0],
                        -0.5 + pos[1],
                        -0.5 + pos[2],
                        -0.5 + pos[0],
                        0.5 + pos[1],
                        -0.5 + pos[2],
                    ],
                    norm: [
                        0,
                        0,
                        -1,
                        0,
                        0,
                        -1,
                        0,
                        0,
                        -1,
                        0,
                        0,
                        -1,
                        0,
                        0,
                        -1,
                        0,
                        0,
                        -1,
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
                        -0.5 + pos[0],
                        -0.5 + pos[1],
                        -0.5 + pos[2],
                        -0.5 + pos[0],
                        -0.5 + pos[1],
                        0.5 + pos[2],
                        -0.5 + pos[0],
                        0.5 + pos[1],
                        -0.5 + pos[2],
                        -0.5 + pos[0],
                        0.5 + pos[1],
                        -0.5 + pos[2],
                        -0.5 + pos[0],
                        -0.5 + pos[1],
                        0.5 + pos[2],
                        -0.5 + pos[0],
                        0.5 + pos[1],
                        0.5 + pos[2],
                    ],
                    norm: [
                        -1,
                        0,
                        0,
                        -1,
                        0,
                        0,
                        -1,
                        0,
                        0,
                        -1,
                        0,
                        0,
                        -1,
                        0,
                        0,
                        -1,
                        0,
                        0,
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
                        0.5 + pos[0],
                        0.5 + pos[1],
                        -0.5 + pos[2],
                        -0.5 + pos[0],
                        0.5 + pos[1],
                        -0.5 + pos[2],
                        0.5 + pos[0],
                        0.5 + pos[1],
                        0.5 + pos[2],
                        0.5 + pos[0],
                        0.5 + pos[1],
                        0.5 + pos[2],
                        -0.5 + pos[0],
                        0.5 + pos[1],
                        -0.5 + pos[2],
                        -0.5 + pos[0],
                        0.5 + pos[1],
                        0.5 + pos[2],
                    ],
                    norm: [
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
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
                        0.5 + pos[0],
                        -0.5 + pos[1],
                        0.5 + pos[2],
                        -0.5 + pos[0],
                        -0.5 + pos[1],
                        0.5 + pos[2],
                        0.5 + pos[0],
                        -0.5 + pos[1],
                        -0.5 + pos[2],
                        0.5 + pos[0],
                        -0.5 + pos[1],
                        -0.5 + pos[2],
                        -0.5 + pos[0],
                        -0.5 + pos[1],
                        0.5 + pos[2],
                        -0.5 + pos[0],
                        -0.5 + pos[1],
                        -0.5 + pos[2],
                    ],
                    norm: [
                        0,
                        -1,
                        0,
                        0,
                        -1,
                        0,
                        0,
                        -1,
                        0,
                        0,
                        -1,
                        0,
                        0,
                        -1,
                        0,
                        0,
                        -1,
                        0,
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
        var _this,
            addFace,
            aoColor,
            colors,
            i,
            j,
            k,
            l,
            m,
            n,
            normals,
            pos,
            positions,
            ref,
            ref1,
            ref2,
            t_colors,
            t_normals,
            t_positions,
            t_uvs,
            uvs;
        _this = this;
        positions = [];
        normals = [];
        uvs = [];
        colors = [];
        t_positions = [];
        t_normals = [];
        t_uvs = [];
        t_colors = [];
        aoColor = function (type) {
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
        addFace = function (type, pos) {
            var block,
                col1,
                col2,
                col3,
                col4,
                faceVertex,
                ile,
                l,
                loaded,
                m,
                n,
                x,
                y,
                z;
            block = _this.cellTerrain.getBlock(...pos);
            faceVertex = _this.genBlockFace(type, block, pos);
            // _this.cellTerrain.getBlock(pos[0],pos[1],pos[2])
            loaded = {};
            for (x = l = -1; l <= 1; x = ++l) {
                for (y = m = -1; m <= 1; y = ++m) {
                    for (z = n = -1; n <= 1; z = ++n) {
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
            col1 = aoColor(0);
            col2 = aoColor(0);
            col3 = aoColor(0);
            col4 = aoColor(0);
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
            if (block.name === "water") {
                ile = 4;
                col1[0] /= ile;
                col1[1] /= ile;
                col2[0] /= ile;
                col2[1] /= ile;
                col3[0] /= ile;
                col3[1] /= ile;
                col4[0] /= ile;
                col4[1] /= ile;
            } else if (block.name === "grass_block" && type === "py") {
                ile = 4;
                col1[0] /= ile;
                col1[2] /= ile;
                col2[0] /= ile;
                col2[2] /= ile;
                col3[0] /= ile;
                col3[2] /= ile;
                col4[0] /= ile;
                col4[2] /= ile;
            } else if (block.name.includes("leaves")) {
                ile = 4;
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
        for (
            i = l = 0, ref = this.cellSize - 1;
            0 <= ref ? l <= ref : l >= ref;
            i = 0 <= ref ? ++l : --l
        ) {
            for (
                j = m = 0, ref1 = this.cellSize - 1;
                0 <= ref1 ? m <= ref1 : m >= ref1;
                j = 0 <= ref1 ? ++m : --m
            ) {
                for (
                    k = n = 0, ref2 = this.cellSize - 1;
                    0 <= ref2 ? n <= ref2 : n >= ref2;
                    k = 0 <= ref2 ? ++n : --n
                ) {
                    pos = [
                        cellX * this.cellSize + i,
                        cellY * this.cellSize + j,
                        cellZ * this.cellSize + k,
                    ];
                    if (
                        this.cellTerrain.getBlock(...pos).boundingBox ===
                        "block"
                    ) {
                        if (this.cellTerrain.getBlock(...pos).transparent) {
                            if (
                                this.cellTerrain.getBlock(
                                    pos[0] + 1,
                                    pos[1],
                                    pos[2]
                                ).boundingBox !== "block"
                            ) {
                                addFace("nx", pos);
                            }
                            if (
                                this.cellTerrain.getBlock(
                                    pos[0] - 1,
                                    pos[1],
                                    pos[2]
                                ).boundingBox !== "block"
                            ) {
                                addFace("px", pos);
                            }
                            if (
                                this.cellTerrain.getBlock(
                                    pos[0],
                                    pos[1] - 1,
                                    pos[2]
                                ).boundingBox !== "block"
                            ) {
                                addFace("ny", pos);
                            }
                            if (
                                this.cellTerrain.getBlock(
                                    pos[0],
                                    pos[1] + 1,
                                    pos[2]
                                ).boundingBox !== "block"
                            ) {
                                addFace("py", pos);
                            }
                            if (
                                this.cellTerrain.getBlock(
                                    pos[0],
                                    pos[1],
                                    pos[2] + 1
                                ).boundingBox !== "block"
                            ) {
                                addFace("pz", pos);
                            }
                            if (
                                this.cellTerrain.getBlock(
                                    pos[0],
                                    pos[1],
                                    pos[2] - 1
                                ).boundingBox !== "block"
                            ) {
                                addFace("nz", pos);
                            }
                        } else {
                            if (
                                this.cellTerrain.getBlock(
                                    pos[0] + 1,
                                    pos[1],
                                    pos[2]
                                ).boundingBox !== "block" ||
                                this.cellTerrain.getBlock(
                                    pos[0] + 1,
                                    pos[1],
                                    pos[2]
                                ).transparent
                            ) {
                                addFace("nx", pos);
                            }
                            if (
                                this.cellTerrain.getBlock(
                                    pos[0] - 1,
                                    pos[1],
                                    pos[2]
                                ).boundingBox !== "block" ||
                                this.cellTerrain.getBlock(
                                    pos[0] - 1,
                                    pos[1],
                                    pos[2]
                                ).transparent
                            ) {
                                addFace("px", pos);
                            }
                            if (
                                this.cellTerrain.getBlock(
                                    pos[0],
                                    pos[1] - 1,
                                    pos[2]
                                ).boundingBox !== "block" ||
                                this.cellTerrain.getBlock(
                                    pos[0],
                                    pos[1] - 1,
                                    pos[2]
                                ).transparent
                            ) {
                                addFace("ny", pos);
                            }
                            if (
                                this.cellTerrain.getBlock(
                                    pos[0],
                                    pos[1] + 1,
                                    pos[2]
                                ).boundingBox !== "block" ||
                                this.cellTerrain.getBlock(
                                    pos[0],
                                    pos[1] + 1,
                                    pos[2]
                                ).transparent
                            ) {
                                addFace("py", pos);
                            }
                            if (
                                this.cellTerrain.getBlock(
                                    pos[0],
                                    pos[1],
                                    pos[2] + 1
                                ).boundingBox !== "block" ||
                                this.cellTerrain.getBlock(
                                    pos[0],
                                    pos[1],
                                    pos[2] + 1
                                ).transparent
                            ) {
                                addFace("pz", pos);
                            }
                            if (
                                this.cellTerrain.getBlock(
                                    pos[0],
                                    pos[1],
                                    pos[2] - 1
                                ).boundingBox !== "block" ||
                                this.cellTerrain.getBlock(
                                    pos[0],
                                    pos[1],
                                    pos[2] - 1
                                ).transparent
                            ) {
                                addFace("nz", pos);
                            }
                        }
                    } else if (
                        this.cellTerrain.getBlock(...pos).name === "water" ||
                        this.cellTerrain.getBlock(...pos).name === "lava"
                    ) {
                        if (
                            this.cellTerrain.getBlock(
                                pos[0] + 1,
                                pos[1],
                                pos[2]
                            ).name === "air"
                        ) {
                            addFace("nx", pos);
                        }
                        if (
                            this.cellTerrain.getBlock(
                                pos[0] - 1,
                                pos[1],
                                pos[2]
                            ).name === "air"
                        ) {
                            addFace("px", pos);
                        }
                        if (
                            this.cellTerrain.getBlock(
                                pos[0],
                                pos[1] - 1,
                                pos[2]
                            ).name === "air"
                        ) {
                            addFace("ny", pos);
                        }
                        if (
                            this.cellTerrain.getBlock(
                                pos[0],
                                pos[1] + 1,
                                pos[2]
                            ).name === "air"
                        ) {
                            addFace("py", pos);
                        }
                        if (
                            this.cellTerrain.getBlock(
                                pos[0],
                                pos[1],
                                pos[2] + 1
                            ).name === "air"
                        ) {
                            addFace("pz", pos);
                        }
                        if (
                            this.cellTerrain.getBlock(
                                pos[0],
                                pos[1],
                                pos[2] - 1
                            ).name === "air"
                        ) {
                            addFace("nz", pos);
                        }
                    }
                }
            }
        }
        positions.push(...t_positions);
        normals.push(...t_normals);
        uvs.push(...t_uvs);
        colors.push(...t_colors);
        return { positions, normals, uvs, colors };
    }
};

handlers = {
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
        //TODO: cellNeedsUpdate update
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
        var geo;
        if (
            terrain.cellTerrain.vec3(...data) in terrain.cellTerrain.cells ===
            true
        ) {
            geo = terrain.genCellGeo(...data);
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
        var l, len, nei, neiCellId, neighbours;
        neighbours = [
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
        for (l = 0, len = neighbours.length; l < len; l++) {
            nei = neighbours[l];
            neiCellId = terrain.cellTerrain.vec3(
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
        var cell,
            cellBlackList,
            cellId,
            gen,
            i,
            k,
            l,
            m,
            n,
            o,
            odw,
            pcell,
            radius,
            ref,
            ref1,
            ref2,
            ref3,
            ref4,
            ref5,
            ref6,
            ref7,
            v,
            x,
            y,
            z;
        cell = data[0];
        radius = data[1];
        odw = {};
        cellBlackList = {};
        ref = terrain.loadedMeshes;
        for (k in ref) {
            v = ref[k];
            if (v === true) {
                cellBlackList[k] = true;
            }
        }
        for (
            i = l = 0, ref1 = radius;
            0 <= ref1 ? l <= ref1 : l >= ref1;
            i = 0 <= ref1 ? ++l : --l
        ) {
            for (
                x = m = ref2 = -i, ref3 = i;
                ref2 <= ref3 ? m <= ref3 : m >= ref3;
                x = ref2 <= ref3 ? ++m : --m
            ) {
                for (
                    y = n = ref4 = -i, ref5 = i;
                    ref4 <= ref5 ? n <= ref5 : n >= ref5;
                    y = ref4 <= ref5 ? ++n : --n
                ) {
                    for (
                        z = o = ref6 = -i, ref7 = i;
                        ref6 <= ref7 ? o <= ref7 : o >= ref7;
                        z = ref6 <= ref7 ? ++o : --o
                    ) {
                        if (!odw[`${x}:${y}:${z}`]) {
                            odw[`${x}:${y}:${z}`] = true;
                            pcell = [cell[0] + x, cell[1] + y, cell[2] + z];
                            cellId = terrain.cellTerrain.vec3(...pcell);
                            cellBlackList[cellId] = false;
                            gen = false;
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
    var fn;
    fn = handlers[e.data.type];
    if (!fn) {
        throw new Error(`no handler for type: ${e.data.type}`);
    }
    fn(e.data.data);
});
