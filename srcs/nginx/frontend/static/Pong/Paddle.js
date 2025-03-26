import * as THREE from 'three';

export class Paddle {
    constructor(width, height, depth, color, position) {
        const material = new THREE.MeshLambertMaterial({ color });
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            material
        );
        this.mesh.position.set(...position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }

    addToScene(scene) {
        scene.add(this.mesh);
    }

}
