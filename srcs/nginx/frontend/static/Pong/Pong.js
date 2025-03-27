import * as THREE from 'three';
import { Text3D } from '../Text3D.js';
import { PlayerController } from './PlayerController.js';
import { PongScene } from './PongScene.js';
import { PongBackground } from './PongBackground.js';
import { CameraManager } from './CameraManager.js';
import { Stars } from './Stars.js';
import { ScoreboardPlayer } from './ScoreboardPlayer.js'
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';

const BALL_SPEED = 3;

export class Pong {
	constructor(state, multiplayer, networkManager, localcoop, nicks) {
		this.scene = new THREE.Scene();
		this.state = state;
		this.cameraManager = new CameraManager();

		this.nicks = nicks;
		this.winnerResult;

		this.wallImpact = null;
		this.paddleBallImpact = null;

		this.camera1 = this.cameraManager.camera1;
		this.camera2 = this.cameraManager.camera2;
		this.localcoopCamera = this.cameraManager.localCoopCamera;

		this.deltaTime = state.deltaTime;
		this.multiplayer = multiplayer;
		this.networkManager = networkManager;
		this.localcoop = localcoop;
		//fog
		//this.scene.fog = new THREE.Fog(0x000000, 10, 1000);

		// Field and Paddle properties
		this.field_x = 400;
		this.field_y = 0;
		this.field_z = 300

		this.paddle_x = 10;
		this.paddle_y = 10;
		this.paddle_z = 50;

		this.ballRadius = 7;

		// paddle
		this.paddle1DirZ = 0;
		this.paddle2DirZ = 0;
		this.paddleSpeed = 5;

		// ball
		this.ballPaused = false;
		this.ballDirZ = -1;
		this.ballDirX = -1;
		this.ballSpeed = BALL_SPEED;

		// scores

		this.scoreboard = null;
		this.scoreP1Text = null;
		this.scoreP2Text = null;
		this.score1 = 0;
		this.score2 = 0;
		this.maxScore = 1;
		this.bounceTime = 0;

		// Game Start Countdown
		this.starting = false;  // Whether the countdown is active
		this.start = false;     // Whether the game has officially started
		this.countdownText = null; // Holds reference to countdown `Text3D`
		this.countdownMesh = null; // Stores the countdown mesh
		this.matchupMesh = null;
		this.matchText = null;
		this.finishMatchText = false;
		this.namesFinished = false;

		this.bg = new PongBackground(this.scene, this.camera1);
		this.stars = new Stars(this.scene);

		// Create Scene
		this.pongScene = new PongScene(
			this.field_x, this.field_y, this.field_z,
			this.paddle_x, this.paddle_y, this.paddle_z,
			this.ballRadius, this.scene
		);

		this.paddle1 = this.pongScene.getPaddle1();
		this.paddle2 = this.pongScene.getPaddle2();
		this.ball = this.pongScene.getBall();


		//player initialization
		this.player1 = new PlayerController(
			this.state,
			this,
			this.paddle1,
			true
		);

		this.player2 = new PlayerController(
			this.state,
			this,
			this.paddle2,
			false // variable solo para VS IA
		);

		// Glitch
		this.glitchPass = null;
	}

	updateCameraPlayer1() {
		this.cameraManager.updateCamera(this.camera1);
	}

	updateCameraPlayer2() {
		this.cameraManager.updateCamera(this.camera2);
	}

	updateLocalCoopCamera() {
		this.cameraManager.updateCamera(this.localcoopCamera);
	}

	createScoreboard() {
		if (!this.scoreboard) {
			this.scoreboard = new ScoreboardPlayer(this.scene, this.state, this.nicks, this.field_x, this.field_z); // new
		}
		this.scoreboard.resetTextScoreboard();
		this.scoreboard.createP1Score();
		this.scoreboard.createP1Name();
		this.scoreboard.createP2Score();
		this.scoreboard.createP2Name();
	}

