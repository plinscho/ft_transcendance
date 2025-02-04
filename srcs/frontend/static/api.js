import { state } from './state.js';

const URL = 'https://localhost:8443';

					// Antes async
export const loadData = () => {
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
			localStorage.removeItem("authToken");
			location.reload(); // F5
			console.log("Removed previous authToken");
		})
		.finally(() => {
			state.loading = false;
		});
};