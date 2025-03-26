import * as THREE from 'three';
import { Menu } from './Menu.js';
import { Pong } from './Pong/Pong.js';
import { WaitingRoom } from './WaitingRoom.js';
import { NetworkManager } from './NetworkManager.js';
import { state } from './state.js';
import { LanguageMenu } from './LanguageMenu.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { escMenu } from './escMenu.js';


export class Game {
	constructor(apiState) {
		this.apiState = apiState;
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.tournamentManager;
		this.forceQuit = false;

		// for game loop
		this.deltaTime = 0;
		this.fps = 60;
		this.initTime = 0;

		this.nicksResult;

		document.body.appendChild(this.renderer.domElement);

		this.camera = null;

		this.network = new NetworkManager();
		this.player1 = false;
		this.player2 = false;
		this.localcoop = false;
		this.isTournament = false;
		this.tournamentNicksGame;
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
			menu: new Menu(this),
			play: null,
			localcoop: null,
			waiting_room: null,
			multiplayer: null,
			tournament: null,
			language_menu: null
		};
		
		
		//post processing
		this.renderScene;
		this.composer;
		this.outputPass;
		this.bloomPass;
		this.glitchPass;
		this.glitchMe = false;
		this.updateCamera();
		window.addEventListener('resize', this.resize.bind(this));

		this.escapeMenu = new escMenu(this);
		this.gameLoop();
		this.forceQuit = false;
	}
	
	getSceneName() {
		return this.currentState;
	}
	
	loadScene(sceneName) {
		if (this.currentState === sceneName) return;

		this.unloadScene(this.currentState);
		//console.log(`Loading scene: ${sceneName}`);
		if (!this.scenes[sceneName]) {
			switch (sceneName) {
				case this.states.MENU:
					this.scenes[sceneName] = new Menu(this);
					break;
				case this.states.PLAY:
					this.scenes[sceneName] = new Pong(this, false, this.network, this.localcoop);
					break;
				case this.states.LOCALCOOP:
						this.scenes[sceneName] = new Pong(this, false, this.network, true);
						break;
				case this.states.WAITING_ROOM:
					this.scenes[sceneName] = new WaitingRoom(this, this.network);
					break;
				case this.states.MULTIPLAYER:
					this.scenes[sceneName] = new Pong(this, true, this.network, this.localcoop);
					break;
				case this.states.TOURNAMENTS:
					this.scenes[sceneName] = new Pong(this, false, this.network, this.localcoop, this.tournamentNicksGame);
					break;
				case this.states.LANGUAGE_MENU:
					this.scenes[sceneName] = new LanguageMenu(this);
					break;
				default:
					//console.error(`This scene only exists in your head: ${sceneName}`);
					this.loadScene(this.states.MENU);
					return;
			}
		}

		this.changeState(sceneName);
	}

	unloadScene(sceneName) {
		if (!this.scenes[sceneName]) return;
		
		if (this.scenes[sceneName] === this.scenes.menu) {
			//this.scenes.menu.dispose();
			this.scenes[sceneName] = null;
			return;
		}
		//console.log(`Unloading scene: ${sceneName}`);
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
		this.camera = this.scenes[this.currentState].getCamera();
		this.applyPostProcessing();
	}

	applyPostProcessing() {
		this.renderScene = new RenderPass(this.scenes[this.currentState].getScene(), this.camera);
		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(this.renderScene);
		if (this.glitchMe){
			this.glitchPass = new GlitchPass();
			this.composer.addPass(this.glitchPass);
		}
		this.bloomPass =new UnrealBloomPass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			0.20,
			0.1,
			0.1
		);
		this.composer.addPass(this.bloomPass);
		this.bloomPass.strength = 0.10;
		this.bloomPass.radius = 0.1;
		this.bloomPass.threshold = 0.1;
		this.outputPass = new OutputPass();
		this.composer.addPass(this.outputPass);
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1;
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
	}

	resize() {
		if (!this.camera || !this.renderer || !this.composer) return;
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.composer.setSize(window.innerWidth, window.innerHeight);
	}

	

	timeMs() {
		if (this.initTime === 0) {
			this.initTime = Date.now();
		}
		return (Date.now() - this.initTime);
	}

	// TODO: Add 30 fps limit
	gameLoop() {
		if (this.quit) return;
		requestAnimationFrame(() => this.gameLoop()); // Always request the next frame
	
		const timeNow = Date.now();
		this.deltaTime = (timeNow - this.lastUpdate) / 1000; // Convert to seconds
		const timeUpdate = 1 / this.fps; // Frame duration in seconds
	
		if (this.deltaTime < timeUpdate) return;
		this.lastUpdate = timeNow;
	
		const currentScene = this.scenes[this.currentState]?.getScene();
		if (currentScene) {
			if (this.currentState === this.states.PLAY || 
				this.currentState === this.states.MULTIPLAYER || 
				this.currentState === this.states.LOCALCOOP ||
				this.currentState === this.states.TOURNAMENTS ||
				this.currentState === this.states.MENU) {
				this.scenes[this.currentState].update();
			}
			this.composer.render();
		}
	}

	removeRenderer() {
		this.quit = true;
		this.unloadScene(this.scenes.menu);
		this.scenes.menu.removeEventListeners();
		this.scenes.menu.removeKeyboardNavigation();

		if (this.renderer.domElement.parentElement) {
			this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
			if (this.renderer) this.renderer.dispose();
			this.camera = null;
			this.renderer = null;
			this.composer = null;
			this.escapeMenu = null;
			this.NetworkManager = null;
			this.scenes.menu = null;
			this.states = null;
			this.currentState = null;
		}
	}
	
}

export const startGame = () => state.gameRef = new Game(state);
