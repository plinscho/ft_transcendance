export class MenuScape extends HTMLElement {
	constructor() {
		super();
		this.state = null;
		this.gameState = null;

		//Creamos el Shadow DOM
		this.attachShadow({ mode: 'open'});

		const style = document.createElement('style');
		style.textContent = `
			.menu-button {
                display: flex;
                flex-direction: column;
                width: 3rem;
                height: 3rem;
                border: 0;
                background: transparent;
                gap: .65rem;
                cursor: pointer;
                justify-content: center;
                align-items: center;
                position: absolute;
                top: -120px;
                left: -90px;
                z-index: 10;
            }
            .menu-button > div {
                background: white;
                height: 2px;
                width: 100%;
                border-radius: 5px;
                transition: all .5s;
                transform-origin: left;
            }
            .menu-button:hover > div:first-child {
                transform: rotate(45deg);
            }
            .menu-button:hover > div:nth-child(2) {
                opacity: 0;
            }
            .menu-button:hover > div:last-child {
                transform: rotate(-45deg);
            }
		`;

		// Creamos el boton y los 3 divs
		this.button = document.createElement('button');
		this.button.className = 'menu-button';

		for (let i = 0; i < 3; i++) {
            const div = document.createElement('div');
            button.appendChild(div);
        }

		// Agregamos el boton a los Shadow DOM
		this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(this.button);

		button_menu.addEventListener('click', () => {
			if (!this.state || !this.gameState) {
				console.error("El estado o el gameState no están definidos");
				return;
			}
			if (this.state.SetNickEl) {
				this.state.SetNickEl.remove();
			}//Meter los demas if para hacer el remove de cada pantalla
			this.state.state.isTournament = false;
			this.state.active = false;
        	this.gameState.loadScene(this.gameState.states.MENU);
		});

		this.button = button_menu;
	}

	setState(state) {
		this.state = state;
	}

	setGameState(state) {
		this.gameState = state;
	}

	attachToContainer(container) {
		container.appendChild(this.button);
	}
}

customElements.define('menu-scape', MenuScape);