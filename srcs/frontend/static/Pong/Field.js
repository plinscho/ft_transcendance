import * as THREE from 'three';

export class Field {
    constructor(width, height, depth) {
        const material = new THREE.MeshLambertMaterial({ color: 0x00ffff });
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width + 50, height - 10, depth + 50),
            material
        );
    }

    addToScene(scene) {
        scene.add(this.mesh);
    }
}
