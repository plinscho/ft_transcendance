import * as THREE from 'three';

export class Table {
    constructor(width, height, depth) {
        const material = new THREE.MeshLambertMaterial({ color: 0x1f51ff });
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            material
        );
        this.mesh.receiveShadow = true;
    }

    addToScene(scene) {
        scene.add(this.mesh);
    }
}
