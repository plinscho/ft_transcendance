import { state } from './state.js';
import { ip } from './host.js';

const URL = 'https://' + ip.ip + ':8443';

export const loadData = async () => {
	const { updateUITexts } = await import('./Languages.js');

	try {
		const verifyResp = await fetch(URL + '/api/user/verify/', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('authToken')}`
			}
		});

		state.authenticated = verifyResp.ok;

		if (!verifyResp.ok) {
			throw new Error('Authentication failed');
		}

		const dataResp = await fetch(URL + '/api/user/data/', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
			}
		});

		if (!dataResp.ok) {
			throw new Error('Data fetch failed');
		}

		const data = await dataResp.json();
		//console.log("Data received from backend:", data);

		if (data) {
			state.data = {
				...state.data,
				...data
			};
			await updateUITexts();
		}

		state.error = false;
		//console.log("State after update:", state);

	} catch (error) {
		console.error("Error:", error);
		state.error = true;
		state.data = null;
		localStorage.removeItem("authToken");
		//console.log("Removed previous authToken");
	} finally {
		state.loading = false;
	}
};

export const updateLanguage = async (language) => {
	try {
		const response = await fetch(URL + '/api/user/update-language/', {
			method: 'PATCH',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ language })
		});

		if (response.ok) {
			const data = await response.json();
			state.data.language = data.language;

			// Actualizar también localStorage
			localStorage.setItem('userLanguage', data.language);

			// Disparar un evento personalizado para notificar el cambio de idioma
			window.dispatchEvent(new Event('languageChanged'));

			return data;
		} else {
			//throw new Error('Failed to update language');
		}
		// } catch (error) {
		// 	console.error('Error:', error);
		// 	throw error;
		// }
	} catch (error) {
		//console.error("Error:", error);
		state.error = true;

		// Guardar el idioma actual antes de resetear
		const currentLanguage = state.data?.language || localStorage.getItem('userLanguage') || 'en';

		// Resetear datos pero mantener idioma
		state.data = {
			language: currentLanguage
		};

		// Eliminar token pero mantener idioma
		//localStorage.removeItem("authToken");

		// Asegurarse de que userLanguage está establecido
		localStorage.setItem('userLanguage', currentLanguage);

		//console.log("Removed previous authToken, kept language:", currentLanguage);
	} finally {
		state.loading = false;
	}
};