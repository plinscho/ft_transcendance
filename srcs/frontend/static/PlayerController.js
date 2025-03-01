import * as THREE from 'three';

export class PlayerController {
    constructor(gameState, pongState, playerMesh, isPlayerOne) {
        this.gameState = gameState;
        // These are refences to both for future management (controls, etc.)
        this.paddle1 = pongState.paddle1;
        this.paddle2 = pongState.paddle2;

        this.deltaTime = gameState.deltaTime;
        // This is pongState.paddle1 or pongState.paddle2
        this.playerMesh = playerMesh;

        // This is for AI
        this.isPlayerOne = isPlayerOne;

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
        this.velocity = 5;
        this.friction = 0.8;
        this.acceleration = 0.4;
        this.difficulty = 0.3; // AI difficulty (higher = better tracking)
        this.paddle1.targetPosition = this.paddle1.position;
        this.paddle2.targetPosition = this.paddle2.position;
        this.ball.targetPosition = this.ball.position;

        if (this.gameState.currentState === this.gameState.states.PLAY) {
            this.setupAI();
        }
        this.setupLocalControls();

        if (this.isMultiplayer) {
            this.startSendingMovement();
        }
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
                this.localMovementPlayer1(); // Player 1 moves locally
            } else if (this.gameState.player2) {
                this.localMovementPlayer2(); // Player 2 moves locally
            }
        }

        // Only 2 player COOP
        if (this.gameState.currentState === this.gameState.states.LOCALCOOP) {
            this.localMovement();
        }

        // IA
        if (this.gameState.currentState === this.gameState.states.PLAY) {
            if (this.isPlayerOne) {
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
            this.velocity = 0; 
        }

        if (Math.abs(this.velocity) > this.paddleSpeed) {
            this.velocity = this.paddleSpeed * Math.sign(this.velocity);
        }

        const newZ = this.playerMesh.position.z + this.velocity;

        if (newZ < this.field_z * 0.45 && newZ > -this.field_z * 0.45) {
            this.playerMesh.position.z = newZ;
        } else {
            this.velocity = 0;
        }

        // Smooth scaling effect
        this.playerMesh.scale.z += (1 - this.playerMesh.scale.z) * 0.2;
        this.playerMesh.scale.x += (1 - this.playerMesh.scale.x) * 0.2;
    }

    localMovementPlayer1() {
        if (!this.paddle1) return;

        this.playerActiveKeys();

        if (this.directionZ !== 0) {
            this.velocity += this.directionZ * this.acceleration;
        } else {
            this.velocity = 0;
        }

        if (Math.abs(this.velocity) > this.paddleSpeed) {
            this.velocity = this.paddleSpeed * Math.sign(this.velocity);
        }

        const newZ = this.paddle1.position.z + this.velocity;

        if (newZ < this.field_z * 0.45 && newZ > -this.field_z * 0.45) {
            this.paddle1.position.z = newZ;
        } else {
            this.velocity = 0;
        }

        // Smooth scaling effect
        this.paddle1.scale.z += (1 - this.paddle1.scale.z) * 0.2;
        this.paddle1.scale.x += (1 - this.paddle1.scale.x) * 0.2;
    }

    localMovementPlayer2() {
        if (!this.paddle2) return;

        this.playerActiveKeys();

        if (this.directionZ !== 0) {
            this.velocity += this.directionZ * this.acceleration;
        } else {
            this.velocity = 0;
        }

        if (Math.abs(this.velocity) > this.paddleSpeed) {
            this.velocity = this.paddleSpeed * Math.sign(this.velocity);
        }

        const newZ = this.paddle2.position.z + this.velocity;

        if (newZ < this.field_z * 0.45 && newZ > -this.field_z * 0.45) {
            this.paddle2.position.z = newZ;
        } else {
            this.velocity = 0;
        }

        // Smooth scaling effect
        this.paddle2.scale.z += (1 - this.paddle2.scale.z) * 0.2;
        this.paddle2.scale.x += (1 - this.paddle2.scale.x) * 0.2;
    }

    playerActiveKeys() {
        if (this.gameState.currentState !== this.gameState.states.LOCALCOOP) {
            if (this.gameState.player1 || this.gameState.currentState === this.gameState.states.PLAY) {
                if (this.activeKeys['a']) {
                    this.directionZ = -1;
                } else if (this.activeKeys['d']) {
                    this.directionZ = 1;
                } else {
                    this.directionZ = 0;
                }
            }
            else {
                if (this.activeKeys['a']) {
                    this.directionZ = 1;
                } else if (this.activeKeys['d']) {
                    this.directionZ = -1;
                } else {
                    this.directionZ = 0;
                }
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
        const targetZ = this.ball.position.z;

        // Lerp AI paddle position towards the ball
        let aiMovement = (targetZ - this.playerMesh.position.z) * this.difficulty * reactionDelay;

        aiMovement *= this.deltaTime;
        const maxSpeed = this.paddleSpeed * this.deltaTime;
        // Clamp AI speed to prevent unnatural movement
        if (Math.abs(aiMovement) > maxSpeed) {
            aiMovement = this.paddleSpeed * Math.sign(aiMovement);
            //aiMovement = this.paddleSpeed * this.deltaTime * Math.sign(aiMovement);
        }

        // Apply movement within field limits
        const newZ = this.playerMesh.position.z + aiMovement;
        if (newZ < this.field_z * 0.45 && newZ > -this.field_z * 0.45) {
            this.playerMesh.position.z = newZ;
        }

        // Smooth scaling effect
        this.playerMesh.scale.z += (1 - this.playerMesh.scale.z) * 0.2;
    }

    startSendingMovement() {
        if (!this.networkManager) return;

        this.movementInterval = setInterval(() => {
            this.sendMovement();
        }, 1000 / this.gameState.fps);
    }

    stopSendingMovement() {
        clearInterval(this.movementInterval);
    }

    sendMovement() {
        if (!this.networkManager) return;

        const paddleZ = this.gameState.player1
            ? this.paddle1.position.z
            : this.paddle2.position.z;
        const paddleX = this.gameState.player1
            ? this.paddle1.position.x
            : this.paddle2.position.x;
        const data = {
            type: "MOVE",
            player: this.gameState.apiState.data.username,
            isPlayer1: this.gameState.player1, // Flag to indicate Player 1 or Player 2
            paddleX: paddleX,
            paddleZ: paddleZ,
        };

        this.networkManager.sendData(data);
    }

    receiveMovement() {
        if (!this.networkManager) return;

        this.networkManager.onMessage((data) => {
            if (data.type === "MOVE") {
                if (data.player === this.gameState.apiState.data.username) {
                    console.log("Ignoring own movement update:", data);
                    return; // Ignore our own sent movement
                }

                // Update paddle position
                if (data.isPlayer1) {
                    if (this.gameState.player2 && this.paddle1) {
                        this.paddle1.targetPosition = new THREE.Vector3(
                            this.paddle1.position.x,
                            this.paddle1.position.y,
                            data.paddleZ
                        );
                        this.paddle1.position.lerp(this.paddle1.targetPosition, 0.1);
                    }
                } else {
                    if (this.gameState.player1 && this.paddle2) {
                        this.paddle2.targetPosition = new THREE.Vector3(
                            this.paddle2.position.x,
                            this.paddle2.position.y,
                            data.paddleZ
                        );
                        this.paddle2.position.lerp(this.paddle2.targetPosition, 0.1);
                    }
                }

                // Update ball position and direction (only for Player 2)
                if (this.ball) {
                    this.ball.targetPosition = new THREE.Vector3(
                        data.ballX,
                        data.ballY,
                        data.ballZ
                    );
                    this.ball.position.lerp(this.ball.targetPosition, 0.1);
                    this.ballDirX = data.ballDirX;
                    this.ballDirY = data.ballDirY;
                }
            }
        });
    }

}
