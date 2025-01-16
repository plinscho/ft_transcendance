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
		state.authenticated = true;
		return loadData().then(updateInitialView);
	} else {
		state.error = true;
		updateView();
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
		this.canvas = document.getElementById('gameCanvas');
		this.ctx = this.canvas.getContext('2d');

		// Initial position of the square
		this.squareX = 50;
		this.squareY = 50;
		this.squareSize = 50;

		// Movement speed
		this.speed = 4;

		// Initialize keyboard tracking
		this.keys = {};
		this.initKeyboard();

		// Start the game loop
		this.gameLoop();
	}

	// Method to initialize keyboard event listeners
	initKeyboard() {
		window.addEventListener("keydown", (e) => {
			this.keys[e.keyCode] = true;
		});
		window.addEventListener("keyup", (e) => {
			this.keys[e.keyCode] = false;
		});
	}

	// Method to check if a key is pressed
	isKeyPressed(keyCode) {
		return this.keys[keyCode] || false;
	}

	// Update square position based on key presses
	moveSquare() {
		if (this.isKeyPressed(37)) {
			// Left arrow
			this.squareX -= this.speed;
		}
		if (this.isKeyPressed(38)) {
			// Up arrow
			this.squareY -= this.speed;
		}
		if (this.isKeyPressed(39)) {
			// Right arrow
			this.squareX += this.speed;
		}
		if (this.isKeyPressed(40)) {
			// Down arrow
			this.squareY += this.speed;
		}
	}

	// Draw the square on the canvas
	drawSquare() {
		this.ctx.fillStyle = "red";
		this.ctx.fillRect(this.squareX, this.squareY, this.squareSize, this.squareSize);
	}

	// Clear the canvas
	clearCanvas() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	// Game loop to update and render the game
	gameLoop() {
		this.clearCanvas();
		this.moveSquare();
		this.drawSquare();

		// Request the next animation frame
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
