export class SetNickEl extends HTMLElement {
    constructor() {
        super(); // Call the parent constructor
        this.network = null; // Will be set after instantiation

        const shadow = this.attachShadow({ mode: 'open' });

        const div = document.createElement('div');
        const style = document.createElement('style');

        style.textContent = `
            .nick-container {
                position: absolute;
                top: 70%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #000;
                padding: 20px;
                border-radius: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                z-index: 1;
            }
            .nick-input {
                width: 100%;
                padding: 5px;
                margin: 5px;
                border-radius: 5px;
                font-size: 16px;
            }
            .nick-button {
                padding: 5px;
                margin: 5px;
                border-radius: 5px;
                font-size: 16px;
                background-color: #333;
                color: #fff;
                cursor: pointer;
            }
        `;

        div.className = 'nick-container';
        div.innerHTML = `
            <input class="nick-input" placeholder="Enter your nickname">
            <button class="nick-button">Set Nickname</button>
        `;

        shadow.appendChild(style);
        shadow.appendChild(div);

        // Handle button click
        const button = div.querySelector('.nick-button');
        const input = div.querySelector('.nick-input');

        button.addEventListener('click', () => {
            const nickname = input.value.trim();
            if (nickname && this.network) {
                this.network.sendData({ type: 'set_nickname', nickname });
                console.log('Sent nickname:');
                div.style.display = 'none'; // Hide the nickname input after sending
            }
        });
    }

    setNetwork(network) {
        this.network = network;
    }
    
    remove() {
        this.shadowRoot.querySelector('.nick-container').remove();
    }
}

// Define the custom element
customElements.define('set-nick-el', SetNickEl);
