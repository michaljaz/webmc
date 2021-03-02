import * as THREE from "three";

export class Entities {
    constructor(game) {
        this.players = [];

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
        this.playerGeometry = this.game.al.get("player");
        this.playerGeometry.children[0].material.map = this.game.al.get("playerTex");


        this.dummy = new THREE.Object3D();
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


        for (let i = 0; i < entities.players.length; i++) {
            const playerData = entities.players[i];
            if (playerData[0] === this.game.nick)
                continue;

            let player = this.players[i];
            if (playerData[0] !== this.game.nick) {
                if (!player) {
                    player = this.game.al.get("player");
                    player.children[0].material.map = this.game.al.get("playerTex");
                    this.game.scene.add(player);
                }
            }
            player.position.set(
                playerData[1] + offset[0],
                playerData[2] + offset[1],
                playerData[3] + offset[2]
            );
        }
    }
};
