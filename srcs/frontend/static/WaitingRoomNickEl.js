import { lang } from './Languages.js';

export class SetNickEl extends HTMLElement {
	constructor() {
		super(); // Call the parent constructor
		this.state = null; // Will be set after instantiation
		this.nicknames = null;

		const bootstrapLink = document.createElement('link');
		bootstrapLink.rel = 'stylesheet';
		bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';

		const shadow = this.attachShadow({ mode: 'open' });
		const screen = document.createElement('div');
		const style = document.createElement('style');
		const container = document.createElement('div');

		style.textContent = `
			h2 {
				font-size: 16px;
				color: white;
				text-align: center;
				margin: 0px;
				padding: 0px;
			}
			.screen {
				position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: flex-start;
				height: auto;
				gap: 20px;
				padding-top: 50px;
			}
			.nick-container {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				grid-template-rows: repeat(2, 1fr);
				column-gap: 35px;
				row-gap: 15px;
				
				background-color: transparent;
				border-radius: 10px;
				z-index: 1;
			}
			.nick-input {
				width: auto;
				padding: 5px;
				margin: 5px;
				border-radius: 5px;
				font-size: 16px;
			}
			.nick-button {
				padding: 5px 5px;
				margin-top: 10px;
				border-radius: 0px;
				font-size: 16px;
				background-color: #333;
				color: #fff;
				cursor: pointer;
			}
			.error-message {
                color: red;
                font-size: 12px;
                margin-top: 5px;
            }
		`;

		/*
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
		*/
		container.className = 'nick-container';
		screen.className = 'screen';

		// Añado los 4 input en un bucle
		for (let i = 1; i <= 4; i++)
		{
			let header = document.createElement('h2');
			header.innerText = `${lang.tournament.player} ${i}`;
			header.dataset.playerIndex = i; // Para actualizar el texto más tarde
			
			let input = document.createElement('input');
			input.className = 'nick-input';
			input.placeholder = lang.tournament.placeholder;
			
			let errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.style.display = 'none';
			
			let item = document.createElement('div');
			item.appendChild(header);
			item.appendChild(input);
			item.append(errorMessage);
			container.appendChild(item);
		}
 
		const button = document.createElement('button');
		button.id = 'startButton';
		button.className = 'btn btn-light';
		button.textContent = lang.tournament.start;

		//const button_menu = document.createElement('button');
		//button_menu.id = 'menu_button';
		//button_menu.className = 'menu-button';

		//for (let i = 0; i < 3; i++) {
		//	const div = document.createElement('div');
		//	button_menu.appendChild(div);
		//}

		this.menuButton = document.createElement('menu-scape');
		this.menuButton.setState(this.state);
		this.menuButton.setGameState(this.gameState);

		
		screen.appendChild(container);
		screen.appendChild(button);

		//screen.appendChild(button_menu);
		screen.appendChild(this.menuButton);

		shadow.appendChild(bootstrapLink);
		shadow.appendChild(style);
		shadow.appendChild(screen);
		
		this.screen = screen;
		this.container = container;
		this.startButton = button;
		//this.menu_button = button_menu;

		button.addEventListener('click', () => {
            const inputs = Array.from(container.querySelectorAll('.nick-input'));
            const nicknames = inputs.map(input => input.value.trim());

            // Reset error states
            inputs.forEach(input => {
                input.style.border = '';
                input.nextElementSibling.style.display = 'none';
            });

			let hasErrors = false;
			inputs.forEach(input => {
				if (input.value.trim() === '') {
					input.style.border = '2px solid red';
                    input.nextElementSibling.textContent = lang.tournament.nickEmpty;
                    input.nextElementSibling.style.display = 'block';
                    hasErrors = true;
				}
			})
			if (hasErrors) return;

            let findDuplicates = (arr) => new Set(arr).size !== arr.length;

            if (findDuplicates(nicknames)) {
                const duplicates = nicknames.filter((item, index) => nicknames.indexOf(item) !== index);
                inputs.forEach(input => {
                    if (duplicates.includes(input.value.trim())) {
                        input.style.border = '2px solid red';
                        input.nextElementSibling.textContent = lang.tournament.duplicateNick;
                        input.nextElementSibling.style.display = 'block';
                    }
                });
                return;
            }

            console.log('Nicknames:', nicknames); // <-- Para depuración

            if (nicknames.length === 4) {
                this.nicknames = nicknames; // <-- Asigna el valor correctamente
                console.log('Sent nicknames:', this.nicknames);
                screen.style.display = 'none'; // Hide the nickname input after sending
                this.state.launchTournament();
            }
        });

		/*button_menu.addEventListener('click', () => {
			
			//this.state.active = true;
			//this.state.
			//this.state.escapeHandler();
			console.log("Entra click");
			this.state.SetNickEl.remove();
			this.state.state.isTournament = false;
			this.state.active = false;
        	this.gameState.loadScene(this.gameState.states.MENU);
		});*/
        
        // Escuchar cambios de idioma
        window.addEventListener('languageChanged', () => this.updateLanguage());
	}

	updateLanguage() {
		// Actualizar textos de las cabeceras de jugadores
		const headers = this.shadowRoot.querySelectorAll('h2');
		headers.forEach(header => {
			const playerIndex = header.dataset.playerIndex;
			if (playerIndex) {
				header.innerText = `${lang.tournament.player} ${playerIndex}`;
			}
		});
		
		// Actualizar placeholders de los inputs
		const inputs = this.shadowRoot.querySelectorAll('.nick-input');
		inputs.forEach(input => {
			input.placeholder = lang.tournament.placeholder;
		});
		
		// Actualizar botón de inicio
		const startButton = this.shadowRoot.getElementById('startButton');
		if (startButton) {
			startButton.textContent = lang.tournament.start;
		}
		
		// Actualizar mensajes de error si están visibles
		const visibleErrors = this.shadowRoot.querySelectorAll('.error-message[style*="block"]');
		visibleErrors.forEach(error => {
			if (error.textContent.includes('empty')) {
				error.textContent = lang.tournament.nickEmpty;
			} else if (error.textContent.includes('Duplicate')) {
				error.textContent = lang.tournament.duplicateNick;
			}
		});
	}

	getNickNames() {
		return this.nicknames;
	}

	setState(state) {
		this.state = state;
	}

	setGameState(state) {
		this.gameState = state;
	}
	
	remove() {
		if (this.shadowRoot && this.shadowRoot.querySelector('.screen')) {
			this.shadowRoot.querySelector('.screen').remove();
		}
	}
}

// Define the custom element
customElements.define('set-nick-el', SetNickEl);