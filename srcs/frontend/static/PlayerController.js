import * as THREE from 'three';

export class PlayerController {
    constructor(gameState, pongState, playerMesh) {
        this.gameState = gameState;
        // These are refences to both for future management (controls, etc.)
        this.paddle1 = pongState.paddle1;
        this.paddle2 = pongState.paddle2;

        this.deltaTime = gameState.deltaTime;
        // This is pongState.paddle1 or pongState.paddle2
        this.playerMesh = playerMesh;

        this.isMultiplayer = pongState.multiplayer;
        this.networkManager = pongState.networkManager;

        this.field_x = pongState.field_x;
        this.field_y = pongState.field_y;
        this.field_z = pongState.field_z;

        this.paddleSpeed = 5;
        this.ball = pongState.ball; // Pass the ball for AI tracking

        this.ballDirX = pongState.ballDirX;
        this.ballDirZ = pongState.ballDirZ;

        this.activeKeys = {};
        this.directionZ = 0;
        this.velocity = 0;
        this.friction = 0.8;
        this.acceleration = 0.4;
        this.difficulty = 0.7; // AI difficulty (higher = better tracking)

        if (this.gameState.currentState === this.gameState.states.PLAY) {
            this.setupAI();
        }
        this.setupLocalControls();
    }

    setupLocalControls() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                this.activeKeys[e.key] = true;
            } else {
                this.activeKeys[key] = true;
            }
        });
    
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                this.activeKeys[e.key] = false;
            } else {
                this.activeKeys[key] = false;
            }
        });
    }

    update() {
        // Only multiplayer
        if (this.isMultiplayer) {
            this.receiveMovement();
            if (this.gameState.player1) {
                this.localMovement();
                this.sendMovement();  // Send player movement only if Player 1
            }
        }

        // Only 2 player COOP
        if (this.gameState.currentState === this.gameState.states.LOCALCOOP) {
            this.localMovement();
        }

        // IA
        if (this.gameState.currentState === this.gameState.states.PLAY) {
            if (this.paddle1 === this.playerMesh) {
                this.localMovement();
            } else {
                this.setupAI();
            }
        }
    }



    // PLAY + MULTIPLAYER + TOURNAMENT CONTROLS
    localMovement() {
        if (!this.playerMesh) return;

        this.playerActiveKeys();

        if (this.directionZ !== 0) {
            this.velocity += this.directionZ * this.acceleration;
        } else {
            this.velocity *= this.friction;
        }

        if (Math.abs(this.velocity) > this.paddleSpeed) {
            this.velocity = this.paddleSpeed * Math.sign(this.velocity);
        }

        const newZ = this.playerMesh.position.z + this.velocity;

        if (newZ < this.field_x * 0.45 && newZ > -this.field_x * 0.45) {
            this.playerMesh.position.z = newZ;
        } else {
            this.velocity = 0;
        }

        // Smooth scaling effect
        this.playerMesh.scale.z += (1 - this.playerMesh.scale.z) * 0.2;
        this.playerMesh.scale.x += (1 - this.playerMesh.scale.x) * 0.2;
    }

    playerActiveKeys() {
        if (this.gameState.currentState !== this.gameState.states.LOCALCOOP) {
            if (this.activeKeys['a']) {
                this.directionZ = 1;
            } else if (this.activeKeys['d']) {
                this.directionZ = -1;
            } else {
                this.directionZ = 0;
            }
        } else {
            // Separar player 1 del 2
            if (this.paddle1 === this.playerMesh) {
                if (this.activeKeys['w']) {
                    this.directionZ = -1;
                } else if (this.activeKeys['s']) {
                    this.directionZ = 1;
                } else {
                    this.directionZ = 0;
                }
            } else {
                if (this.activeKeys["ArrowUp"]) {
                    this.directionZ = -1;
                } else if (this.activeKeys["ArrowDown"]) {
                    this.directionZ = 1;
                } else {
                    this.directionZ = 0;
                }
            }
        }
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
        let data = {
            type: "MOVE",
            player: this.gameState.apiState.data.username,
            x: this.playerMesh.position.x,
            y: this.playerMesh.position.y,
            z: this.playerMesh.position.z,
            ballX: this.ball.position.x,
            ballY: this.ball.position.y,
            ballZ: this.ball.position.z,
            ballDirX: this.ballDirX,
            ballDirY: this.ballDirY
        }
        this.networkManager.sendData(data);
    }

    receiveMovement() {
        if (!this.networkManager) return;

        this.networkManager.onMessage((data) => {
            if (data.type === "MOVE") {
                this.playerMesh.position.set(data.x, data.y, data.z);
                if (this.ball) {
                    //this.ball.position.set(data.ballX, data.ballY, data.ballZ);
                    this.ballDirX = data.ballDirX;
                    this.ballDirY = data.ballDirY;
                }
            }
        });
    }
}
