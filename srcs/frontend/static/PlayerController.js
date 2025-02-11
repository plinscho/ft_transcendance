import * as THREE from 'three';

export class PlayerController {
    constructor(playerMesh, isMultiplayer , networkManager = null) {

        this.playerMesh = playerMesh;
        this.isMultiplayer = isMultiplayer;
        this.networkManager = networkManager;

        this.speed = 0.5;
        
        if (this.isMultiplayer) {
            this.setupMultiplayer();
        } else {
            this.setupAI();
        }
    }

    setupAI() {

    }

    setupMultiplayer() {
        this.networkManager.onMessage((data) => {
            if (data.type === "PLAYER_MOVE") {
                this.playerMesh.position.set(data.x, data.y, data.z);
            }
        });
    }

    sendMovement() {
        this.networkManager.sendMessage({
            type: "PLAYER_MOVE",
            x: this.playerMesh.position.x,
            y: this.playerMesh.position.y,
            z: this.playerMesh.position.z,
        });
    }

    getNetworkMovement() {
        this.networkManager.onMessage((data) => {
            if (data.type === "PLAYER_MOVE") {
                this.playerMesh.position.set(data.x, data.y, data.z);
            }
        });
    }

}