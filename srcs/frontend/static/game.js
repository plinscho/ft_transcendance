import * as THREE from 'three';
import { Menu } from './Menu.js';
import { Pong } from './Pong.js';
import { WaitingRoom } from './WaitingRoom.js';
import { LanguageMenu } from './LanguageMenu.js';

export class Game {
    constructor() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.states = {
            MENU: 'menu',
            PLAY: 'play',
            WAITING_ROOM: 'waiting_room',
            MULTIPLAYER: 'multiplayer',
            TOURNAMENTS: 'tournament',
            LANGUAGE_MENU: 'language_menu'
        };

        this.currentState = this.states.MENU;
        this.previousScene = null;

        this.scenes = {
            menu: new Menu(this, this.camera),
            play: null,
            waiting_room: null,
            multiplayer: null,
            tournament: null,
            language_menu: null
        };

        this.updateCamera();
        window.addEventListener('resize', this.resize.bind(this));
        this.gameLoop();
    }

    loadScene(sceneName) {
        if (this.scenes[sceneName]) {
            this.unloadScene(this.currentState);
        } else {
            switch (sceneName) {
                case this.states.MENU:
                    this.scenes[sceneName] = new Menu(this, this.camera);
                    break;
                case this.states.PLAY:
                    this.scenes[sceneName] = new Pong(this, false);
                    break;
                case this.states.WAITING_ROOM:
                    this.scenes[sceneName] = new WaitingRoom(this, this.isTournament);
                    break;
                case this.states.MULTIPLAYER:
                    this.scenes[sceneName] = new Pong(this, true);
                    break;
                case this.states.TOURNAMENTS:
                    this.scenes[sceneName] = new Pong(this);
                    break;
                case this.states.LANGUAGE_MENU:
                    this.scenes[sceneName] = new LanguageMenu(this);
                    break;
                default:
                    console.error(`Scene not found: ${sceneName}`);
                    return;
            }
        }

        this.changeState(sceneName);
    }

    unloadScene(sceneName) {
        if (this.scenes[sceneName] === this.scenes.menu) return;
        if (!this.scenes[sceneName]) return;

        console.log(`Unloading scene: ${sceneName}`);

        const scene = this.scenes[sceneName];
        
        scene.getScene().children.forEach((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
            this.scenes[sceneName].getScene().remove(child);
        });

        this.scenes[sceneName] = null;
    }

    changeState(newState) {
        if (this.scenes[this.currentState]) {
            this.scenes[this.currentState].setActive(false);
        }

        this.currentState = newState;

        if (this.scenes[newState]) {
            this.scenes[newState].setActive(true);
        }

        this.updateCamera();
    }

    updateCamera() {
        if (this.currentState !== this.states.MENU) {
            this.camera = this.scenes[this.currentState]?.getCamera() || this.camera;
        } else {
            this.camera = this.scenes.menu.camera;
        }
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    gameLoop() {
        const currentScene = this.scenes[this.currentState]?.getScene();
        if (currentScene) {
            this.renderer.render(currentScene, this.camera);
        }
        requestAnimationFrame(() => this.gameLoop());
    }
}

export const startGame = () => new Game();
