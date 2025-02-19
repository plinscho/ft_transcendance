import * as THREE from 'three';
import { Text3D } from './Text3D.js';
import { logout } from './auth.js';
import { lang } from './Languages.js';

export class Menu {
    constructor(state, camera) {
        this.scene = new THREE.Scene();
        this.state = state;
        this.camera = camera;
        this.active = true;
        this.scene.background = new THREE.Color(0x424242);
        this.selectedIndex = 0;
        this.buttons = [];
        this.colors = [0xffacfc, 0xf148fb, 0x7122fa, 0xffd300, 0xde38c8];

        // Crear la escena inicial
        this.createMenuScene();
        this.setupKeyboardNavigation();
        this.menuIntersect();

        // Bind del evento de cambio de idioma
        this.handleLanguageChange = this.handleLanguageChange.bind(this);
        window.addEventListener('languageChanged', this.handleLanguageChange);

        // Evento de cambio de tamaño de pantalla
        window.addEventListener('resize', this.updateMenuPositions.bind(this));
    }

    handleLanguageChange() {
        // Limpiar la escena actual
        this.clearScene();
        // Recrear el menú con el nuevo idioma
        this.createMenuScene();
        // Actualizar posiciones si es necesario
        this.updateMenuPositions();
    }

    clearScene() {
        while (this.scene.children.length > 0) {
            const child = this.scene.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
            this.scene.remove(child);
        }
        this.buttons = [];
    }

    createMenuScene() {
        this.buttons = []; // Limpiar botones anteriores
    
        const buttonConfigs = [
            { text: lang.menu.play, state: this.state.states.PLAY },
            { text: lang.menu.multiplayer, state: this.state.states.WAITING_ROOM },
            { text: lang.menu.tournament, state: this.state.states.WAITING_ROOM },
            { text: lang.menu.languages, state: this.state.states.LANGUAGE_MENU },
            { text: lang.menu.logout, action: () => logout() }
        ];
        
        buttonConfigs.forEach(({ text, state, action }, index) => {
            const position = this.getScreenRelativePosition(index);
            const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];

            const button = new Text3D(
                text,
                position,
                index === this.selectedIndex ? randomColor : 0xffffff, // Resaltar el primer botón
                0.4,
                0,
                () => {
                    if (this.active) {
                        if (state && this.state.changeState) {
                            if (text === lang.menu.tournament) {
                                this.setTournamentMode();
                            }
                            this.state.loadScene(state);
                            this.setActive(false);
                        } else if (action) {
                            action();
                        }
                    }
                }
            );

            button.createText((textMesh) => {
                const hitboxGeometry = new THREE.BoxGeometry(8, 0.5, 0);
                const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: false });
                const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
                hitbox.position.copy(textMesh.position);

                const buttonGroup = new THREE.Group();
                buttonGroup.add(textMesh);
                buttonGroup.add(hitbox);
                buttonGroup.userData.onClick = button.onClick;

                this.scene.add(buttonGroup);
                this.buttons.push({ group: buttonGroup, index });
            });
        });
    }

    setActive(isActive) {
        this.active = isActive;
        this.scene.visible = isActive;
    }

    getScreenRelativePosition(index) {
        const xOffset = -this.camera.aspect * 2.5;
        const yOffset = 1 - index * 0.7;
        return { x: xOffset, y: yOffset, z: 0 };
    }

    setTournamentMode() {
        this.state.isTournament = true;
    }

    setupKeyboardNavigation() {
        window.addEventListener('keydown', (e) => {
            if (!this.active) return;

            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.moveSelection(-1);
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                this.moveSelection(1);
            } else if (e.key === 'Enter') {
                this.buttons[this.selectedIndex]?.group.userData?.onClick?.();
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

    menuIntersect() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let lastHoveredObject = null;

        window.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.camera);
            
            const intersects = raycaster.intersectObjects(this.scene.children, true);
            
            if (intersects.length > 0) {
                const hoveredObject = intersects[0].object;
                if (hoveredObject !== lastHoveredObject) {
                    if (lastHoveredObject) lastHoveredObject.material.color.setHex(0xffffff);
                    hoveredObject.material.color.setHex(0xffd300);
                    lastHoveredObject = hoveredObject;
                }
            } else {
                if (lastHoveredObject) lastHoveredObject.material.color.setHex(0xffffff);
                lastHoveredObject = null;
            }
        });

        window.addEventListener('click', () => {
            if (lastHoveredObject && lastHoveredObject.parent.userData.onClick) {
                lastHoveredObject.parent.userData.onClick();
            }
        });
    }
}
