import * as THREE from 'three';

export class Table {
    constructor(width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.startTime = Date.now();
        this.mesh = null;
        this.material = null;
    }

    async init() {
        this.material = new THREE.MeshToonMaterial({ color: 0x85166d });
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.height, this.depth),
            this.material
        );
        this.mesh.receiveShadow = true;
    }

    async addToScene(scene) {
        if (!this.mesh) {
            await this.init();
        }
        scene.add(this.mesh);
    }

    update() {
            this.material.uniforms.u_time.value = (Date.now() - this.startTime) / 1000;
    }
}
