import * as THREE from "three";

var Entities = class Entities {
    constructor(game) {
        this.game = game;
        this.mobMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color("red"),
        });
        this.mobGeometry = new THREE.BoxGeometry(1, 1, 1);
        this.mobMaxCount = 200;
        this.mobMesh = new THREE.InstancedMesh(
            this.mobGeometry,
            this.mobMaterial,
            this.mobMaxCount
        );
        this.mobMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.game.scene.add(this.mobMesh);
        this.playerMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color("blue"),
        });
        this.playerGeometry = new THREE.BoxGeometry(1, 1, 1);
        this.playerMaxCount = 200;
        this.playerMesh = new THREE.InstancedMesh(
            this.playerGeometry,
            this.playerMaterial,
            this.playerMaxCount
        );
        this.playerMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.game.scene.add(this.playerMesh);
        this.dummy = new THREE.Object3D();
        return;
    }

    update(entities) {
        var offset = [-0.5, 16, -0.5];
        var num_mobs = 0;
        this.mobMesh.count = entities.mobs.length;
        num_mobs = 0;
        for (let i in entities.mobs) {
            this.dummy.position.set(
                entities.mobs[i][0] + offset[0],
                entities.mobs[i][1] + offset[1],
                entities.mobs[i][2] + offset[2]
            );
            this.dummy.updateMatrix();
            this.mobMesh.setMatrixAt(num_mobs++, this.dummy.matrix);
        }
        this.mobMesh.instanceMatrix.needsUpdate = true;
        var num_players = 0;
        for (let i in entities.players) {
            if (entities.players[i][0] !== this.game.nick) {
                num_players++;
            }
        }
        this.playerMesh.count = num_players;
        num_players = 0;
        for (let i in entities.players) {
            if (entities.players[i][0] !== this.game.nick) {
                this.dummy.position.set(
                    entities.players[i][1] + offset[0],
                    entities.players[i][2] + offset[1],
                    entities.players[i][3] + offset[2]
                );
                this.dummy.updateMatrix();
                this.playerMesh.setMatrixAt(num_players++, this.dummy.matrix);
            }
        }
        this.playerMesh.instanceMatrix.needsUpdate = true;
    }
};

export { Entities };
