import * as THREE from 'three';
import { Menu } from './Menu.js';
import { Pong } from './Pong.js';
import { WaitingRoom } from './WaitingRoom.js';
import { NetworkManager } from './NetworkManager.js';
import { state } from './state.js';
import { LanguageMenu } from './LanguageMenu.js';

export class Game {
    constructor(apiState) {
        this.apiState = apiState;
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        document.body.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        this.network = new NetworkManager();
        this.player1 = false;
        this.player2 = false;
        this.localcoop = false;
        this.states = {
            MENU: 'menu',
            PLAY: 'play',
            LOCALCOOP: 'localcoop',
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
            localcoop: null,
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
        if (this.currentState === sceneName) return;

        this.unloadScene(this.currentState);

        if (!this.scenes[sceneName]) {
            switch (sceneName) {
                case this.states.MENU:
                    this.scenes[sceneName] = new Menu(this, this.camera);
                    break;
                case this.states.PLAY:
                    this.scenes[sceneName] = new Pong(this, false, this.network, this.localcoop);
                    break;
                case this.states.LOCALCOOP:
                        this.scenes[sceneName] = new Pong(this, false, this.network, this.localcoop);
                        break;
                case this.states.WAITING_ROOM:
                    this.scenes[sceneName] = new WaitingRoom(this, this.network);
                    break;
                case this.states.MULTIPLAYER:
                    this.scenes[sceneName] = new Pong(this, true, this.network, this.localcoop);
                    break;
                case this.states.TOURNAMENTS:
                    this.scenes[sceneName] = new Pong(this, true, this.network, this.localcoop);
                    break;
                case this.states.LANGUAGE_MENU:
                    this.scenes[sceneName] = new LanguageMenu(this);
                    break;
                default:
                    console.error(`This scene only exists in your head: ${sceneName}`);
                    return;
            }
        }

        this.changeState(sceneName);
    }

    unloadScene(sceneName) {
        if (!this.scenes[sceneName] || sceneName === this.states.MENU) return;

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
            scene.getScene().remove(child);
        });

        if (scene.cleanup) {
            scene.cleanup();
        }

        this.scenes[sceneName] = null;
    }

    changeState(newState) {
        if (this.scenes.menu) {
            this.scenes.menu.setActive(newState === this.states.MENU);
        }
        this.currentState = newState;
        this.updateCamera();
    }

    updateCamera() {
        if (this.currentState !== this.states.MENU && this.scenes[this.currentState]) {
            this.camera = this.scenes[this.currentState].getCamera();
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
            if (this.currentState === this.states.PLAY || this.currentState === this.states.MULTIPLAYER || this.currentState === this.states.LOCALCOOP) {
                this.scenes[this.currentState].update();
            }
            this.renderer.render(currentScene, this.camera);
        }
        requestAnimationFrame(() => this.gameLoop());
    }
    
}

export const startGame = () => new Game(state);
