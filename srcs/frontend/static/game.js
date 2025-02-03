import * as THREE from 'three';
import { Menu } from './Menu.js';
import { Pong } from './Pong.js';
import { Multiplayer } from './Multiplayer.js';

export class Game {
    constructor() {
        // Configurar renderizador
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Cámara por defecto
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Estados del juego
        this.states = {
            MENU: 'menu',
            PLAY: 'play',
            MULTIPLAYER: 'multiplayer',
            TOURNAMENTS: 'tournament',
            LANGUAGES: 'languages',
        };
        this.currentState = this.states.MENU;

        // Escenas
        this.scenes = {
            menu: new Menu(this, this.camera),
            play: new Pong(this),
            multiplayer: new Multiplayer(this),
            tournament: new Pong(this),
            languages: new Pong(this),
        };

        // Set initial camera
        this.updateCamera();

        // Event listener para redimensionar
        window.addEventListener('resize', this.resize.bind(this));

        // Iniciar el bucle del juego
        this.gameLoop();
    }

    // Cambiar el estado del juego y actualizar la cámara si es necesario
    changeState(newState) {
        this.currentState = newState;
        this.updateCamera();
    }

    // Actualiza la cámara según la escena actual
    updateCamera() {
        if (this.currentState !== this.states.MENU) {
            this.camera = this.scenes[this.currentState].getCamera(); // Use Pong's camera
        } else {
            this.camera = this.scenes.menu.camera; // Use default menu camera
        }
    }

    // Redimensionar correctamente la cámara activa
    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Bucle del juego
    gameLoop() {
        // Ensure `getScene()` is always called
        const currentScene = this.scenes[this.currentState].getScene();
        this.renderer.render(currentScene, this.camera);
        requestAnimationFrame(() => this.gameLoop());
    }
}

export const startGame = () => new Game();
