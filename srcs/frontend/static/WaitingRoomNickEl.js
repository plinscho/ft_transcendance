// export class SetNickEl extends HTMLElement {
// 	constructor() {
// 		super(); // Call the parent constructor
// 		this.state = null; // Will be set after instantiation
// 		this.nicknames = null;

// 		const bootstrapLink = document.createElement('link');
// 		bootstrapLink.rel = 'stylesheet';
// 		bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';

// 		const shadow = this.attachShadow({ mode: 'open' });
// 		const screen = document.createElement('div');

// 		//const div = document.createElement('div');
// 		const style = document.createElement('style');

// 		const container = document.createElement('div');

// 		style.textContent = `
// 			h2 {
// 				font-size: 16px;
// 				color: white;
// 				text-align: center;
// 				margin: 0px;
// 				padding: 0px;
// 			}
// 			.screen {
// 				position: absolute;
//                 top: 50%;
//                 left: 50%;
//                 transform: translate(-50%, -50%);
// 				display: flex;
// 				flex-direction: column;
// 				align-items: center;
// 				justify-content: flex-start;
// 				height: auto;
// 				gap: 20px;
// 				padding-top: 50px;
// 			}
// 			.nick-container {
// 				display: grid;
// 				grid-template-columns: repeat(2, 1fr);
// 				grid-template-rows: repeat(2, 1fr);
// 				column-gap: 35px;
// 				row-gap: 15px;

// 				background-color: transparent;
// 				border-radius: 10px;
// 				z-index: 1;
// 			}
// 			.nick-input {
// 				width: auto;
// 				padding: 5px;
// 				margin: 5px;
// 				border-radius: 5px;
// 				font-size: 16px;
// 			}
// 			.nick-button {
// 				padding: 5px 5px;
// 				margin-top: 10px;
// 				border-radius: 0px;
// 				font-size: 16px;
// 				background-color: #333;
// 				color: #fff;
// 				cursor: pointer;
// 			}
// 			.error-message {
//                 color: red;
//                 font-size: 12px;
//                 margin-top: 5px;
//             }
// 		`;

// 		container.className = 'nick-container';
// 		screen.className = 'screen';

// 		//container.className = 'nick-container';

// 		// Anyado los 4 input en un bucle
// 		for (let i = 1; i <= 4; i++)
// 		{
// 			let header = document.createElement('h2');
// 			header.innerText = `Player ${i}`;
// 			let input = document.createElement('input');
// 			input.className = 'nick-input';
// 			input.placeholder = `alias`;
// 			let errorMessage = document.createElement('div');
//             errorMessage.className = 'error-message';
//             errorMessage.style.display = 'none';
// 			let item = document.createElement('div');
// 			item.appendChild(header);
// 			item.appendChild(input);
// 			item.append(errorMessage);
// 			container.appendChild(item);
// 		}

// 		//div.className = 'nick-container';
// 		//div.innerHTML = `
// 		//    <input class="nick-input" placeholder="Enter your nickname">
// 		//    <button class="nick-button">Set Nickname</button>
// 		//`;

// 		//shadow.appendChild(style);
// 		//shadow.appendChild(div);

// 		// Handle button click
// 		//const button = div.querySelector('.nick-button');
// 		//const input = div.querySelector('.nick-input');

// 		const button = document.createElement('button');
// 		button.className = 'btn btn-light';
// 		button.textContent = 'Start!';
// 		screen.appendChild(container);
// 		screen.appendChild(button);
// 		shadow.appendChild(bootstrapLink);
// 		shadow.appendChild(style);
// 		shadow.appendChild(screen);


// 		//button.addEventListener('click', () => {
// 		//	const nicknames = Array.from(container.querySelectorAll('.nick-input'))
// 		//		.map(input => input.value.trim())
// 		//		.filter(nickname => nickname);
// 		//	
// 		//	let findDuplicates = (arr) => new Set(arr).size !== arr.length;
// 	//
// 		//	if (findDuplicates(nicknames)) {
// 		//		for (let i = 0; i < 4; i++) {
// 		//			if (nicknames.indexOf(nicknames[i]) != i) {
// 		//				this.shadowRoot.querySelector(".nick-input").style.border = "2px solid red";
// 		//				return ;
// 		//			}
// 		//		}
// 		//		return ;
// 		//	}
// 		//	
// 		//	console.log('Nicknames:', nicknames); // <-- Para depuración
// //
// 		//	if (nicknames.length == 4) {
// 		//		this.nicknames = nicknames; // <-- Asigna el valor correctamente
// 		//		console.log('Sent nicknames:', this.nicknames);
// 		//		screen.style.display = 'none'; // Hide the nickname input after sending
// 		//		this.state.launchTournament();
// 		//	}
// 		//	//Logica error
// 		//});
// 		button.addEventListener('click', () => {
//             const inputs = Array.from(container.querySelectorAll('.nick-input'));
//             const nicknames = inputs.map(input => input.value.trim());

//             // Reset error states
//             inputs.forEach(input => {
//                 input.style.border = '';
//                 input.nextElementSibling.style.display = 'none';
//             });

// 			let hasErrors = false;
// 			inputs.forEach(input => {
// 				if (input.value.trim() === '') {
// 					input.style.border = '2px solid red';
//                     input.nextElementSibling.textContent = "Watch out! Nickname can' be empty";
//                     input.nextElementSibling.style.display = 'block';
//                     hasErrors = true;
// 				}
// 			})
// 			if (hasErrors) return;

//             let findDuplicates = (arr) => new Set(arr).size !== arr.length;

//             if (findDuplicates(nicknames)) {
//                 const duplicates = nicknames.filter((item, index) => nicknames.indexOf(item) !== index);
//                 inputs.forEach(input => {
//                     if (duplicates.includes(input.value.trim())) {
//                         input.style.border = '2px solid red';
//                         input.nextElementSibling.textContent = 'Duplicate nickname';
//                         input.nextElementSibling.style.display = 'block';
//                     }
//                 });
//                 return;
//             }

//             console.log('Nicknames:', nicknames); // <-- Para depuración

//             if (nicknames.length === 4) {
//                 this.nicknames = nicknames; // <-- Asigna el valor correctamente
//                 console.log('Sent nicknames:', this.nicknames);
//                 screen.style.display = 'none'; // Hide the nickname input after sending
//                 this.state.launchTournament();
//             }
//         });
// 	}

// 	getNickNames() {
// 		return this.nicknames;
// 	}

// 	setState(state) {
// 		this.state = state;
// 	}

// 	remove() {
// 		this.shadowRoot.querySelector('.screen').remove();
// 	}
// }

// // Define the custom element
// customElements.define('set-nick-el', SetNickEl);

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
				gap: 20px;
				padding-top: 50px;
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
				content: "USERNAME";
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
		button.className = 'btn btn-light';
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

			console.log('Nicknames:', nicknames); // <-- Para depuración

			if (nicknames.length === 4) {
				this.nicknames = nicknames; // <-- Asigna el valor correctamente
				console.log('Sent nicknames:', this.nicknames);
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