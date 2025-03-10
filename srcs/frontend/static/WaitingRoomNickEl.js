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

		//const div = document.createElement('div');
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
                top: 70%;
                left: 50%;
                transform: translate(-50%, -50%);
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: flex-start;
				height: 100vh;
				gap: 20px;
				padding-top: 50px;
			}
			.nick-container {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				grid-template-rows: repeat(2, 1fr);
				column-gap: 35px;
				row-gap: 15px;
				
				background-color: #000;
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
		`;

		container.className = 'nick-container';
		screen.className = 'screen';

		//container.className = 'nick-container';

		// Anyado los 4 input en un bucle
		for (let i = 1; i <= 4; i++)
		{
			let header = document.createElement('h2');
			header.innerText = `Player ${i}`;
			let input = document.createElement('input');
			input.className = 'nick-input';
			input.placeholder = `alias`;
			let item = document.createElement('div');
			item.appendChild(header);
			item.appendChild(input);
			container.appendChild(item);
		}

		//div.className = 'nick-container';
		//div.innerHTML = `
		//    <input class="nick-input" placeholder="Enter your nickname">
		//    <button class="nick-button">Set Nickname</button>
		//`;

		//shadow.appendChild(style);
		//shadow.appendChild(div);

		// Handle button click
		//const button = div.querySelector('.nick-button');
		//const input = div.querySelector('.nick-input');

		const button = document.createElement('button');
		button.className = 'btn btn-light';
		button.textContent = 'Start!';
		screen.appendChild(container);
		screen.appendChild(button);
		shadow.appendChild(bootstrapLink);
		shadow.appendChild(style);
		shadow.appendChild(screen);
		

		button.addEventListener('click', () => {
			let el = null;
			const nicknames = Array.from(container.querySelectorAll('.nick-input'))
				.map(input => input.value.trim())
				.filter(nickname => nickname);
			
			let findDuplicates = (arr) => new Set(arr).size !== arr.length;
	
			if (findDuplicates(nicknames)) {
				for (let i = 0; i < 4; i++) {
					if (nicknames.indexOf(nicknames[i]) != i) {
						this.shadowRoot.querySelector(".nick-input").style.border = "2px solid red";
						el = container.appendChild(document.createElement('div'));
						el.style.color = "red";
						el.style.textAlign = "center";
						el.innerText = "Nicknames must be unique!";
						return ;
					}
				}
				return ;
			}
			
			console.log('Nicknames:', nicknames); // <-- Para depuración

			if (nicknames.length == 4) {
				this.nicknames = nicknames; // <-- Asigna el valor correctamente
				console.log('Sent nicknames:', this.nicknames);
				screen.style.display = 'none'; // Hide the nickname input after sending
				this.state.launchTournament();
			}
			//Logica error
		});
	}

	getNickNames() {
		return this.nicknames;
	}

	setState(state) {
		this.state = state;
	}
	
	remove() {
		this.shadowRoot.querySelector('.screen').remove();
	}
}

// Define the custom element
customElements.define('set-nick-el', SetNickEl);
