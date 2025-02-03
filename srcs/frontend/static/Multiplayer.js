import * as THREE from 'three';

// Classe para cada jugador donde se crea el socket
export class PlayerSocket {
    constructor(){
        this.token = localStorage.getItem('authToken');
        this.socket = new WebSocket(
            'ws://'
            + 'localhost:8000'
            + '/ws/pong/'
            + 'room'
            + '/?authToken=' + this.token
        );
    
        console.log("Socket created for Token: " + this.token);
    }

    getSocket() {
        return this.socket;
    }
}

export class Multiplayer {

    constructor (socket) {
        const token = localStorage.getItem('authToken'); //Obtenemos el JWT para mandarlo
        const roomName = "room";
        this.scene = new THREE.Scene();
        this.camera = this.createCamera();  // Create a dedicated camera
        console.log("Hello from Multiplayer.");
        this.socket = socket;
        this.listenEvent();
    }
    
    listenEvent(){
        this.socket.addEventListener("message", (event) => {
            console.log("Message from server ", event.data);
        });
    }

    createCamera() {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 6, 6);  // Move camera up and back
        camera.lookAt(new THREE.Vector3(0, 3, 3));  // Ensure camera looks at the field
        return camera;
    }

    joinWaitingRoom() {
        
    }

    getScene() {
        return this.scene;
    }
    
    getCamera() {
        return this.camera;
    }
    
}

