import * as THREE from 'three';
import { lang } from './Languages.js';

export class escMenu {
	constructor(game) {
		this.game = game;
		this.scene = null; // Asignada en createEscBox()
		this.menuOn = false;
		this.box = null;
		// Binding
		this.escButton = this.escapeHandler.bind(this);
		this.clickEscape = this.clickHandler.bind(this);
		this.handleLanguageChange = this.updateLanguage.bind(this);
		this.setListeners();
		this.createBox(); // Crear el HTML una vez
	}

	// Escuchar ESC y cambios de idioma
	setListeners() {
		window.addEventListener('keydown', this.escButton);
		window.addEventListener('languageChanged', this.handleLanguageChange);
	}

	// Mostrar/ocultar menú al presionar ESC
	escapeHandler(event) {
		if (event.key === 'Escape') {
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
		div.innerHTML = `<div class="esc-menu__item">${lang.escMenu.gotoMenu}</div>`;
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

	// Actualizar texto cuando cambia el idioma
	updateLanguage() {
		if (this.box) {
			const menuItem = this.box.querySelector('.esc-menu__item');
			if (menuItem) {
				menuItem.textContent = lang.escMenu.gotoMenu;
			}
		}
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

	// Cleanup method to remove event listeners
	dispose() {
		window.removeEventListener('keydown', this.escButton);
		window.removeEventListener('languageChanged', this.handleLanguageChange);
	}
}