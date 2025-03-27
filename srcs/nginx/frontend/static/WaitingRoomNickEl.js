
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
				gap: 40px;
				padding-top: 50px;
			}
			.nick-container {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				grid-template-rows: repeat(2, 1fr);
				column-gap: 60px;
				row-gap: 50px;
				background-color: transparent;
				border-radius: 15px;
				z-index: 1;
			}
			.input__container {
				position: relative;
				background: #f0f0f0;
				padding: 20px;
				display: flex;
				justify-content: flex-start;
				align-items: center;
				gap: 15px;
				border: 4px solid #000;
				max-width: 350px;
				transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
				transform-style: preserve-3d;
				transform: rotateX(10deg) rotateY(-10deg);
				perspective: 1000px;
				box-shadow: 10px 10px 0 #000;
			}
			.input__container:hover {
				transform: rotateX(5deg) rotateY(1 deg) scale(1.05);
				box-shadow: 25px 25px 0 -5px #e9b50b, 25px 25px 0 0 #000;
			}
			.shadow__input {
				content: "";
				position: absolute;
				width: 100%;
				height: 100%;
				left: 0;
				bottom: 0;
				z-index: -1;
				transform: translateZ(-50px);
				background: linear-gradient(
					45deg,
					rgba(255, 107, 107, 0.4) 0%,
					rgba(255, 107, 107, 0.1) 100%
				);
				filter: blur(20px);
			}
			.input__button__shadow {
				cursor: pointer;
				border: 3px solid #000;
				background: #e9b50b;
				transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 10px;
				transform: translateZ(20px);
				position: relative;
				z-index: 3;
				font-weight: bold;
				text-transform: uppercase;
			}
			.input__button__shadow:hover {
				background: #e9b50b;
				transform: translateZ(10px) translateX(-5px) translateY(-5px);
				box-shadow: 5px 5px 0 0 #000;
			}
			.input__button__shadow svg {
				fill: #000;
				width: 25px;
				height: 25px;
			}
			.input__search {
				width: 100%;
				outline: none;
				border: 3px solid #000;
				padding: 15px;
				font-size: 18px;
				background: #fff;
				color: #000;
				transform: translateZ(10px);
				transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
				position: relative;
				z-index: 3;
				font-family: "Roboto", Arial, sans-serif;
				letter-spacing: -0.5px;
			}
			.input__search::placeholder {
				color: #666;
				font-weight: bold;
				text-transform: uppercase;
			}
			.input__search:hover,
			.input__search:focus {
				background: #f0f0f0;
				transform: translateZ(20px) translateX(-5px) translateY(-5px);
				box-shadow: 5px 5px 0 0 #000;
			}
			.input__container::before {
				content: "Player:";
				position: absolute;
				top: -15px;
				left: 20px;
				background: #e9b50b;
				color: #000;
				font-weight: bold;
				padding: 5px 10px;
				font-size: 14px;
				transform: translateZ(50px);
				z-index: 4;
				border: 2px solid #000;
			}
			.btn {
				font-size: 17px;
				background: transparent;
				border: none;
				padding: 1em 1.5em;
				color: #ffedd3;
				text-transform: uppercase;
				position: relative;
				transition: 0.5s ease;
				cursor: pointer;
			}
				
			.btn::before {
				content: "";
				position: absolute;
				left: 0;
				bottom: 0;
				height: 2px;
				width: 0;
				background-color: #ffc506;
				transition: 0.5s ease;
			}
				
			.btn:hover {
				color: #1e1e2b;
				transition-delay: 0.5s;
			}
				
			.btn:hover::before {
				width: 100%;
			}
			.btn::after {
				content: "";
				position: absolute;
				left: 0;
				bottom: 0;
				height: 0;
				width: 100%;
				background-color: #ffc506;
				transition: 0.4s ease;
				z-index: -1;
			}
			.btn:hover::after {
				height: 100%;
				transition-delay: 0.4s;
				color: aliceblue;
			}
		`;

		container.className = 'nick-container';
		screen.className = 'screen';

		// Añado los 4 input en un bucle
		for (let i = 1; i <= 4; i++) {
			const inputContainer = document.createElement('div');
			inputContainer.className = 'input__container';

			const shadowInput = document.createElement('div');
			shadowInput.className = 'shadow__input';

			const inputButtonShadow = document.createElement('button');
			inputButtonShadow.className = 'input__button__shadow';
			inputButtonShadow.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000" width="20px" height="20px">
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                </svg>
            `;

			const inputSearch = document.createElement('input');
			inputSearch.type = 'text';
			inputSearch.name = 'username';
			inputSearch.setAttribute("maxlength", "8");
			inputSearch.setAttribute("autocomplete", "off");
			inputSearch.className = 'input__search nick-input';
			inputSearch.placeholder = lang.tournament.placeholder;

			const errorMessage = document.createElement('div');
			errorMessage.className = 'error-message';
			errorMessage.style.display = 'none';

			inputContainer.appendChild(shadowInput);
			inputContainer.appendChild(inputButtonShadow);
			inputContainer.appendChild(inputSearch);
			inputContainer.appendChild(errorMessage);

			container.appendChild(inputContainer);
		}

		const button = document.createElement('button');
		button.id = 'startButton';
		button.className = 'btn';
		button.textContent = lang.tournament.start;

		screen.appendChild(container);
		screen.appendChild(button);
		shadow.appendChild(bootstrapLink);
		shadow.appendChild(style);
		shadow.appendChild(screen);

		this.screen = screen;
		this.container = container;
		this.startButton = button;

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

			//console.log('Nicknames:', nicknames); // <-- Para depuración

			if (nicknames.length === 4) {
				this.nicknames = nicknames; // <-- Asigna el valor correctamente
				//console.log('Sent nicknames:', this.nicknames);
				screen.style.display = 'none'; // Hide the nickname input after sending
				this.state.launchTournament();
			}
		});

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

	remove() {
		if (this.shadowRoot && this.shadowRoot.querySelector('.screen')) {
			this.shadowRoot.querySelector('.screen').remove();
		}
	}
}

// Define the custom element
customElements.define('set-nick-el', SetNickEl);