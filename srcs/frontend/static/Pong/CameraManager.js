import * as THREE from 'three';

export class CameraManager {
    constructor() {
        this.camera1 = this.createCamera(-390, 150, 0);
        this.camera2 = this.createCamera(390, 150, 0);
        this.localCoopCamera = this.createCamera(0, 400, 300);
    }

    createCamera(x, y, z) {
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera.position.set(x, y, z);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        return camera;
    }

    updateCamera(camera) {
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
}
