import * as THREE from 'three';
import { Text3D } from './Text3D.js';
import { logout } from './auth.js';
import { lang } from './Languages.js';
import { Stars } from './Pong/Stars.js';
import { Lighting } from './Pong/Lighting.js';
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.7/index.js";


export class Menu {
    constructor(state, camera) {
        this.scene = new THREE.Scene();
        this.state = state;
        this.camera = camera;
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
            { text: 'Languages', action: () => console.log("Languages menu not implemented") },
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


        // Add event listener for screen resize
        window.addEventListener('resize', this.updateMenuPositions.bind(this));
        // Bind the handler and listen for language changes
        this.handleLanguageChange = this.handleLanguageChange.bind(this);
        window.addEventListener('languageChanged', this.handleLanguageChange);
    }

    handleLanguageChange() {
        // Clear current scene
        this.clearScene();
        // Recreate menu with new language
        this.createMenuScene();
        // Update positions if needed
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
        console.log("Llega");
    }

    update() {
        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        if (!this.textMenu.mesh) return;
        const tl = gsap.timeline({yoyo: true, repeat: -1, repeatDelay: 0.5});
        if (this.interruptor)
            {
                tl.to(this.textMenu.mesh.position, {y: "+= 2", duration: 0.80, ease: "bounce"});
                if (this.textMenu.mesh.position.y > 2) {
                    this.interruptor = 0;
                    this.textMenu.mesh.material.color = new THREE.Color(randomColor);
                }
            }
            else {
                tl.to(this.textMenu.mesh.position, {y: "-= 2", duration: 0.80, ease: "bounce"});
                if (this.textMenu.mesh.position.y < -2.5) {
                    this.textMenu.mesh.material.color = new THREE.Color(randomColor);
                    this.interruptor = 1;
                }
            }
        }
        
        pongText() {
            const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
            const position = {
                x: 1,
                y: 0,
                z: 0,
            }
            this.textMenu = new Text3D("PONG!", position, randomColor, 1, 0.02, () => {} ,"/static/fonts/trans.json"); 
            this.textMenu.createText((textMesh) => {
                this.pongTextMesh = textMesh;
                this.scene.add(this.pongTextMesh);
            });
            //this.scene.add(text);
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
                            console.log("Entra tournament");
                        }
                        if (text === lang.menu.localcoop) {
                            this.setLocalCoopMode();
                            console.log("Entra localcoop");
                        }
                        this.state.loadScene(state);
                        this.setActive(false); // Ocultar el menú al cambiar de escena
                    } else if (action) {
                        action();
                    }
                }
            }
        );

        // Crear el texto y agregar el hitbox de forma más grande, como en la versión original
        button.createText((textMesh) => {
            const hitboxGeometry = new THREE.BoxGeometry(8, 0.5, 0); // Caja de colisión más grande
            const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: false }); // Caja de colisión invisible
            const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
            hitbox.position.copy(textMesh.position);

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

getScreenRelativePosition(index) {
    const xOffset = -this.camera.aspect * 2.5; // Keeps menu aligned dynamically
    const yOffset = 1 - index * 0.7; // Space between buttons

    return { x: xOffset, y: yOffset, z: 0 };
}

// Update positions when resizing
updateMenuPositions() {
    this.buttons.forEach(({ group, index }) => {
        const newPosition = this.getScreenRelativePosition(index);

        group.children.forEach((child) => {
            child.position.set(0, 0, 0); // Reset internal offset
        });
        // Move the entire group (text + hitbox)
        group.position.set(newPosition.x, newPosition.y, newPosition.z);

        // Hitbox stay at correct relative offsets inside the group

    });
}


setupKeyboardNavigation() {
    window.addEventListener('keydown', (e) => {
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
    let lastHoveredObject = null; // Store the last hovered button

    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        if (!this.camera) {
            console.error("Error: Camera is not defined in Menu.js");
            return;
        }

        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObjects(this.buttons.map(button => button.group), true); // Allow checking groups

        if (intersects.length > 0) {
            const hoveredObject = intersects[0].object.parent; // Get the parent group

            if (hoveredObject !== lastHoveredObject) { // Change only if a different button is hovered
                const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];

                // Reset the previous hovered button color
                if (lastHoveredObject) {
                    lastHoveredObject.children[0].material.color.setHex(0xffffff);
                }

                // Highlight the new hovered button
                hoveredObject.children[0].material.color.setHex(randomColor);

                // Update tracking variables
                lastHoveredObject = hoveredObject;
            }
        } else if (lastHoveredObject) {
            // If no button is hovered, reset the last hovered button color
            lastHoveredObject.children[0].material.color.setHex(0xffffff);
            lastHoveredObject = null; // Reset tracking variable
        }
    });

    window.addEventListener('click', (e) => {
        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object.parent; // Get the parent group

            if (clickedObject.userData.onClick) {
                clickedObject.userData.onClick();
            }
        }
    });
}

dispose() {
    window.removeEventListener('languageChanged', this.handleLanguageChange);
    this.clearScene();
}

getScene() {
    return this.scene;
}
}
