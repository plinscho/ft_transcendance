import * as THREE from 'three';
import { Text3D } from './Text3D.js';

export class Pong {
    constructor(state) {
        this.scene = new THREE.Scene();
        this.state = state;
        this.createPongScene();
    }

    createPongScene() {
        const playText = new Text3D(
            'Pong',
            { x: -1, y: 0, z: 0 },
            0xffffff,
            0.9,
            0.1,
            () => {
                this.state.changeState(this.state.states.MENU);
            }
        );

        playText.createText((textMesh) => {
            this.scene.add(textMesh);
        });
    }

    getScene() {
        return this.scene;
    }
}
