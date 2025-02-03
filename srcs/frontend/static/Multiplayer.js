import * as THREE from 'three';

export class Multiplayer {

    constructor () {
        const token = localStorage.getItem('authToken'); //Obtenemos el JWT para mandarlo
        const roomName = "room";
        this.scene = new THREE.Scene();
        this.camera = this.createCamera();  // Create a dedicated camera

        const chatSocket = new WebSocket(
            'ws://'
            + 'localhost:8000'
            + '/ws/pong/'
            + roomName
            + '/?authToken=' + token
        );
    }

    createCamera() {
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
            camera.position.set(0, 6, 6);  // Move camera up and back
            camera.lookAt(new THREE.Vector3(0, 3, 3));  // Ensure camera looks at the field
            return camera;
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

}

