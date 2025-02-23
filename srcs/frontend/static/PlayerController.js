import * as THREE from 'three';

export class PlayerController {
    constructor(gameState, pongState) {
        this.gameState = gameState;
        this.playerMesh = playerMesh;
        this.isMultiplayer = isMultiplayer;
        this.networkManager = networkManager;
        this.fieldHeight = fieldHeight;
        this.paddleSpeed = paddleSpeed;
        this.ball = ball; // Pass the ball for AI tracking
        this.ballDirX = ballDirX;
        this.ballDirY = ballDirY;

        this.activeKeys = {};
        this.directionZ = 0;
        this.velocity = 0;
        this.friction = 0.8;
        this.acceleration = 0.4;
        this.difficulty = 0.7; // AI difficulty (higher = better tracking)

        if (!this.isMultiplayer) {
            this.setupAI();
        }
        this.setupLocalControls();
    }

    setupLocalControls() {
        window.addEventListener('keydown', (e) => {
            this.activeKeys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.activeKeys[e.key.toLowerCase()] = false;
        });
    }

    // update() {
    //     if (this.isMultiplayer) {
    //         this.receiveMovement();
    //         if (this.gameState.player1) {
    //             this.localMovement();
    //             this.sendMovement();  // Send player movement only if Player 1
    //         }
    //     } else {
    //         if (this.gameState.player1) {
    //             this.localMovement();
    //         } else {
    //             this.setupAI();
    //         }
    //     }
    // }


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
        if (this.gameState.curretState === this.gameState.states.LOCALCOOP) {
        }

        // IA
        if (this.gameState.curretState === this.gameState.states.PLAY) {
            if (this.gameState.player1) {
                this.localMovement();
            } else {
                this.setupAI();
            }
        }
    }



    localMovement() {
        if (!this.playerMesh) return;

        if (this.activeKeys['a']) {
            this.directionZ = 1;
        } else if (this.activeKeys['d']) {
            this.directionZ = -1;
        } else {
            this.directionZ = 0;
        }

        if (this.directionZ !== 0) {
            this.velocity += this.directionZ * this.acceleration;
        } else {
            this.velocity *= this.friction;
        }

        if (Math.abs(this.velocity) > this.paddleSpeed) {
            this.velocity = this.paddleSpeed * Math.sign(this.velocity);
        }

        const newZ = this.playerMesh.position.z + this.velocity;

        if (newZ < this.fieldHeight * 0.45 && newZ > -this.fieldHeight * 0.45) {
            this.playerMesh.position.z = newZ;
        } else {
            this.velocity = 0;
        }

        // Smooth scaling effect
        this.playerMesh.scale.z += (1 - this.playerMesh.scale.z) * 0.2;
        this.playerMesh.scale.x += (1 - this.playerMesh.scale.x) * 0.2;
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
