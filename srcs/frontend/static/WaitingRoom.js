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
        this.buttons = [];

        this.setUpKeyboard();
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
            this.scene.add(textMesh);
        });

        const backToMenu = new Text3D(
            "ESC TO LEAVE QUEUE",
            { x: -8, y: 4, z: 0 },
            0xffffff,
            0.4,
            0,
            () => this.backToMenu()
        );

        backToMenu.createText((textMesh) => {
            textMesh.userData.onClick = backToMenu.onClick; // Set click event correctly
            this.scene.add(textMesh);
            this.buttons.push(textMesh); // Store for interaction detection
        });

        this.network.connect();
        this.network.onMessage((data) => this.handleServerMessage(data));
    }

    handleServerMessage(data) {
        if (data.type === "START_GAME") {
            console.log("Match found! Starting game...");
            this.isWaiting = false;
            this.startMultiplayerGame();
        }
    }

    startMultiplayerGame() {
        console.log("Starting multiplayer Pong...");
        this.state.loadScene(this.state.states.MULTIPLAYER);
    }


    createCamera() {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 4, 4);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        return camera;
    }

    setUpKeyboard() {
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isWaiting) {
                this.backToMenu();
            }
        });
    }

    backToMenu() {
        this.state.loadScene(this.state.states.MENU);
        this.network.sendData({ type: "QUIT" });
        this.network.disconnect();
    }


    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }
}
