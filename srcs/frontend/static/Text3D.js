import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export class Text3D {
    constructor(text, position = { x: 0, y: 0, z: 0 }, color = 0xffffff, size = 1, depth = 0.1, onClick = () => {}) {
        this.text = text;
        this.position = position;
        this.color = color;
        this.size = size;
        this.depth = depth;
        this.onClick = onClick;
        this.mesh = null;
        this.font = null;
    }

    createText(callback) {
        const loader = new FontLoader();
        
        loader.load(
            'https://threejs.org/examples/fonts/droid/droid_sans_regular.typeface.json',
            (font) => {
                this.font = font;
                this.geometry = new TextGeometry(this.text, {
                    font: font,
                    size: this.size,
                    depth: this.depth,
                    curveSegments: 12, 
                });

                const material = new THREE.MeshBasicMaterial({ color: this.color });
                this.mesh = new THREE.Mesh(this.geometry, material);
                this.mesh.position.set(this.position.x, this.position.y, this.position.z);

                this.mesh.userData.onClick = () => this.onClick();

                callback(this.mesh);
            },
            undefined,
            (error) => console.error('Error loading font:', error)
        );
    }

    updateText(newText) {
        if (!this.mesh || !this.font) return;

        if (this.geometry) {
            this.geometry.dispose();
        }

        this.text = newText;
        this.geometry = new TextGeometry(newText, {
            font: this.font,
            size: this.size,
            depth: this.depth,
            curveSegments: 12,
        });

        // Actualizamos la geometría
        this.mesh.geometry = this.geometry;
    }

    dispose() {
        if (this.geometry) {
            this.geometry.dispose();
        }
        if (this.mesh && this.mesh.material) {
            this.mesh.material.dispose();
        }
    }
}