	checkOfflineBallCollisions() {
		// if ball goes off the top side (side of table)
		if (this.ball.position.z <= -this.field_z / 2) {
			this.ballDirZ = -this.ballDirZ;
			this.cameraManager.screenShake(this.getCamera());
		}
		// if ball goes off the bottom side (side of table)
		if (this.ball.position.z >= this.field_z / 2) {
			this.ballDirZ = -this.ballDirZ;
			this.cameraManager.screenShake(this.getCamera());
		}

		// update ball position over time
		this.ball.position.x += this.ballDirX * this.ballSpeed;
		this.ball.position.z += this.ballDirZ * this.ballSpeed;

		// limit ball's z-speed to 2x the x-speed
		if (this.ballDirZ > this.ballSpeed * 2) {
			this.ballDirZ = this.ballSpeed * 2;
		}
		else if (this.ballDirZ < -this.ballSpeed * 2) {
			this.ballDirZ = -this.ballSpeed * 2;
		}
	}

	ballPhysics() {
		// Si la pelota esta pausada no la muevas
		if (this.ballPaused) return;

		if (this.ball.position.x <= -this.field_x / 2 - 50) {
			// CPU scores
			this.score2++;
			this.cameraManager.followBall(this.getCamera(), this.ball, false);
			this.glitchPass = new GlitchPass();
			this.state.composer.addPass(this.glitchPass);
			// reset ball to center
			this.scoreboard.updateScoreboard(this.score1, this.score2);
			this.resetBall(2);
			this.matchScoreCheck();
		}

		// if ball goes off the 'right' side (CPU's side)
		if (this.ball.position.x >= this.field_x / 2 + 50) {
			// Player scores
			this.score1++;
			this.cameraManager.followBall(this.getCamera(), this.ball, true);
			this.glitchPass = new GlitchPass();
			this.state.composer.addPass(this.glitchPass);
			// reset ball to center
			this.scoreboard.updateScoreboard(this.score1, this.score2);
			this.resetBall(1);
			this.matchScoreCheck();
		}
		if (!this.multiplayer) this.checkOfflineBallCollisions();
	}

	resetBall(loser) {
		// position the ball in the center of the table
		this.ballPaused = true;
		this.ball.position.x = 0;
		this.ball.position.z = 0;
		this.ballSpeed = BALL_SPEED;

		if (loser == 1) {
			setTimeout(() => {
				this.ballDirX = -1;
				this.ballDirZ = 1;
				this.ballPaused = false;
				this.state.composer.removePass(this.glitchPass);
				this.glitchPass = null;
			}, "3000");
		}
		else {
			setTimeout(() => {
				this.ballDirX = 1;
				this.ballDirZ = 1;
				this.ballPaused = false;
				this.state.composer.removePass(this.glitchPass);
				this.glitchPass = null;
			}, "3000");
		}
	}

	paddlePhysics() {
		// PLAYER PADDLE LOGIC
		if (this.ball.position.x <= this.paddle1.position.x + this.paddle_x
			&& this.ball.position.x >= this.paddle1.position.x) {
			// and if ball is aligned with paddle1 on y plane
			if (this.ball.position.z <= this.paddle1.position.z + this.paddle_z / 2
				&& this.ball.position.z >= this.paddle1.position.z - this.paddle_z / 2) {
				// and if ball is travelling towards player (-ve direction)
				if (this.ballDirX < 0) {
					// stretch the paddle to indicate a hit
					this.bg.updateBackground();
					this.paddle1.scale.z = 1.3;
					let impact = (this.ball.position.z - this.paddle1.position.z) / (this.paddle_z / 2);
					this.ballDirZ = impact * 1.5; // Ajustamos la inclinación del rebote

					// Transferimos parte del movimiento de la pala a la pelota
					this.ballDirZ += this.paddle1DirZ * 0.2;
					if (Math.abs(this.ballDirZ) < 0.2) {
						this.ballDirZ = 0.2 * Math.sign(this.ballDirZ);
					}

					// Invertimos dirección en X (rebote) y Aumentamos velocidad si la pala estaba en movimiento
					this.ballDirX = -this.ballDirX * 1.05;
					let newSpeed = this.ballSpeed + Math.abs(this.paddle1DirZ) * 0.2;
					this.ballSpeed = Math.max(this.ballSpeed, newSpeed) * 1.02;
				}
			}
		}

		if (this.ball.position.x <= (this.paddle2.position.x - 10) + this.paddle_x
			&& this.ball.position.x >= (this.paddle2.position.x - 10)) {
			if (this.ball.position.z <= (this.paddle2.position.z) + this.paddle_z / 2
				&& this.ball.position.z >= (this.paddle2.position.z) - this.paddle_z / 2) {
				if (this.ballDirX > 0) {
					this.bg.updateBackground();
					// stretch the paddle to indicate a hit
					this.paddle2.scale.z = 1.3;

					// Calculamos la desviación en función del punto de impacto
					let impact = (this.ball.position.z - (this.paddle2.position.z)) / (this.paddle_z / 2);
					this.ballDirZ = impact * 1.5;

					// Transferimos parte del movimiento de la pala a la pelota
					this.ballDirZ += this.paddle2DirZ * 0.5;
					if (Math.abs(this.ballDirZ) < 0.2) {
						this.ballDirZ = 0.2 * Math.sign(this.ballDirZ);
					}
					// rebote
					this.ballDirX = -this.ballDirX * 1.05;

					// Aumentamos velocidad si la pala estaba en movimiento
					let newSpeed = this.ballSpeed + Math.abs(this.paddle2DirZ) * 0.2;
					this.ballSpeed = Math.max(this.ballSpeed, newSpeed) * 1.02;
				}
			}
		}
	}

