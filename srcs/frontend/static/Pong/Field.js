import * as THREE from 'three';

export class Field {
    constructor(width, height, depth) {
        const material = new THREE.MeshLambertMaterial({ color: 0xbc13fe });
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width + 10, height - 1.5, depth + 10),
            material
        );
    }

    addToScene(scene) {
        scene.add(this.mesh);
    }
}
