import * as THREE from 'three';
import { Text3D } from './Text3D.js';
import { NetworkManager } from './NetworkManager.js';

export class WaitingRoom {
    constructor(state, network) {
        this.scene = new THREE.Scene();
        this.camera = this.createCamera();
        this.network = network;
        this.isWaiting = true;
        this.active = true;
        this.state = state;
        this.buttons = [];

        this.boundEscapeHandler = this.escapeHandler.bind(this);
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
            0xff55ff,
            0.15,
            0,
            () => { if (this.active) { this.backToMenu(); }}
        );

        backToMenu.createText((textMesh) => {
            textMesh.userData.onClick = backToMenu.onClick;
            this.scene.add(textMesh);
            this.buttons.push(textMesh);
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
        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 5;

        const camera = new THREE.OrthographicCamera(
            -frustumSize * aspect,
            frustumSize * aspect,
            frustumSize,
            -frustumSize,
            0.1, 100
        );

        camera.position.set(0, 0, 10);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        return camera;
    }

    setUpKeyboard() {
        window.addEventListener('keydown', this.boundEscapeHandler);
    }

    escapeHandler(event) {
        if (event.key === 'Escape' && this.isWaiting && this.active) {
            this.backToMenu();
        }
    }

    backToMenu() {
        this.network.sendData({ type: "QUIT" });
        this.network.disconnect();
        this.active = false;
        window.removeEventListener('keydown', this.boundEscapeHandler);
        this.state.loadScene(this.state.states.MENU);
    }

    cleanup() {
        window.removeEventListener('keydown', this.boundEscapeHandler);
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }
}