	createWinnerBanner(text) {
		const winnerText = new Text3D(text, { x: 0, y: 50, z: -180 }, 0x000000, 40, 1);

		winnerText.createText((textMesh) => {
			this.winnerText = textMesh;
			if (this.state.currentState !== this.state.states.LOCALCOOP && this.state.currentState !== this.state.states.TOURNAMENTS) {
				if (this.state.player2) {
					this.winnerText.rotation.y = 90 * Math.PI / 180;
					winnerText.centerTextZ();
				} else {
					this.winnerText.rotation.y = -90 * Math.PI / 180;
					winnerText.centerTextZ();
				}
			} else {
				// COOP VIEW FROM ABOVE
				this.winnerText.position.y = 15;
				this.winnerText.position.z = 0;
				this.winnerText.position.x = -180;
				this.winnerText.rotation.x = -30 * Math.PI / 180;
				winnerText.centerTextX();
			}
			this.scene.add(this.winnerText);

			setTimeout(() => {
				this.scene.remove(this.winnerText);
				this.scoreboard.updateScoreboard(0, 0);
				this.backToMenu();
			}, 3000);
		});
	}

	backToMenu() {
		if (this.state.isTournament) {
			if (this.state.forceQuit)
				return this.state.forceQuit = false, this.state.loadScene(this.state.states.MENU);
			this.state.tournamentManager.setWinner(this.winnerResult);
			this.score1 = 0;
			this.score2 = 0;
			this.starting = false;
			this.start = false;
			this.finishMatchText = false;
			this.namesFinished = false;
			this.player1.playerMesh.position.z = 0;
			this.player1.playerMesh.scale.z = 1;
			this.player1.playerMesh.scale.y = 1;
			this.player2.playerMesh.position.z = 0;
			this.player2.playerMesh.scale.z = 1;
			this.player2.playerMesh.scale.y = 1;

			this.nicks = this.state.tournamentManager.next();
			if (this.nicks)
				this.scoreboard.updateNicks(this.nicks[0], this.nicks[1]);
			//this.createScoreboard();
			if (this.state.tournamentManager.finished()) {
				this.player1.removeLocalControls();
				this.player2.removeLocalControls();
				this.state.loadScene(this.state.states.MENU);
			}
			return;
		}
		if (this.multiplayer) {
			//console.log("Sending QUIT signal to server");
			this.networkManager.sendData({ type: "QUIT" });
			this.networkManager.disconnect();
			this.active = false;
			if (this.state.player2)
				this.player2.removeLocalControls();
			else
				this.player1.removeLocalControls();

		}
		if (!this.multiplayer) {
			this.player1.removeLocalControls();
			this.player2.removeLocalControls();
		}
		delete this.player1;
		this.state.player1 = false;
		delete this.player2;
		this.state.player2 = false;
		this.state.loadScene(this.state.states.MENU);
	}

