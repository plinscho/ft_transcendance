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
    }

    createText(callback) {
        const loader = new FontLoader();
        
        loader.load(
            '/static/fonts/helvetiker_regular.typeface.json',
            (font) => {
                const geometry = new TextGeometry(this.text, {
                    font: font,
                    size: this.size,
                    depth: this.depth,
                    curveSegments: 4,
                });

                const material = new THREE.MeshBasicMaterial({ color: this.color });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.position.set(this.position.x, this.position.y, this.position.z);

                // Asignar función de clic a userData
                this.mesh.userData.onClick = () => this.onClick();

                // Ejecutar el callback con el objeto creado
                callback(this.mesh);
            },
            undefined,
            (error) => console.error('Error al cargar la fuente:', error)
        );
    }
}
