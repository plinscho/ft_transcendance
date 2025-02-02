import * as THREE from 'three';
import { Text3D } from './Text3D.js';

export class Menu {
    constructor(state, camera) {
        this.scene = new THREE.Scene();
        this.state = state;
        this.camera = camera;
        this.selectedIndex = 0; // Track the selected button index
        this.buttons = []; // Store button meshes
        this.createMenuScene();
        this.setupKeyboardNavigation();
        this.menuIntersect();
    }

    createMenuScene() {
        const basePosition = { x: -5, y: 1, z: 0 };
        const offset = -0.7;

        const buttonConfigs = [
            { text: 'Play', state: this.state.states.PLAY },
            { text: 'Multiplayer', state: this.state.states.MULTIPLAYER },
            { text: 'Tournament', state: this.state.states.TOURNAMENTS },
            { text: 'Languages', action: () => console.log("Languages menu not implemented") }
        ];

        buttonConfigs.forEach(({ text, state, action }, index) => {
            const position = { x: basePosition.x, y: basePosition.y + offset * index, z: basePosition.z };

            const button = new Text3D(
                text,
                position,
                index === this.selectedIndex ? 0xffff00 : 0xffffff, // Highlight first button
                0.5,
                0,
                () => {
                    if (state && this.state.changeState) {
                        this.state.changeState(state);
                    } else if (action) {
                        action();
                    } else {
                        console.error(`Error: No action for button ${text}`);
                    }
                }
            );

            button.createText((textMesh) => {
                this.scene.add(textMesh);
                textMesh.userData.onClick = button.onClick;
                this.buttons.push(textMesh); // Store the button mesh
            });
        });
    }

    setupKeyboardNavigation() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                this.moveSelection(-1);
            } else if (e.key === 'ArrowDown') {
                this.moveSelection(1);
            } else if (e.key === 'Enter') {
                this.buttons[this.selectedIndex]?.userData.onClick();
            }
        });
    }

    moveSelection(direction) {
        // Remove highlight from previous selection
        this.buttons[this.selectedIndex].material.color.setHex(0xffffff);

        // Update selected index (loop around if needed)
        this.selectedIndex = (this.selectedIndex + direction + this.buttons.length) % this.buttons.length;

        // Highlight new selection
        this.buttons[this.selectedIndex].material.color.setHex(0xffff00);
    }

    menuIntersect() {
        window.addEventListener('click', (e) => {
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            if (!this.camera) {
                console.error("Error: La cámara no está definida en Menu.js");
                return;
            }

            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.scene.children);

            if (intersects.length > 0 && intersects[0].object.userData.onClick) {
                intersects[0].object.userData.onClick();
            }
        });
    }

    getScene() {
        return this.scene;
    }
}
