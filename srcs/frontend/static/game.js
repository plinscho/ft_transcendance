import * as THREE from 'three';
import { logout } from './auth.js';

export class Game {
	constructor() {
		// Configurar escena, cámara y renderizador
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);

		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		// Estados del juego
		this.states = {
			MENU: 'menu',
			PLAY: 'play',
			MULTIPLAYER: 'multiplayer',
			TOURNAMENTS: 'tournament',
		};
		this.currentState = this.states.MENU;

		// Escenas para cada estado
		this.scenes = {
			menu: this.createMenuScene(),
			play: this.createPlayScene(),
			multiplayer: this.createSettingsScene(),
		};

		const loader = new THREE.TextureLoader();
		loader.load('/static/img/bg.webp', (texture) => {
			this.scenes.menu.background = texture;
		});
		this.camera.position.z = 5;


		// Agregar detección de clics
		this.setupEventListeners();

		// Iniciar el bucle del juego
		this.gameLoop();
	}

	// Crear escena del menú
	createMenuScene() {
		const scene = new THREE.Scene();

		// Botón 1: Jugar
		const playButton = this.createButton('Play', 0, 1);
		scene.add(playButton);

		// Botón 2: Multijugador
		const settingsButton = this.createButton('Multiplayer', 0, -1);
		scene.add(settingsButton);

		//Boton 3: LOUGOUT
		const logoutButton = this.createButton('Logout', 0, -3);
		scene.add(logoutButton);
		

		// Asociar botones a acciones
		playButton.userData.onClick = () => this.changeState(this.states.PLAY);
		settingsButton.userData.onClick = () => this.changeState(this.states.MULTIPLAYER);
		logoutButton.userData.onClick = () => { logout(); };

		return scene;
	}

	// Crear escena de juego
	createPlayScene() {
		const scene = new THREE.Scene();

		// Agregar cubo
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		const cube = new THREE.Mesh(geometry, material);
		scene.add(cube);

		// Agregar botón para volver al menú principal
		const menuButton = this.createButton('Menu', -3.5, 2, 0.5, 0.25);
		menuButton.userData.onClick = () => this.changeState(this.states.MENU);
		scene.add(menuButton);

		return scene;
	}

	// Crear escena de configuración
	createSettingsScene() {
		const scene = new THREE.Scene();

		// Texto "Configuración"
		const textGeometry = new THREE.PlaneGeometry(4, 1);
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = 512;
		canvas.height = 128;
		ctx.fillStyle = 'white';
		ctx.font = '40px Arial';
		ctx.fillText('Multiplayer', 150, 80);

		const texture = new THREE.CanvasTexture(canvas);
		const textMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
		const settingsText = new THREE.Mesh(textGeometry, textMaterial);
		scene.add(settingsText);

		// Agregar botón para volver al menú principal
		const menuButton = this.createButton('Menu', -3.5, 2, 0.5, 0.25);
		menuButton.userData.onClick = () => this.changeState(this.states.MENU);
		scene.add(menuButton);

		return scene;
	}

	// Crear un botón en forma de plano
	createButton(label, x, y, width = 2, height = 1) {
		const buttonGeometry = new THREE.PlaneGeometry(width, height);
		const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x007bff });

		const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
		button.position.set(x, y, 0);

		// Agregar texto al botón
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = 256;
		canvas.height = 128;
		ctx.fillStyle = '#007bff';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'white';
		ctx.font = '30px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(label, canvas.width / 2, canvas.height / 2);

		const texture = new THREE.CanvasTexture(canvas);
		button.material.map = texture;
		button.material.needsUpdate = true;

		return button;
	}

	// Configurar detección de clics
	setupEventListeners() {
		document.addEventListener('click', (event) => {
			const mouse = new THREE.Vector2(
				(event.clientX / window.innerWidth) * 2 - 1,
				-(event.clientY / window.innerHeight) * 2 + 1
			);

			const raycaster = new THREE.Raycaster();
			raycaster.setFromCamera(mouse, this.camera);

			const intersects = raycaster.intersectObjects(this.scenes[this.currentState].children);
			if (intersects.length > 0) {
				const clickedObject = intersects[0].object;
				if (clickedObject.userData.onClick) {
					clickedObject.userData.onClick();
				}
			}
		});
	}

	// Cambiar el estado del juego
	changeState(newState) {
		this.currentState = newState;
	}

	animateCube() {
		this.scenes[this.states.PLAY].children[0].rotation.x += 0.01;
		this.scenes[this.states.PLAY].children[0].rotation.y += 0.01;
	}

	// Bucle del juego
	gameLoop() {
		// Renderizar la escena actual
		this.renderer.render(this.scenes[this.currentState], this.camera);
		if (this.states.PLAY === this.currentState) {
			this.animateCube();
		}
		// Solicitar el próximo frame
		requestAnimationFrame(() => this.gameLoop());
	}
}

export const startGame = () => new Game();
