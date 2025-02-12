import * as THREE from 'three';

export class PlayerController {
    constructor(playerMesh, isPlayerOne, isMultiplayer, fieldHeight, paddleSpeed, ball = null, networkManager = null) {
        this.playerMesh = playerMesh;
        this.isMultiplayer = isMultiplayer;
        this.networkManager = networkManager;
        this.fieldHeight = fieldHeight;
        this.paddleSpeed = paddleSpeed;
        this.isPlayerOne = isPlayerOne;
        this.ball = ball; // Pass the ball for AI tracking

        this.activeKeys = {};
        this.directionY = 0;  
        this.velocity = 0;    
        this.friction = 0.8;   
        this.acceleration = 0.4; 
        this.difficulty = 0.3; // AI difficulty (higher = better tracking)

        if (this.isMultiplayer) {
            this.setupMultiplayer();
        } else if (this.isPlayerOne) {
            this.setupLocalControls();
        } else {
            this.setupAI();
        }
    }

    setupLocalControls() {
        window.addEventListener('keydown', (e) => {
            this.activeKeys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.activeKeys[e.key.toLowerCase()] = false;
        });
    }

    update() {
        if (this.isMultiplayer) {
            this.sendMovement();
        } else if (this.isPlayerOne) {
            this.localMovement();
        } else {
            this.setupAI();
        }
    }

    localMovement() {
        if (!this.playerMesh) return;

        if (this.activeKeys['a']) {
            this.directionY = 1;  
        } else if (this.activeKeys['d']) {
            this.directionY = -1; 
        } else {
            this.directionY = 0; 
        }

        if (this.directionY !== 0) {
            this.velocity += this.directionY * this.acceleration;
        } else {
            this.velocity *= this.friction;
        }

        if (Math.abs(this.velocity) > this.paddleSpeed) {
            this.velocity = this.paddleSpeed * Math.sign(this.velocity);
        }

        const newY = this.playerMesh.position.y + this.velocity;

        if (newY < this.fieldHeight * 0.45 && newY > -this.fieldHeight * 0.45) {
            this.playerMesh.position.y = newY;
        } else {
            this.velocity = 0;
            this.playerMesh.scale.y += (2 - this.playerMesh.scale.y) * 0.15;
        }

        this.playerMesh.scale.y += (1 - this.playerMesh.scale.y) * 0.2;
        this.playerMesh.scale.z += (1 - this.playerMesh.scale.z) * 0.2;
    }

    setupAI() {
        if (!this.ball || !this.playerMesh) return;

        // AI reaction delay factor (randomized for more challenge)
        const reactionDelay = Math.random() * 0.2 + 0.1; // Between 0.1 and 0.3
        const targetY = this.ball.position.y;

        // Lerp AI paddle position towards the ball
        let aiMovement = (targetY - this.playerMesh.position.y) * this.difficulty * reactionDelay;

        // Clamp AI speed to prevent unnatural movement
        if (Math.abs(aiMovement) > this.paddleSpeed) {
            aiMovement = this.paddleSpeed * Math.sign(aiMovement);
        }

        // Apply movement within field limits
        const newY = this.playerMesh.position.y + aiMovement;
        if (newY < this.fieldHeight * 0.45 && newY > -this.fieldHeight * 0.45) {
            this.playerMesh.position.y = newY;
        }

        // Smooth scaling effect
        this.playerMesh.scale.y += (1 - this.playerMesh.scale.y) * 0.2;
    }

    sendMovement() {
        if (!this.networkManager) return;

        this.networkManager.sendMessage({
            type: "PLAYER_MOVE",
            x: this.playerMesh.position.x,
            y: this.playerMesh.position.y,
            z: this.playerMesh.position.z,
        });
    }
}
