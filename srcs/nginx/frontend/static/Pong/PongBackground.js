import * as THREE from 'three';

export class PongBackground {
    constructor(scene, backgroundCamera, backgroundMesh) {
        this.scene = scene;
        this.backgroundCamera = backgroundCamera;
        this.backgroundMesh = backgroundMesh;
        this.vertices = [];
        this.createBackground();
    }
    createBackground() {
        const bgGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);

        const bgMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uColor1: { value: new THREE.Color(0x440088) },
                uColor2: { value: new THREE.Color(0xFE9F5F) },
            },
            vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = vec4(position, 1.0);
                    }
                `,
            fragmentShader: `
                    uniform vec3 uColor1;
                    uniform vec3 uColor2;
                    varying vec2 vUv;
                    void main() {
                        float dist = distance(vUv, vec2(0.5));
                        vec3 color = mix(uColor2, uColor1, smoothstep(0.1, 0.4, dist));
                        gl_FragColor = vec4(color, 1.0);
                    }
                `,
            depthWrite: false,
            depthTest: false
        });

        this.backgroundMesh = new THREE.Mesh(bgGeometry, bgMaterial);
        this.backgroundMesh.renderOrder = -1;

        const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.backgroundCamera = bgCamera;
        this.scene.add(this.backgroundMesh);
    }

    updateBackground() {
        //this.backgroundMesh.material.uniforms.uColor1.value.setHSL(Math.random(), 1, 0.5);
        this.backgroundMesh.material.uniforms.uColor2.value.setHSL(Math.random(), 1, 0.5);
    }
    
}