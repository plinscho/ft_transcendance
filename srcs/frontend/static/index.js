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
	return fetch(URL + '/api/user/verify/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${AUTH}`
		}
	})
		.then((resp) => {
			state.authenticated = resp.ok;
			if (resp.ok) return fetch(URL + '/api/user/data/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json', 
					'Authorization': `Bearer ${AUTH}`,
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

// Count messages
let messageCount = () => (state.data?.messages?.length || 0);

// DOM node references
let $viewLoading = document.getElementById('view-loading');
let $viewFailure = document.getElementById('view-failure');
let $viewNeedsLogin = document.getElementById('view-needs-login');
let $viewReady = document.getElementById('view-ready');
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

	updateView();
};

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
		loadData().then(updateInitialView);
	} else {
		state.error = true;
	}
});

// Initialize the app
if (!AUTH) {
	state.authenticated = false;
	state.loading = false;
	updateView();
} else {
	loadData().then(updateInitialView);
}
