import * as THREE from 'three';
import { Text3D } from './Text3D.js';
import { updateLanguage } from './api.js';
import { updateUITexts } from './Languages.js';

export class LanguageMenu {
    constructor(game) {
        this.game = game;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        
        this.languages = [
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Español' },
            { code: 'fr', name: 'Français' },
            { code: 'it', name: 'Italiano' }
        ];
        
        this.setupMenu();
    }

    async setupMenu() {
        const textOptions = {
            size: 0.3,
            height: 0.1,
            curveSegments: 12,
            bevelEnabled: false
        };

        // Título
        const titleText = new Text3D('Select Language', {
            ...textOptions,
            size: 0.4
        });
        titleText.position.set(-2, 2, 0);
        this.scene.add(titleText);

        // Opciones de idioma
        this.languages.forEach((lang, index) => {
            const text = new Text3D(lang.name, textOptions);
            text.position.set(-1.5, 1 - index * 0.8, 0);
            text.userData = { type: 'language', code: lang.code };
            this.scene.add(text);
        });

        // Back button
        const backText = new Text3D('Back', textOptions);
        backText.position.set(-1.5, -2, 0);
        backText.userData = { type: 'back' };
        this.scene.add(backText);

        // Add click event listener
        window.addEventListener('click', this.handleClick.bind(this));
    }

    async handleClick(event) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObjects(this.scene.children);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData.type === 'language') {
                try {
                    await updateLanguage(object.userData.code);
                    updateUITexts();
                } catch (error) {
                    console.error('Error updating language:', error);
                }
            } else if (object.userData.type === 'back') {
                this.game.loadScene(this.game.states.MENU);
            }
        }
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }
}