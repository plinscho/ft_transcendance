import * as THREE from 'three';
import { Text3D } from './Text3D.js';

export class escMenu {
	constructor(game) {
		this.game = game;
		this.scene = null; // Se asigna en createEscBox()
		
		// Binding de funciones
		this.escButton = this.escapeHandler.bind(this);
		this.clickEscape = this.clickHandler.bind(this);
		this.menuOn = false;
		this.box = null;
		
		this.setListeners();
	}

	// Escuchar eventos de teclado
	setListeners() {
		window.addEventListener('keydown', this.escButton);
	}

	clickHandler(event) {
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();

		// Normalizar coordenadas del mouse
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		this.camera = this.game.scenes[this.game.currentState].getCamera();
		
		if (this.menuOn) {
			raycaster.setFromCamera(mouse, this.camera);
			const intersects = raycaster.intersectObjects([this.box], true);

			if (intersects.length > 0) {
				const clickedObject = intersects[0].object.parent; // Obtener el grupo padre
				if (clickedObject.userData.onClick) {
					clickedObject.userData.onClick();
				}
			}
		}
	}

	// Manejo de tecla Escape
	escapeHandler(event) {
		if (event.key === 'Escape') {
			console.log("ESC PRESSED");
			this.createEscBox();
		}
	}

	createBox() {
		const position = { x: 0, y: 0, z: 0 };
		const button = new Text3D(
			"GOTO MENU",
			position,
			0xffffff,
			0.4,
			0,
			() => {
				if (this.menuOn) {
					this.game.scenes[this.game.currentState].backToMenu();
					this.menuOn = false;
					window.removeEventListener('click', this.clickEscape);
					this.scene.remove(this.box);
				}
			},
			"/static/fonts/trans.json"
		);
	
		const group = new THREE.Group();
	
		button.createText((textMesh) => {
			textMesh.position.set(position.x, position.y, position.z);
	
			const hitboxGeometry = new THREE.PlaneGeometry(4, 0.6);
			const hitboxMaterial = new THREE.MeshBasicMaterial({
				color: 0x3f7b9d,
				side: THREE.DoubleSide,
				visible: true
			});
			const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
			hitbox.position.copy(textMesh.position);
	
			group.add(textMesh);
			group.add(hitbox);
			group.userData.onClick = button.onClick;
	
			this.box = group;
	
			if (this.menuOn && this.scene) {
				this.scene.add(this.box);
			}
		});
	}
	
	createEscBox() {
		this.scene = this.game.scenes[this.game.currentState]?.getScene();
		if (!this.scene || this.game.currentState === this.game.states.MENU) return;
	
		if (!this.menuOn) {
			if (!this.box) {
				this.createBox();
			}
			// Agregar listener de click solo cuando se abre el menú
			window.addEventListener('click', this.clickEscape);
			this.menuOn = true;
		} else {
			if (this.box) {
				this.menuOn = false;
				window.removeEventListener('click', this.clickEscape);
				this.scene.remove(this.box);
			}
			// Remover listener de click cuando se cierra el menú
		}
	}
}
