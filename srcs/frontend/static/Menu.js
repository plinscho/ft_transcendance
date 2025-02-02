import * as THREE from 'three';
import { Text3D } from './Text3D.js';
import { logout } from './auth.js';

export class Menu {
    constructor(state, camera) {
        this.scene = new THREE.Scene();
        this.state = state;
        this.camera = camera;
        this.selectedIndex = 0; // Track selected button index
        this.buttons = []; // Store button meshes
        this.buttonConfigs = [ // Define buttons
            { text: 'Play', state: this.state.states.PLAY },
            { text: 'Multiplayer', state: this.state.states.MULTIPLAYER },
            { text: 'Tournament', state: this.state.states.TOURNAMENTS },
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

        // Add event listener for screen resize
        window.addEventListener('resize', this.updateMenuPositions.bind(this));
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
                // Create a larger, invisible hitbox
                const hitboxGeometry = new THREE.BoxGeometry(2.5, 0.6, 0.1); // Increase width/height
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
        const xOffset = -this.camera.aspect * 3; // Keeps menu aligned dynamically
        const yOffset = 1 - index * 0.7; // Space between buttons

        return { x: xOffset, y: yOffset, z: 0 };
    }

    // Update positions when resizing
    updateMenuPositions() {
        this.buttons.forEach(({ mesh, index }) => {
            const newPosition = this.getScreenRelativePosition(index);
            mesh.position.set(newPosition.x, newPosition.y, newPosition.z);
        });
    }

    setupKeyboardNavigation() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.moveSelection(-1);
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                this.moveSelection(1);
            } else if (e.key === 'Enter') {
                this.buttons[this.selectedIndex]?.mesh.userData.onClick();
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


    getScene() {
        return this.scene;
    }
}
