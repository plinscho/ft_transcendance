import * as THREE from 'three';
import { Text3D } from './Text3D.js';
import { logout } from './auth.js';
import { lang } from './Languages.js'; // Importa el diccionario de idiomas

export class Menu {
    constructor(state, camera) {
        this.scene = new THREE.Scene();
        this.state = state;
        this.camera = camera;
        this.active = true;
        this.scene.background = new THREE.Color(0x424242);
        this.selectedIndex = 0; // Track selected button index
        this.buttons = [];
        this.buttonConfigs = [
            { text: lang.menu.play, state: this.state.states.PLAY },
            { text: lang.menu.multiplayer, state: this.state.states.WAITING_ROOM },
            { text: lang.menu.tournament, state: this.state.states.WAITING_ROOM },
            { text: lang.menu.languages, state: this.state.states.LANGUAGE_MENU },
            { text: lang.menu.logout, action: () => logout() }
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
        

        // Add event listener for screen resize
        window.addEventListener('resize', this.updateMenuPositions.bind(this));
    }

    setActive(isActive) {
        this.active = isActive;
        this.scene.visible = isActive;
    }

    setTournamentMode() {
        this.state.isTournament = true;
    }

    createMenuScene() {
        this.buttons = []; // Clear previous buttons
    
        this.buttonConfigs.forEach(({ text, state, action }, index) => {
            const position = this.getScreenRelativePosition(index);
            const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    
            const button = new Text3D(
                text,
                position,
                index === this.selectedIndex ? randomColor : 0xffffff, // Highlight first button
                0.4,
                0,
                () => {
                    if (this.active) {
                        if (state && this.state.changeState) {
                            if (text === lang.menu.tournament) {
                                this.setTournamentMode();
                                console.log("Tournament mode enabled");
                            }
                            this.state.loadScene(state);
                            this.setActive(false); // Hide menu when switching
                        } else if (action) {
                            action();
                        } else {
                            console.error(`Error: No action for button ${text}`);
                        }
                    }
                }
            );
    
            button.createText((textMesh) => {
                // Create a larger, invisible hitbox
                const hitboxGeometry = new THREE.BoxGeometry(8, 0.5, 0); // Increase width/height
                const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: false }); // Invisible hitbox
                const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
                
                hitbox.position.copy(textMesh.position); // Match text position
    
                // Create a group to keep the text + hitbox together
                const buttonGroup = new THREE.Group();
                buttonGroup.add(textMesh);
                buttonGroup.add(hitbox);
                buttonGroup.userData.onClick = button.onClick; // Assign click function
    
                this.scene.add(buttonGroup);
                this.buttons.push({ group: buttonGroup, index }); // Store reference
            });
        });
    }


    // Calculate button position based on screen size
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
            const intersects = raycaster.intersectObjects(this.scene.children, true); // Allow checking groups
    
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

    updateTexts() {
        this.buttonConfigs = [
            { text: lang.menu.play, state: this.state.states.PLAY },
            { text: lang.menu.multiplayer, state: this.state.states.WAITING_ROOM },
            { text: lang.menu.tournament, state: this.state.states.WAITING_ROOM },
            { text: lang.menu.languages, state: this.state.states.LANGUAGE_MENU },
            { text: lang.menu.logout, action: () => logout() }
        ];
        this.createMenuScene(); // Recreate the menu with new texts
    }

    getScene() {
        return this.scene;
    }
}