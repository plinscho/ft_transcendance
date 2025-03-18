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
        const fragmentShader = await fetch('/static/Pong/shaders/fieldShader.glsl').then(response => response.text());
        const resolution = new THREE.Vector2(this.width / 4, this.depth / 4);
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: (Date.now() - this.startTime) / 1000 },
                u_resolution: { value: resolution },
                u_color: {value: new THREE.Color(0xff0000)}
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: fragmentShader,
            //wireframe: true,
        });

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
