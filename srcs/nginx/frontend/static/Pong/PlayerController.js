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

		// IA PADDLE DIR
		this.paddle2DirZ = 0;

		this.paddleSpeed = 5;
		this.ball = pongState.ball; // Pass the ball for AI tracking

		this.ballDirX = pongState.ballDirX;
		this.ballDirZ = pongState.ballDirZ;

		this.activeKeys = {};
		this.directionZ = 0;
		this.velocity = 0;
		this.friction = 0.8;
		this.acceleration = 0.6;
		this.difficulty = 0.2; // AI difficulty (higher = better tracking)
		this.paddle1.targetPosition = this.paddle1.position;
		this.paddle2.targetPosition = this.paddle2.position;
		this.ball.targetPosition = this.ball.position;

		if (this.gameState.currentState === this.gameState.states.PLAY) {
			this.setupAI();
		}
		this.setupLocalControls();

		//if (this.isMultiplayer)
			//this.receiveMovement();
	}

	setupLocalControls() {
		this.onKeyDown = (e) => {
			const key = e.key.toLowerCase();
			if (e.key === "ArrowUp" || e.key === "ArrowDown") {
				this.activeKeys[e.key] = true;
			} else {
				this.activeKeys[key] = true;
			}
		};
	
		this.onKeyUp = (e) => {
			const key = e.key.toLowerCase();
			if (e.key === "ArrowUp" || e.key === "ArrowDown") {
				this.activeKeys[e.key] = false;
			} else {
				this.activeKeys[key] = false;
			}
		};
	
		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);
	}
	
	removeLocalControls() {
		if (this.onKeyDown) {
			window.removeEventListener('keydown', this.onKeyDown);
			this.onKeyDown = null;
		}
		if (this.onKeyUp) {
			window.removeEventListener('keyup', this.onKeyUp);
			this.onKeyUp = null;
		}
	}

	update() {
		if (!this.playerMesh || !this.ball) return;

		// Only multiplayer
		if (this.isMultiplayer) {
			
			if (this.gameState.player1) {
				this.localMovementPlayer1(); // Player 1 moves locally
			} else if (this.gameState.player2) {
				this.localMovementPlayer2(); // Player 2 moves locally
			}
		}

		// Only 2 player COOP
		if (this.gameState.currentState === this.gameState.states.LOCALCOOP 
			|| this.gameState.currentState === this.gameState.states.TOURNAMENTS) {
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

		const newZ = this.playerMesh.position.z + this.velocity /** this.deltaTime*/;

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

		if (this.activeKeys['a']) {
			this.directionZ = -1;
			this.sendMovement();
		} else if (this.activeKeys['d']) {
			this.directionZ = 1;
			this.sendMovement();
		} else {
			this.directionZ = 0;
		}
	

		if (this.directionZ !== 0) {
			this.velocity += this.directionZ * this.acceleration;
		} else {
			this.velocity = 0;
		}

		if (Math.abs(this.velocity) > this.paddleSpeed) {
			this.velocity = this.paddleSpeed * Math.sign(this.velocity);
		}

		const newZ = this.paddle1.position.z + this.velocity /** this.deltaTime*/;

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

		if (this.activeKeys['a']) {
			this.directionZ = 1;
			this.sendMovement();
		} else if (this.activeKeys['d']) {
			this.directionZ = -1;
			this.sendMovement();
		} else {
			this.directionZ = 0;
		}

		if (this.directionZ !== 0) {
			this.velocity += this.directionZ * this.acceleration;
		} else {
			this.velocity = 0;
		}

		if (Math.abs(this.velocity) > this.paddleSpeed) {
			this.velocity = this.paddleSpeed * Math.sign(this.velocity);
		}

		const newZ = this.paddle2.position.z + this.velocity/* * this.deltaTime*/;

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
		switch (this.gameState.currentState) {
			case this.gameState.states.PLAY:
			case this.gameState.states.MULTIPLAYER:
				if (this.gameState.player1) {
					this.directionZ = this.activeKeys['a'] ? 1 : this.activeKeys['d'] ? -1 : 0;
				} else {
					this.directionZ = this.activeKeys['a'] ? -1 : this.activeKeys['d'] ? 1 : 0;
				}
				break;
	
			case this.gameState.states.LOCALCOOP:
			case this.gameState.states.TOURNAMENTS:
				if (this.paddle1 === this.playerMesh) {
					this.directionZ = this.activeKeys['w'] ? -1 : this.activeKeys['s'] ? 1 : 0;
				} else {
					this.directionZ = this.activeKeys['ArrowUp'] ? -1 : this.activeKeys['ArrowDown'] ? 1 : 0;
				}
				break;
		}
	}
	
	setupAI() {
		if (!this.ball || !this.playerMesh) return;
	
			const reactionDelay = 0.2 + Math.random() * 0.3; // Random delay
	
			let targetZ = this.ball.position.z;
			let directionZ = (targetZ - this.playerMesh.position.z) * this.difficulty * reactionDelay;
	
			// AI moves at full speed (No speed limit!)
			this.playerMesh.position.z += directionZ;
	
			// Keep AI within field limits
			if (this.playerMesh.position.z > this.field_z * 0.45) {
				this.playerMesh.position.z = this.field_z * 0.45;
			}
			if (this.playerMesh.position.z < -this.field_z * 0.45) {
				this.playerMesh.position.z = -this.field_z * 0.45;
			}

	}
	
	sendMovement() {
		if (!this.networkManager || !this.paddle1 || !this.paddle2) return;

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
		//console.log("Sending movement data:", data);
		this.networkManager.sendData(data);
	}

}
