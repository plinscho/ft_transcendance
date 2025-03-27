import * as THREE from 'three';

export class escMenu {
	constructor(game) {
		this.game = game;
		this.scene = null; // Asignada en createEscBox()
		this.menuOn = false;
		this.box = null;

		// Binding
		this.escButton = this.escapeHandler.bind(this);
		this.clickEscape = this.clickHandler.bind(this);

		this.setListeners();
		this.createBox(); // Crear el HTML una vez
	}

	// Escuchar ESC
	setListeners() {
		window.addEventListener('keydown', this.escButton);
	}

	// Mostrar/ocultar menú al presionar ESC
	escapeHandler(event) {
		if (event.key === 'Escape') {
			//console.log("ESC PRESSED");
			this.createEscBox();
		}
	}
	
	// Acción al hacer clic en el botón del menú
	clickHandler() {
		this.hideMenu();
		this.game.forceQuit = true;
		this.game.scenes[this.game.currentState].backToMenu();
	}

	// Crear el HTML del menú
	createBox() {
		const div = document.createElement('div');
		div.className = 'esc-menu';
		div.innerHTML = `<div class="esc-menu__item">MENU</div>`;
		document.body.appendChild(div);

		// Guardar referencia
		this.box = div;

		// Estilos
		Object.assign(div.style, {
			position: 'fixed',
			top: '10%',
			left: '90%',
			transform: 'translate(-50%, -50%)',
			color: 'white',
			display: 'none', // Oculto por defecto
			backgroundColor: 'rgba(0, 0, 0, 0.9)',
			padding: '20px',
			borderRadius: '10px',
			cursor: 'pointer',
			zIndex: '1000',
			fontFamily: 'Arial',
			fontSize: '20px',
			fontWeight: 'bold',
			textAlign: 'center',
			userSelect: 'none'
		});

		// Añadir el listener solo una vez
		div.addEventListener('click', this.clickEscape);
	}

	// Muestra o esconde el menú
	createEscBox() {
		this.scene = this.game.scenes[this.game.currentState]?.getScene();
		if (!this.scene || this.game.currentState === this.game.states.MENU) return;

		if (!this.menuOn) {
			this.showMenu();
		} else {
			this.hideMenu();
		}
	}

	showMenu() {
		this.box.style.display = 'flex';
		this.menuOn = true;
	}

	hideMenu() {
		this.box.style.display = 'none';
		this.menuOn = false;
	}
}