	multiPlayerHandler() {
		this.networkManager.onMessage((data) => {

			if (data.type === "GOAL") {
				this.score1 = data.score1;
				this.score2 = data.score2;
				this.cameraManager.followBall(this.getCamera(), this.ball, false);
				this.glitchPass = new GlitchPass();
				this.state.composer.addPass(this.glitchPass);

				setTimeout(() => {
					this.state.composer.removePass(this.glitchPass);
				}, "3000");

				if (data.endgame) {
					//console.log("Game Over", data.winner);
					this.createWinnerBanner(data.winner);
				}
			}

			if (data.type === "MOVE") {
				if (data.player === this.state.apiState.data.username) {
					//console.log("Ignoring own movement update:", data);
					return; // Ignore our own sent movement
				}
				// Update paddle position
				if (this.state.player2) {
					this.paddle1.targetPosition = new THREE.Vector3(
						this.paddle1.position.x,
						this.paddle1.position.y,
						data.paddleZ
					);
					this.paddle1.position.lerp(this.paddle1.targetPosition, 1);
				}
				if (this.state.player1) {
					this.paddle2.targetPosition = new THREE.Vector3(
						this.paddle2.position.x,
						this.paddle2.position.y,
						data.paddleZ
					);
					this.paddle2.position.lerp(this.paddle2.targetPosition, 1);
				}
			}

			if (data.type === "BALL") {
				if (this.ball) {
					this.ball.targetPosition = new THREE.Vector3(
						data.data.ballX,
						this.ball.position.y,
						data.data.ballZ,
					);
					this.ball.position.lerp(this.ball.targetPosition, 1);
					this.ballDirX = data.data.ballDirX;
					this.ballDirZ = data.data.ballDirZ;
					this.wallImpact = data.wallImpact;
					this.paddleBallImpact = data.paddleBallImpact;

					if (this.wallImpact) this.cameraManager.screenShake(this.getCamera());
					if (this.paddleBallImpact) this.bg.updateBackground();
				}
			}
			if (data.type === "OPPONENT_DISCONNECTED") {
				this.createWinnerBanner("YOU WIN!");
			}
		}
		);
	}

	matchScoreCheck() {
		if (this.score1 >= this.maxScore) {
			if (this.state.isTournament)
				this.winnerResult = [this.nicks[0], this.nicks[1]];
			this.ballSpeed = 0; // Stop ball movement
			this.createWinnerBanner(this.nicks[0] + " wins!");
			// Player 1 celebration effect
			this.bounceTime++;
			this.player1.playerMesh.scale.x = 2 + Math.abs(Math.sin(this.bounceTime * 0.05)) * 10;
		}
		else if (this.score2 >= this.maxScore) {
			if (this.state.isTournament)
				this.winnerResult = [this.nicks[1], this.nicks[0]];
			this.ballSpeed = 0; // Stop ball movement
			this.createWinnerBanner(this.nicks[1] + " wins!");
			// Player 2 celebration effect
			this.bounceTime++;

			this.player2.playerMesh.scale.x = 2 + Math.abs(Math.sin(this.bounceTime * 0.05)) * 10;
		}
	}

	showMatchUp(nicks) {
		if (this.namesFinished) return false;

		this.namesFinished = true;

		this.matchText = new Text3D(`${nicks[0]} vs ${nicks[1]}`, { x: 0, y: 50, z: 0 }, 0x000000, 30, 1);

		this.matchText.createText((textMesh) => {
			this.matchupMesh = textMesh;
			this.matchupMesh.position.y = 100;
			this.matchupMesh.position.z = 60;
			//this.matchupMesh.position.x = -len / 2 * 100;
			this.matchText.centerTextX();
			this.matchupMesh.rotation.x = -30 * Math.PI / 180;
			this.scene.add(this.matchupMesh);

			setTimeout(() => {
				this.scene.remove(this.matchupMesh);
				this.matchupMesh = null;
				this.finishMatchText = true;
			}, 3000);
		})
		return false;
	}

