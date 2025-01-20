//imports 
import * as THREE from 'three';

const View = {
	LOADING: 0,
	OK: 1,
	NEEDS_AUTH: 2,
	ERROR: 3,
};
const D = document;
const URL = 'https://localhost';

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
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);

		this.camera.position.z = 5;

		// Crear un cubo para la escena
		this.geometry = new THREE.BoxGeometry(1, 1, 1);
		this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		this.cube = new THREE.Mesh(this.geometry, this.material);
		this.scene.add(this.cube);

		// Crear un botón
		this.button = this.createButton();

		// Iniciar el bucle del juego
		this.gameLoop();
	}

	// Crear un botón como un plano 2D
	createButton() {
		// Crear geometría y material
		const buttonGeometry = new THREE.PlaneGeometry(1.5, 0.75); // Tamaño del botón
		const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x424242 }); // Color del botón

		// Crear malla
		const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);

		// Posicionar el botón en el centro inferior
		buttonMesh.position.set(0, -2, 0); // Ajustar según la cámara
		this.scene.add(buttonMesh);

		return buttonMesh;
	}

	// Dibujar texto en el botón (opcional, usando un material de textura)
	addButtonText(text) {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		// Tamaño del canvas y texto
		canvas.width = 256;
		canvas.height = 128;
		ctx.fillStyle = '#424242'; // Fondo del botón
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#ffffff'; // Color del texto
		ctx.font = '30px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, canvas.width / 2, canvas.height / 2);

		// Crear textura a partir del canvas
		const texture = new THREE.CanvasTexture(canvas);
		this.button.material.map = texture;
		this.button.material.needsUpdate = true;
	}

	animate() {
		this.cube.rotation.x += 0.01;
		this.cube.rotation.y += 0.01;
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	// Bucle del juego para actualizar y renderizar
	gameLoop() {
		// Renderizar la escena
		this.renderer.render(this.scene, this.camera);

		// Animar
		this.animate();

		// Solicitar el próximo frame
		requestAnimationFrame(() => this.gameLoop());
	}
}



let startGame = () => {
	let G = new Game();
	G.addButtonText('Click me!');
	document.addEventListener('click', (event) => {
		const mouse = new THREE.Vector2(
			(event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1
		);

		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, G.camera);
	
		const intersects = raycaster.intersectObject(G.button);
		if (intersects.length > 0) {
			console.log('Button clicked!');
		}
	});
}

// Initialize the app
if (!AUTH) {
	state.authenticated = false;
	state.loading = false;
	updateView();
} else {
	loadData().then(updateInitialView);
}
