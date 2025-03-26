import * as THREE from 'three';
import { Text3D } from './Text3D.js';
import { logout } from './auth.js';
import { lang } from './Languages.js';
import { Stars } from './Pong/Stars.js';
import { Lighting } from './Pong/Lighting.js';
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.7/index.js";
import { Paddle } from './Pong/Paddle.js';


export class Menu {
    constructor(state) {
        this.scene = new THREE.Scene();
        this.state = state;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        this.active = true;
        this.scene.background = new THREE.Color(0x21282a);
        this.lighting = new Lighting(this.scene);
        this.stars = new Stars(this.scene);

        this.selectedIndex = 0; // Track selected button index
        this.buttons = [];
        this.buttonGroup = 0;
        this.pongTextMesh = null;
        this.interruptor = 1;
        this.buttonConfigs = [
            { text: 'Play', state: this.state.states.PLAY },
            { text: 'Local Coop', state: this.state.states.LOCALCOOP },
            { text: 'Multiplayer', state: this.state.states.WAITING_ROOM },
            { text: 'Tournament', state: this.state.states.WAITING_ROOM },
            { text: 'Languages', action: () => {}},
            { text: 'Logout', action: () => logout() }
        ];

        this.colors = [
            0xffacfc,
            0xf148fb,
            0x7122fa,
            0xffd300,
            0xde38c8,
        ];
        this.createMenuScene();
        this.setupKeyboardNavigation();
        this.menuIntersect();
        this.pongText();
        this.paddle1 = new Paddle(180, 20, 40, 0x922b21, [155, -110, -300]);

        this.paddle1.mesh.rotation.y = -30 * Math.PI / 180;
        this.paddle1.addToScene(this.scene);

        this.paddle2 = new Paddle(180, 20, 40, 0x922b21, [155, 110, -300]);
        this.paddle2.mesh.rotation.y = -30 * Math.PI / 180;
        this.paddle2.addToScene(this.scene);
    }


    setActive(isActive) {
        this.active = isActive;
        this.scene.visible = isActive;
    }

    setLocalCoopMode() {
        this.state.localCoop = true;
        this.state.isTournament = false;
    }

    setTournamentMode() {
        this.state.isTournament = true;
    }

    update() {
        this.stars.animateStars();
        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        if (!this.textMenu.mesh) return;
        const tl = gsap.timeline({ yoyo: true, repeat: -1, repeatDelay: 0.5 });
        if (this.interruptor) {
            tl.to(this.textMenu.mesh.position, { y: "+= 1", duration: 0.80, ease: "bounce" });
            if (this.textMenu.mesh.position.y > 0.5) {
                this.interruptor = 0;
                this.textMenu.mesh.material.color = new THREE.Color(randomColor);
            }
        }
        else {
            tl.to(this.textMenu.mesh.position, { y: "-= 1", duration: 0.80, ease: "bounce" });
            if (this.textMenu.mesh.position.y < -1.5) {
                this.textMenu.mesh.material.color = new THREE.Color(randomColor);
                this.interruptor = 1;
            }
        }
    }

    pongText() {
        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        const position = {
            x: 2,
            y: 0,
            z: -2,
        }
        this.textMenu = new Text3D("PONG", position, randomColor, 0.9, 0.02, () => { }, "/static/fonts/trans.json");
        this.textMenu.createText((textMesh) => {
            this.pongTextMesh = textMesh;
            this.pongTextMesh.rotation.y = -35 * Math.PI / 180;
            this.scene.add(this.pongTextMesh);
        });
    }

