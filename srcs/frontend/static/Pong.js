import * as THREE from 'three';

export class Pong {
    constructor(state) {
        this.scene = new THREE.Scene();
        this.state = state;
        this.createPongField();  // Creates the playing field
    }

    createPongField() {
        const fieldLength = 8;
        const fieldWidth = 4;
        const borderThickness = 0.2;
        const borderHeight = 0.2;

        // Field surface
        const fieldGeometry = new THREE.PlaneGeometry(fieldLength, fieldWidth);
        const fieldMaterial = new THREE.MeshBasicMaterial({ color: 0x424242, side: THREE.DoubleSide });
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.rotation.x = -Math.PI / 2;
        this.scene.add(field);

        // Center line
        const centerLineGeometry = new THREE.PlaneGeometry(0.1, fieldWidth);
        const centerLineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const centerLine = new THREE.Mesh(centerLineGeometry, centerLineMaterial);
        centerLine.position.y = 0.01; // Elevate slightly
        centerLine.rotation.x = -Math.PI / 2;
        this.scene.add(centerLine);

        // Border materials
        const cyanMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const magentaMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });

        // Left border
        const leftBorder = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, fieldWidth, borderHeight), cyanMaterial);
        leftBorder.position.set(-fieldLength / 2 - borderThickness / 2, borderHeight / 2, 0);
        this.scene.add(leftBorder);

        // Right border
        const rightBorder = leftBorder.clone();
        rightBorder.position.set(fieldLength / 2 + borderThickness / 2, borderHeight / 2, 0);
        this.scene.add(rightBorder);

        // Top border
        const topBorder = new THREE.Mesh(new THREE.BoxGeometry(fieldLength, borderThickness, borderHeight), magentaMaterial);
        topBorder.position.set(0, borderHeight / 2, fieldWidth / 2 + borderThickness / 2);
        this.scene.add(topBorder);

        // Bottom border
        const bottomBorder = topBorder.clone();
        bottomBorder.position.set(0, borderHeight / 2, -fieldWidth / 2 - borderThickness / 2);
        this.scene.add(bottomBorder);
    }

    getScene() {
        return this.scene;
    }
}
