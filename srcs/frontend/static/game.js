import * as THREE from 'three';
import { logout } from './auth.js';
import { Menu } from './Menu.js';
import { Pong } from './Pong.js';

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
			LANGUAGES: 'languages',
		};
		this.currentState = this.states.MENU;

		// Escenas para cada estado
		this.scenes = {
			menu: new Menu(this, this.camera).getScene(),
			play: new Pong(this).getScene(),
			multiplayer: new Pong(this).getScene(),
			tournament: new Pong(this).getScene(),
			languages: new Pong(this).getScene(),
		};

        this.scenes.menu.background = new THREE.Color(0x424242);
		this.camera.position.z = 5;


		// Iniciar el bucle del juego
		this.gameLoop();
	}


	// Cambiar el estado del juego
	changeState(newState) {
		this.currentState = newState;
	}

	// Bucle del juego
	gameLoop() {
		// Renderizar la escena actual
		this.renderer.render(this.scenes[this.currentState], this.camera);
		// Solicitar el próximo frame
		requestAnimationFrame(() => this.gameLoop());
	}
}

export const startGame = () => new Game();
