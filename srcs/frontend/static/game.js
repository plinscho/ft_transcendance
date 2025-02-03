import * as THREE from 'three';
import { Menu } from './Menu.js';
import { Pong } from './Pong.js';
import { Multiplayer, PlayerSocket} from './Multiplayer.js';

export class Game {
    constructor() {

        // Start initializing to null
        this.socket = null;

        // Configurar renderizador
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Cámara por defecto
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Call method for new connection
        this.createWebSocket()

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
            play: null, //new Pong(this),
            multiplayer: null, //new Multiplayer(this.socket),
            tournament: null, //new Pong(this),
            languages: null, //new Pong(this),
        };

        // Set initial camera
        this.updateCamera();

        // Event listener para redimensionar
        window.addEventListener('resize', this.resize.bind(this));

        // Iniciar el bucle del juego
        this.gameLoop();
    }

    loadScene(sceneName){
        if (!this.scenes[sceneName]) {
            switch (sceneName) {
                case this.states.PLAY:
                    this.scenes[sceneName] = new Pong(this);
                    break;
                
                case this.states.MULTIPLAYER:
                    this.scenes[sceneName] = new Multiplayer(this.socket);
                    break;
                    
                case this.states.TOURNAMENTS:
                    this.scenes[sceneName] = new Pong(this);
                    break;
                
                case this.states.LANGUAGES:
                    this.scenes[sceneName] = new Pong(this);
                    break;

                default:
                    console.error(`Scene only in you head. ${sceneName}`)
            }
        }

        this.changeState(sceneName);
    }

    // Create websocket
    createWebSocket() {
        // If there already is a socket, do not make another one
        if (this.socket) return ;
        // If the socket is not created, make one.
        this.socket = new PlayerSocket().getSocket();
        if (this.socket === null){
            this.socket.close();
        }
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