    createMenuScene() {
        this.buttons = []; // Limpiar botones anteriores

        // Nueva estructura de configuración de botones
        const buttonConfigs = [
            { text: lang.menu.play, state: this.state.states.PLAY },
            { text: lang.menu.localcoop, state: this.state.states.LOCALCOOP },
            { text: lang.menu.multiplayer, state: this.state.states.WAITING_ROOM },
            { text: lang.menu.tournament, state: this.state.states.WAITING_ROOM },
            { text: lang.menu.languages, state: this.state.states.LANGUAGE_MENU },
            { text: lang.menu.logout, action: () => logout() }
        ];

        // Función para obtener la posición en pantalla (como en la versión antigua)
        buttonConfigs.forEach(({ text, state, action }, index) => {
            const position = this.getScreenRelativePosition(index);
            const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];

            // Llamada a la creación del botón en 3D (como en la versión original)
            const button = new Text3D(
                text,
                position,
                index === this.selectedIndex ? randomColor : 0xffffff, // Resaltar primer botón
                0.4,
                0,
                () => {
                    if (this.active) {
                        if (state && this.state.changeState) {
                            if (text === lang.menu.tournament) {
                                this.setTournamentMode();
                                //console.log("Entra tournament");
                            }
                            if (text === lang.menu.localcoop) {
                                this.setLocalCoopMode();
                                //console.log("Entra localcoop");
                            }
                            this.state.loadScene(state);
                            this.setActive(false); // Ocultar el menú al cambiar de escena
                        } else if (action) {
                            action();
                        }
                    }
                },
                "/static/fonts/trans.json"
            );

            // Crear el texto y agregar el hitbox de forma más grande, como en la versión original
            button.createText((textMesh) => {
                const hitboxGeometry = new THREE.PlaneGeometry(4, 0.55); // Caja de colisión más grande
                const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: false }); // Caja de colisión invisible
                const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
                hitbox.position.copy(textMesh.position);
                hitbox.position.setX(textMesh.position.x * 0.5); // Mover la caja de colisión detrás del texto
                hitbox.position.setY(textMesh.position.y + 0.15);
                hitbox.position.setZ(textMesh.position.z - 0.01); // Mover la caja de colisión detrás del texto

                hitbox.rotation.y = 15 * Math.PI / 180;
                textMesh.rotation.y = 15 * Math.PI / 180;
                // Crear un grupo para mantener el texto y la caja de colisión juntos
                this.buttonGroup = new THREE.Group();
                this.buttonGroup.add(textMesh);
                this.buttonGroup.add(hitbox);
                this.buttonGroup.userData.onClick = button.onClick;
            
                this.scene.add(this.buttonGroup);
                this.buttons.push({ group: this.buttonGroup, index });
            });
        });
    }

    backToMenu() {
        
    }

    getScreenRelativePosition(index) {
        const xOffset = -this.camera.aspect * 2.8; // Keeps menu aligned dynamically
        const yOffset = 1 - index * 0.6; // Space between buttons

        return { x: xOffset, y: yOffset, z: 0 };
    }

    setupKeyboardNavigation() {
        this.onKeyDown = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.moveSelection(-1);
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                this.moveSelection(1);
            } else if (e.key === 'Enter') {
                this.buttons?.[this.selectedIndex]?.group?.userData?.onClick?.();
            }
        };
    
        window.addEventListener('keydown', this.onKeyDown);
    }

    moveSelection(direction) {
        if (this.buttons.length === 0) return; // Prevent errors if no buttons exist

        // Remove highlight from previous selection
        const previousButton = this.buttons[this.selectedIndex].group.children[0]; // Get text mesh
        previousButton.material.color.setHex(0xffffff); // Reset to white

        // Update selected index (loop around)
        this.selectedIndex = (this.selectedIndex + direction + this.buttons.length) % this.buttons.length;

        // Random color for selection
        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];

        // Highlight new selection
        const selectedButton = this.buttons[this.selectedIndex].group.children[0]; // Get text mesh
        selectedButton.material.color.setHex(randomColor);
    }

    menuIntersect() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let lastHoveredObject = null; 
    
        // Store function references for removal
        this.onMouseMove = (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
            if (!this.camera) return;
    
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.buttons.map(button => button.group), true);
    
            if (intersects.length > 0) {
                const hoveredObject = intersects[0].object.parent;
    
                if (hoveredObject !== lastHoveredObject) { 
                    const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    
                    if (lastHoveredObject) {
                        lastHoveredObject.children[0].material.color.setHex(0xffffff);
                    }
    
                    hoveredObject.children[0].material.color.setHex(randomColor);
                    lastHoveredObject = hoveredObject;
                }
            } else if (lastHoveredObject) {
                lastHoveredObject.children[0].material.color.setHex(0xffffff);
                lastHoveredObject = null;
            }
        };
    
        this.onClick = (e) => {
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.scene.children, true);
    
            if (intersects.length > 0) {
                const clickedObject = intersects[0].object.parent;
                if (clickedObject.userData.onClick) {
                    clickedObject.userData.onClick();
                }
            }
        };
    
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('click', this.onClick);
    }

    removeEventListeners() {
        if (this.onMouseMove) {
            window.removeEventListener('mousemove', this.onMouseMove);
            this.onMouseMove = null;
        }
        if (this.onClick) {
            window.removeEventListener('click', this.onClick);
            this.onClick = null;
        }
    }

    removeKeyboardNavigation() {
        if (this.onKeyDown) {
            window.removeEventListener('keydown', this.onKeyDown);
            this.onKeyDown = null;
        }
    }

    dispose() {
        window.removeEventListener('languageChanged', this.handleLanguageChange);
        this.clearScene();
    }

    getCamera() {
        return this.camera;
    }

    getScene() {
        return this.scene;
    }
}
