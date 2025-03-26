import * as THREE from 'three';
import { Text3D } from './Text3D.js';
import { SetNickEl } from './WaitingRoomNickEl.js';
import { TournamentManager } from './TournamentManager.js';
import { PongBackground } from './Pong/PongBackground.js';
import { Stars } from './Pong/Stars.js';
import { lang } from './Languages.js';

export class WaitingRoom {
	constructor(state, network) {
		this.scene = new THREE.Scene();
		this.camera = this.createCamera();
		this.stars = new Stars(this.scene);
		this.scene.background = new THREE.Color(0x21282a);
		this.network = network;
		this.isWaiting = true;
		this.active = true;
		this.state = state;
		this.buttons = [];
		this.SetNickEl;
		this.isTournament = this.state.isTournament;
		this.state.resize();
		this.createWaitingRoom();

		// Añadir un listener para cambios de idioma
		this.languageChangedHandler = this.handleLanguageChange.bind(this);
		window.addEventListener('languageChanged', this.languageChangedHandler);
	}

	update() {
		this.stars.animateStars();
	}

	createTournamentScreen() {
		const backToMenu = new Text3D(
			lang.waitingRoom.escToLeave,
			{ x: -3.5, y: 2.5, z: 0 },
			0xffffff,
			0.15,
			0,
			() => { if (this.active) { this.backToMenu(); } }
		);

		backToMenu.createText((textMesh) => {
			textMesh.userData.onClick = backToMenu.onClick;
			textMesh.userData.textId = 'escToLeave'; // Identificador para actualización de idioma
			this.scene.add(textMesh);
			this.buttons.push(textMesh);
		});

		this.SetNickEl = document.createElement('set-nick-el');
		this.SetNickEl.setState(this);
		document.body.appendChild(this.SetNickEl);
	}

	createMultiplayer() {
		const waitingText = new Text3D(
			lang.waitingRoom.waitingText,
			{ x: -4, y: 0, z: 0 },
			0xffffff,
			0.4,
			0,
			() => { }
		);

		waitingText.createText((textMesh) => {
			textMesh.userData.textId = 'waitingText'; // Identificador para actualización de idioma
			this.scene.add(textMesh);
		});

		const backToMenu = new Text3D(
			lang.waitingRoom.escToLeave,
			{ x: -2, y: 1, z: 0 },
			0xffffff,
			0.2,
			0,
			() => { if (this.active) { this.backToMenu(); } }
		);

		backToMenu.createText((textMesh) => {
			textMesh.userData.onClick = backToMenu.onClick;
			textMesh.userData.textId = 'escToLeave'; // Identificador para actualización de idioma
			this.scene.add(textMesh);
			this.buttons.push(textMesh);
		});
		this.network.connect();
		this.network.onMessage((response) => this.handleServerMessage(response));
	}

	createWaitingRoom() {
		if (!this.isTournament) {
			this.createMultiplayer();
		}
		else {
			this.createTournamentScreen();
		}
	}

	// Método para manejar cambios de idioma
	handleLanguageChange() {
		// Actualizar textos 3D en la escena
		this.scene.traverse((object) => {
			if (object.userData && object.userData.textId) {
				// Solo si el objeto tiene un identificador de texto
				if (object.userData.textId === 'waitingText') {
					object.geometry.dispose();
					new Text3D(
						lang.waitingRoom.waitingText,
						object.position,
						object.material.color.getHex(),
						0.4,
						0
					).updateExistingMesh(object);
				}
				else if (object.userData.textId === 'escToLeave') {
					object.geometry.dispose();
					new Text3D(
						lang.waitingRoom.escToLeave,
						object.position,
						object.material.color.getHex(),
						object.position.y === 1 ? 0.15 : 0.2,
						0
					).updateExistingMesh(object);
				}
			}
		});

		// Si existe el componente SetNickEl, actualizar sus textos
		if (this.SetNickEl) {
			this.SetNickEl.updateLanguage();
		}
	}

	launchTournament() {
		this.state.tournamentManager = new TournamentManager(this.state, this.SetNickEl.getNickNames());
		this.state.loadScene(this.state.states.TOURNAMENTS);
	}

	handleServerMessage(data) {
		//console.log("Received message from server: ", data);
		if (data.type === "PLAYER_ONE") this.state.player1 = true;
		if (data.type === "PLAYER_TWO") this.state.player2 = true;
		if (data.type === "START_GAME") {
			//console.log("Match found! Starting game...");
			this.isWaiting = false;
			if (this.SetNickEl)
				this.SetNickEl.remove();
			this.startMultiplayerGame();
		}

	}

	startMultiplayerGame() {
		//console.log("Starting multiplayer Pong...");
		this.state.loadScene(this.state.states.MULTIPLAYER);
	}

	createCamera() {
		const aspect = window.innerWidth / window.innerHeight;
		const frustumSize = 5;

		const camera = new THREE.OrthographicCamera(
			-frustumSize * aspect,
			frustumSize * aspect,
			frustumSize,
			-frustumSize,
			0.1, 100
		);

		camera.position.set(0, 0, 10);
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		return camera;
	}


	escapeHandler(event) {
		if (event.key === 'Escape' && this.isWaiting && this.active) {
			this.backToMenu();
		}
	}

	backToMenu() {
		if (this.isTournament) {
			this.SetNickEl.remove();
			this.state.isTournament = false;
		} else {
			this.network.sendData({ type: "QUIT" });
			this.network.disconnect();
		}
		this.active = false;
		this.state.loadScene(this.state.states.MENU);
	}

	cleanup() {
		window.removeEventListener('languageChanged', this.languageChangedHandler);
	}

	getScene() {
		return this.scene;
	}

	getCamera() {
		return this.camera;
	}
}