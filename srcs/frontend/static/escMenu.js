import { Text3D } from "./Text3D.js";
import * as THREE from 'three';

export class escMenu{
	constructor(game) {
		this.game = game;
		this.scene = null; // setted in createEscBox()
		
		// binding the variable with function
		this.escButton = this.escapeHandler.bind(this);
		this.clickEscape = this.clickHandler.bind(this);
		this.menuOn = false;
		this.box = this.createBox();
		this.setListeners();
		this.createEscBox();
	}

	// listen to all keydowns and callback is this.escButton
	setListeners() {
		window.addEventListener('keydown', this.escButton);
		window.addEventListener('click', this.clickEscape);
	}

	clickHandler() {
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		this.camera = this.game.scenes[this.game.currentState].getCamera(); 
		if (this.menuOn === true) {
			raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects([this.box], true);

            if (intersects.length > 0) {
                const clickedObject = intersects[0].object.parent; // Get the parent group

                if (clickedObject.userData.onClick) {
                    clickedObject.userData.onClick();
                }
            }
		}
	}

	// event is 'keydown', called back from setKeyEscape
	escapeHandler(event){
		if (event.key === 'Escape') {
			// Create button box
			console.log("ESC PRESSED")
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
				if (this.menuOn)
					this.game.scenes[this.game.currentState].backToMenu();
			},
			"/static/fonts/trans.json"
		);
	
		// Creamos un contenedor para el botón, pero lo retornamos en el callback
		const group = new THREE.Group();
	
		button.createText((textMesh) => {
			// Texto
			textMesh.position.set(position.x, position.y, position.z);
	
			// Caja de colisión (invisible)
			const hitboxGeometry = new THREE.PlaneGeometry(4, 0.6);
			const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: true });
			const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
			hitbox.position.copy(textMesh.position);
			hitbox.position.y += 0.2;
			hitbox.position.z -= 0.01;
	
			// Añadir al grupo
			group.add(textMesh);
			group.add(hitbox);
			group.userData.onClick = button.onClick;
	
			// Guardar en this.box cuando esté listo
			this.box = group;
	
			// Si el menú está activado, añadir al scene directamente
			if (this.menuOn && this.scene) {
				this.scene.add(this.box);
			}
		});
	}
	
	createEscBox() {
		this.scene = this.game.scenes[this.game.currentState]?.getScene();
		if (!this.scene || this.game.currentState === this.game.scenes.menu) return;
	
		if (!this.menuOn) {
			// Si la caja no se ha creado aún, la creamos
			if (!this.box) {
				this.createBox(); // Asíncrono, se añade al scene cuando esté lista
			} else {
				this.scene.add(this.box);
			}
			this.menuOn = true;
		} else {
			if (this.box) {
				this.scene.remove(this.box);
			}
			this.menuOn = false;
		}
	}

}