import { state } from './state.js';
import { updateInitialView, updateView } from './views.js';
import { loadData } from './api.js';

const URL = 'https://localhost:8443';
const D = document

export const login = async (email, password) => {
    const resp = await fetch(URL + '/api/user/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!resp.ok) {
        state.error = true;
        updateView();
        return;
    }

    const data = await resp.json();
    localStorage.setItem('authToken', data.access);
    console.log("Authentication token: " + localStorage.getItem('authToken'));

    // Mostrar el formulario 2FA y ocultar el de login
    document.getElementById('2fa').classList.remove('invisible');
    document.getElementById('loginForm').classList.add('invisible');

    // Generar y enviar código de 2FA
    const generate2FAResp = await fetch(URL + '/api/user/generate-2fa/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
    });

    if (!generate2FAResp.ok) {
        state.error = true;
        updateView();
    }

    // Agregar event listener a 2FA solo si no se ha agregado antes
    const $2fa = document.getElementById('2fa');
    if (!$2fa.dataset.listenerAttached) {
        $2fa.addEventListener('submit', async (e) => {
            e.preventDefault();

            const token = document.getElementById('2faCode').value;
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
                updateView();
            }
        });
        $2fa.dataset.listenerAttached = true;
    }
};

export const register = async (username, email, password) => {
    const resp = await fetch(URL + '/api/user/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
};

export const logout = () => {
    localStorage.removeItem('authToken');
    location.reload();
};

let $loginForm = D.getElementById('loginForm');
let $registerForm = D.getElementById('registerForm');
let $2fa = D.getElementById('2fa');
//listeners
let toggleRegister = () => {
    $loginForm.classList.toggle('invisible');
    $registerForm.classList.toggle('invisible');
};

let $viewFailure = D.getElementById('view-failure');
let $viewNeedsLogin = D.getElementById('view-needs-login');

let backToLogin = () => {
    state.authenticated = false;
    state.error = false;
    updateView();
}

D.getElementById('registerLink').addEventListener('click', toggleRegister);
D.getElementById('loginLink').addEventListener('click', toggleRegister);
D.getElementById('errorLogin').addEventListener('click', backToLogin);

D.getElementById('loginButton').addEventListener('click', async () => {
    const email = D.getElementById('loginEmail').value;
    const password = D.getElementById('loginPassword').value;
    await login(email, password);
});

D.getElementById('registerButton').addEventListener('click', async () => {
    const username = D.getElementById('registerUsername').value;
    const email = D.getElementById('registerEmail').value;
    const password = D.getElementById('registerPassword').value;
    await register(username, email, password);
});