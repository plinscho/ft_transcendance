import * as THREE from 'three';

export class Ball {
    constructor(radius, fieldY) {
        const material = new THREE.MeshPhongMaterial({ color: 0x3f7b9d });
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 16, 16),
            material
        );
        this.mesh.position.set(0, fieldY + 7, radius);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }

    addToScene(scene) {
        scene.add(this.mesh);
    }
}