	gameStart() {
		if (this.starting) return false; // Prevent multiple calls
		this.starting = true;

		if (this.camera1) {
			this.cameraManager.startCamera1Animation();
		}
		if (this.camera2) {
			this.cameraManager.startCamera2Animation();
		}

		if (this.matchupMesh) {
			this.scene.remove(this.matchupMesh);
			this.matchupMesh = null;
		}

		let countdown = 3;
		this.countdownText = new Text3D(countdown.toString(), { x: 0, y: 50, z: 6 }, 0x000000, 50, 1);
		this.countdownText.createText((textMesh) => {
			this.countdownMesh = textMesh;

			if (this.state.currentState !== this.state.states.LOCALCOOP &&
				this.state.currentState !== this.state.states.TOURNAMENTS) {
				if (this.state.player2) {
					this.countdownMesh.rotation.y = 90 * Math.PI / 180;
					this.countdownText.centerTextZ();
				} else {
					this.countdownMesh.rotation.y = -90 * Math.PI / 180;
					this.countdownText.centerTextZ();
				}
			} else {
				// COOP VIEW FROM ABOVE
				this.countdownMesh.position.y = 15;
				this.countdownMesh.position.z = -10;
				this.countdownMesh.position.x = -20;
				this.countdownMesh.rotation.x = -30 * Math.PI / 180;
			}
			this.scene.add(this.countdownMesh);
			if (this.state.currentState === this.state.states.LOCALCOOP || this.state.currentState === this.state.states.PLAY || this.state.currentState === this.state.states.TOURNAMENTS) {
				const interval = setInterval(() => {
					countdown--;
					if (countdown >= 0) {
						this.countdownText.updateText(countdown.toString());
					}

					if (countdown <= 0) {
						clearInterval(interval);
						this.scene.remove(this.countdownMesh);
						this.start = true; // Start the game
						this.ballPaused = false;
						this.ballDirX = -1;
						this.ballDirZ = 1;
						this.ballSpeed = BALL_SPEED;
						if (!this.scoreboard)
							this.createScoreboard();
					}
				}, 1000);
			} else {
				this.networkManager.onMessage((data) => {
					if (data.type === "START_GAME_TIMER") {
						this.countdownText.updateText(data.countdown.toString());
						if (data.countdown === 0) {
							this.scene.remove(this.countdownMesh);
							this.start = true;
							if (!this.scoreboard)
								this.createScoreboard();
						}
					}
				});
			}
		});

		return false;
	}

	update() {
		if (!this.paddle1 || !this.paddle2 || !this.ball) return;

		if (this.state.currentState === this.state.states.PLAY) {
			this.updateCameraPlayer1();
		} else if (this.state.currentState === this.state.states.LOCALCOOP || this.state.currentState === this.state.states.TOURNAMENTS) {
			this.updateLocalCoopCamera();
		} else if (this.state.player1) {
			this.updateCameraPlayer1();
		} else if (this.state.player2) {
			this.updateCameraPlayer2();
		}
		if (!this.finishMatchText) {
			this.nicks ? this.nicks : this.nicks = ["P1", "P2"];
			this.finishMatchText = this.showMatchUp(this.nicks);
			return;
		}
		if (!this.start && this.finishMatchText) {
			this.start = this.gameStart();
			return;
		}
		this.stars.animateStars();
		this.player1.update();
		this.player1.playerMesh.scale.z = THREE.MathUtils.lerp(
			this.player1.playerMesh.scale.z, // Current value
			1, // Target value
			0.1 // Lerp factor
		);
		this.player2.update();
		this.player2.playerMesh.scale.z = THREE.MathUtils.lerp(
			this.player2.playerMesh.scale.z, // Current value
			1, // Target value
			0.1 // Lerp factor
		);
		if (!this.multiplayer) {
			this.ballPhysics();
			this.paddlePhysics();
		} else {
			this.multiPlayerHandler();
		}
		this.scoreboard.updateScoreboard(this.score1, this.score2);
		//shaders updaters
		//this.pongScene.table.update();
	}

	getScene() {
		return this.scene;
	}

	getCamera() {
		if (this.state.currentState === this.state.states.LOCALCOOP || this.state.currentState === this.state.states.TOURNAMENTS)
			return this.localcoopCamera;
		else if (this.state.currentState === this.state.states.PLAY)
			return this.camera1;
		else if (this.state.player1)
			return this.camera1;
		else if (this.state.player2)
			return this.camera2;
		//return this.camera1;
	}
}