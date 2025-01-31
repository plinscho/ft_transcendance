//imports 
import * as THREE from 'three';

const View = {
	LOADING: 0,
	OK: 1,
	NEEDS_AUTH: 2,
	ERROR: 3,
};
const D = document;
const URL = 'https://localhost:8443';

// Application state
let state = {
	loading: true,
	authenticated: false,
	error: false,
	data: null,
};
const AUTH = localStorage.getItem('authToken');

// Fetch and handle data
let loadData = () => {
	//console.log("Authentication token: " + AUTH)
	return fetch(URL + '/api/user/verify/', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('authToken')}`
		}
	})
		.then((resp) => {
			state.authenticated = resp.ok;
			if (resp.ok) return fetch(URL + '/api/user/data/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
				}
			});
			throw new Error('Authentication failed');
		})
		.then((resp) => {
			if (resp && resp.ok) return resp.json();
			throw new Error('Data fetch failed');
		})
		.then((data) => {
			state.data = data || null;
			state.error = false;
		})
		.catch(() => {
			state.error = true;
			state.data = null;
		})
		.finally(() => {
			state.loading = false;
		});
};

// Determine the current view
let currentView = () => {
	if (state.loading) return View.LOADING;
	if (state.error) return View.ERROR;
	if (!state.authenticated) return View.NEEDS_AUTH;
	return View.OK;
};

// DOM node references
let $viewLoading = D.getElementById('view-loading');
let $viewFailure = D.getElementById('view-failure');
let $viewNeedsLogin = D.getElementById('view-needs-login');
let $viewReady = D.getElementById('view-ready');
let $loginForm = D.getElementById('loginForm');
let $registerForm = D.getElementById('registerForm');
let $2fa = D.getElementById('2fa');
let $currentView = $viewLoading;

let $$viewNodes = [
	$viewLoading,
	$viewReady,
	$viewNeedsLogin,
	$viewFailure,
];

// DOM updates
let updateView = () => {
	let $nextView = $$viewNodes[currentView()];
	if ($nextView === $currentView) return;
	$currentView.classList.add('invisible');
	$nextView.classList.remove('invisible');
	$currentView = $nextView;
};

let updateInitialView = () => {
	startGame();
	updateView();
};

// AUTHENTICATION
let toggleRegister = () => {
	$loginForm.classList.toggle('invisible');
	$registerForm.classList.toggle('invisible');
}
D.getElementById('registerLink').addEventListener('click', toggleRegister);
D.getElementById('loginLink').addEventListener('click', toggleRegister);
D.getElementById('loginButton').addEventListener('click', async () => {
    const email = D.getElementById('loginEmail').value;
    const password = D.getElementById('loginPassword').value;

    const resp = await fetch(URL + '/api/user/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (resp.ok) {
        const data = await resp.json();
        localStorage.setItem('authToken', data.access);
        console.log("Authentication token: " + localStorage.getItem('authToken'));
        // Show 2FA form and hide login form
        $2fa.classList.remove('invisible');
        $loginForm.classList.add('invisible');

        // Generate and send 2FA code
        const generate2FAResp = await fetch(URL + '/api/user/generate-2fa/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (!generate2FAResp.ok) {
            state.error = true;
            updateView(); // Show error view if 2FA code generation fails
        }

        // Avoid adding multiple event listeners
        if (!$2fa.dataset.listenerAttached) {
            $2fa.addEventListener('submit', async (e) => {
                e.preventDefault(); // Prevent form from reloading the page

                const token = D.getElementById('2faCode').value;
                const resp = await fetch(URL + '/api/user/2fa/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    },
                    body: JSON.stringify({ token }),
                });

                if (resp.ok) {
                    state.authenticated = true;
                    return loadData().then(updateInitialView);
                } else {
                    localStorage.removeItem('authToken');
                    state.error = true;
                    updateView(); // Show error view if 2FA fails
                }
            });
            $2fa.dataset.listenerAttached = true; // Mark listener as attached
        }
    } else {
        state.error = true;
        updateView(); // Show error view if login fails
    }
});


D.getElementById('registerButton').addEventListener('click', async () => {
	const username = D.getElementById('registerUsername').value;
	const email = D.getElementById('registerEmail').value;
	const password = D.getElementById('registerPassword').value;

	const resp = await fetch(URL + '/api/user/signup/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username, email, password }),
	});

	if (resp.ok) {
		const data = await resp.json();
		localStorage.setItem('authToken', data.token);
		state.authenticated = true;
		return loadData().then(updateInitialView);
	} else {
		state.error = true;
		updateView();
	}
});

class Game {
	constructor() {
		// Configurar escena, cámara y renderizador
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);

		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		// Estados del juego
		this.states = {
			MENU: 'menu',
			PLAY: 'play',
			MULTIPLAYER: 'multiplayer',
			TOURNAMENTS: 'tournament',
		};
		this.currentState = this.states.MENU;

		// Escenas para cada estado
		this.scenes = {
			menu: this.createMenuScene(),
			play: this.createPlayScene(),
			multiplayer: this.createSettingsScene(),
		};

		const loader = new THREE.TextureLoader();
		loader.load('/static/img/bg.webp', (texture) => {
			this.scenes.menu.background = texture;
		});
		this.camera.position.z = 5;


		// Agregar detección de clics
		this.setupEventListeners();

		// Iniciar el bucle del juego
		this.gameLoop();
	}

	// Crear escena del menú
	createMenuScene() {
		const scene = new THREE.Scene();

		// Botón 1: Jugar
		const playButton = this.createButton('Play', 0, 1);
		scene.add(playButton);

		// Botón 2: Multijugador
		const settingsButton = this.createButton('Multiplayer', 0, -1);
		scene.add(settingsButton);

		//Boton 3: LOUGOUT
		const logoutButton = this.createButton('Logout', 0, -3);
		scene.add(logoutButton);
		

		// Asociar botones a acciones
		playButton.userData.onClick = () => this.changeState(this.states.PLAY);
		settingsButton.userData.onClick = () => this.changeState(this.states.MULTIPLAYER);
		logoutButton.userData.onClick = () => { localStorage.removeItem('authToken'); location.reload(); };

		return scene;
	}

	// Crear escena de juego
	createPlayScene() {
		const scene = new THREE.Scene();

		// Agregar cubo
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		const cube = new THREE.Mesh(geometry, material);
		scene.add(cube);

		// Agregar botón para volver al menú principal
		const menuButton = this.createButton('Menu', -3.5, 2, 0.5, 0.25);
		menuButton.userData.onClick = () => this.changeState(this.states.MENU);
		scene.add(menuButton);

		return scene;
	}

	// Crear escena de configuración
	createSettingsScene() {
		const scene = new THREE.Scene();

		// Texto "Configuración"
		const textGeometry = new THREE.PlaneGeometry(4, 1);
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = 512;
		canvas.height = 128;
		ctx.fillStyle = 'white';
		ctx.font = '40px Arial';
		ctx.fillText('Multiplayer', 150, 80);

		const texture = new THREE.CanvasTexture(canvas);
		const textMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
		const settingsText = new THREE.Mesh(textGeometry, textMaterial);
		scene.add(settingsText);

		// Agregar botón para volver al menú principal
		const menuButton = this.createButton('Menu', -3.5, 2, 0.5, 0.25);
		menuButton.userData.onClick = () => this.changeState(this.states.MENU);
		scene.add(menuButton);

		return scene;
	}

	// Crear un botón en forma de plano
	createButton(label, x, y, width = 2, height = 1) {
		const buttonGeometry = new THREE.PlaneGeometry(width, height);
		const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x007bff });

		const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
		button.position.set(x, y, 0);

		// Agregar texto al botón
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = 256;
		canvas.height = 128;
		ctx.fillStyle = '#007bff';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'white';
		ctx.font = '30px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(label, canvas.width / 2, canvas.height / 2);

		const texture = new THREE.CanvasTexture(canvas);
		button.material.map = texture;
		button.material.needsUpdate = true;

		return button;
	}

	// Configurar detección de clics
	setupEventListeners() {
		document.addEventListener('click', (event) => {
			const mouse = new THREE.Vector2(
				(event.clientX / window.innerWidth) * 2 - 1,
				-(event.clientY / window.innerHeight) * 2 + 1
			);

			const raycaster = new THREE.Raycaster();
			raycaster.setFromCamera(mouse, this.camera);

			const intersects = raycaster.intersectObjects(this.scenes[this.currentState].children);
			if (intersects.length > 0) {
				const clickedObject = intersects[0].object;
				if (clickedObject.userData.onClick) {
					clickedObject.userData.onClick();
				}
			}
		});
	}

	// Cambiar el estado del juego
	changeState(newState) {
		this.currentState = newState;
	}

	animateCube() {
		this.scenes[this.states.PLAY].children[0].rotation.x += 0.01;
		this.scenes[this.states.PLAY].children[0].rotation.y += 0.01;
	}

	// Bucle del juego
	gameLoop() {
		// Renderizar la escena actual
		this.renderer.render(this.scenes[this.currentState], this.camera);
		if (this.states.PLAY === this.currentState) {
			this.animateCube();
		}
		// Solicitar el próximo frame
		requestAnimationFrame(() => this.gameLoop());
	}
}

let startGame = () => {
	let G = new Game();
}

// Initialize the app
if (!AUTH) {
	state.authenticated = false;
	state.loading = false;
	updateView();
} else {
	loadData().then(updateInitialView);
}
