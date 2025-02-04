import * as THREE from 'three';
import { Text3D } from './Text3D.js';
import { NetworkManager } from './NetworkManager.js';

export class WaitingRoom {
    constructor(state) {
        this.scene = new THREE.Scene();
        this.camera = this.createCamera();
        this.network = new NetworkManager();
        this.isWaiting = true;
        this.state = state;
        this.createWaitingRoom();
    }

    createWaitingRoom() {
        const waitingText = new Text3D(
            "Waiting for other player...",
            { x: -4, y: 0, z: 0 },
            0xffffff,
            0.4,
            0,
            () => {}
        );
    
        waitingText.createText((textMesh) => {
            this.scene.add(textMesh); // Only add when ready
        });
        this.network.connect();

        // Listen for a message when another player joins
        this.network.onMessage((data) => this.handleServerMessage(data));
    }

    handleServerMessage(data) {
        if (data.type === "START_GAME") {
            console.log("Match found! Starting game...");
            this.isWaiting = false;
            this.scene.remove(this.waitingText); // Remove waiting text
            this.startMultiplayerGame();
        }
    }

    startMultiplayerGame() {
        // Here you would change state to actually launch the Pong game
        console.log("Starting multiplayer Pong...");
        this.state.loadScene(this.state.states.MULTIPLAYER);
    }

    createCamera() {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 6, 6);
        camera.lookAt(new THREE.Vector3(0, 3, 3));
        return camera;
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }
}
