import * as THREE from 'three';
import { Text3D } from './Text3D.js';
import { updateLanguage } from './api.js';

export class LanguageMenu {
    constructor(state) {
        this.game = state;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x21282a);
        this.camera = this.createCamera();
        this.active = true;

        this.languages = [
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Español' },
            { code: 'fr', name: 'Français' },
            { code: 'it', name: 'Italiano' }
        ];

        this.buttons = [];
        this.selectedIndex = 0;

        this.colors = [
            0xffacfc,
            0xf148fb,
            0x7122fa,
            0xffd300,
            0xde38c8,
        ];
        
        this.createLanguageMenu();
        this.setupEvents();
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        if (this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }
    }

    createCamera() {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
        return camera;
    }

    createLanguageMenu() {
        const titleText = new Text3D(
            'Select Language',
            { x: -2, y: 2, z: 0 },
            0xffffff,
            0.4,
            0
        );

        titleText.createText((textMesh) => {
            this.scene.add(textMesh);
        });

        this.languages.forEach((lang, index) => {
            const button = new Text3D(
                lang.name,
                { x: -1.5, y: 1 - index * 0.8, z: 0 },
                index === this.selectedIndex ? this.colors[0] : 0xffffff,
                0.3,
                0,
                async () => {
                    if (this.active) {
                        await this.handleLanguageChange(lang.code);
                        this.game.loadScene(this.game.states.MENU);
                        this.setActive(false);
                    }
                }
            );

            button.createText((textMesh) => {
                const hitboxGeometry = new THREE.BoxGeometry(8, 0.5, 0.1);
                const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: false });
                const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
                hitbox.position.copy(textMesh.position);

                const buttonGroup = new THREE.Group();
                buttonGroup.add(textMesh);
                buttonGroup.add(hitbox);
                buttonGroup.userData = { 
                    onClick: button.onClick,
                    type: 'language',
                    code: lang.code 
                };

                this.scene.add(buttonGroup);
                this.buttons.push({ group: buttonGroup, index });
            });
        });

        const backButton = new Text3D(
            'Back',
            { x: -1.5, y: -2, z: 0 },
            0xffffff,
            0.3,
            0,
            () => {
                if (this.active) {
                    this.game.loadScene(this.game.states.MENU);
                    this.setActive(false);
                }
            }
        );

        backButton.createText((textMesh) => {
            const hitboxGeometry = new THREE.BoxGeometry(8, 0.5, 0.1);
            const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: false });
            const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
            hitbox.position.copy(textMesh.position);

            const buttonGroup = new THREE.Group();
            buttonGroup.add(textMesh);
            buttonGroup.add(hitbox);
            buttonGroup.userData = { 
                onClick: backButton.onClick,
                type: 'back' 
            };

            this.scene.add(buttonGroup);
            this.buttons.push({ group: buttonGroup, index: this.buttons.length });
        });
    }

    backToMenu() {
        this.setActive(false); 
        this.game.loadScene(this.game.states.MENU);
    }

    setupEvents() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let lastHovered = null;

        window.addEventListener('mousemove', (event) => {
            if (!this.active) return;

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.scene.children, true);

            if (intersects.length > 0) {
                const hovered = intersects[0].object.parent;
                if (hovered !== lastHovered) {
                    if (lastHovered) {
                        lastHovered.children[0].material.color.setHex(0xffffff);
                    }
                    const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
                    hovered.children[0].material.color.setHex(randomColor);
                    lastHovered = hovered;
                }
            } else if (lastHovered) {
                lastHovered.children[0].material.color.setHex(0xffffff);
                lastHovered = null;
            }
        });

        window.addEventListener('click', (event) => {
            if (!this.active) return;

            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.scene.children, true);

            if (intersects.length > 0) {
                const clicked = intersects[0].object.parent;
                if (clicked.userData.onClick) {
                    clicked.userData.onClick();
                }
            }
        });

        window.addEventListener('keydown', (event) => {
            if (!this.active) return;

            switch (event.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.moveSelection(-1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.moveSelection(1);
                    break;
                case 'Enter':
                    this.buttons[this.selectedIndex]?.group.userData?.onClick?.();
                    break;
            }
        });
    }

    moveSelection(direction) {
        if (this.buttons.length === 0) return;

        const previousButton = this.buttons[this.selectedIndex].group.children[0];
        previousButton.material.color.setHex(0xffffff);

        this.selectedIndex = (this.selectedIndex + direction + this.buttons.length) % this.buttons.length;

        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        const selectedButton = this.buttons[this.selectedIndex].group.children[0];
        selectedButton.material.color.setHex(randomColor);
    }
    
    async handleLanguageChange(langCode) {
        try {
            const response = await updateLanguage(langCode);
        } catch (error) {
            //console.error('Error changing language:', error);
        }
    }

    setActive(isActive) {
        this.active = isActive;
    }
    
    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }
}
