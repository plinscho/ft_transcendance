import { state } from './state.js';
import { updateInitialView, updateView } from './views.js';
import { loadData } from './api.js';
import { ip } from './host.js';
import { startGame } from './game.js';

const URL = 'https://' + ip.ip + ':8443';
const D = document

export const login = async (email, password) => {
    const resp = await fetch(URL + '/api/user/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    D.getElementById('loginEmail').value = '';
    D.getElementById('loginPassword').value = '';

    if (!resp.ok) {
        state.error = true;
        updateView();
        return;
    }

    const data = await resp.json();

    // Mostrar el formulario 2FA y ocultar el de login
    document.getElementById('2fa').classList.remove('invisible');
    document.getElementById('loginForm').classList.add('invisible');

    // Generar y enviar código de 2FA
    const generate2FAResp = await fetch(URL + '/api/user/generate-2fa/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.access}`,
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
                    'Authorization': `Bearer ${data.access}`,
                },
                body: JSON.stringify({ token }),
            });

            if (resp.ok) {
                localStorage.setItem('authToken', data.access);
                state.authenticated = true;
                document.getElementById('2faCode').value = '';
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
    if (!resp.ok) {
        state.error = true;
        D.getElementById('registerForm').classList.add('invisible');
        updateView();
        return;
    }

    if (resp.ok) {
        toggleRegister();
    }
};

// Función de logout (si está en algún archivo)
export const logout = () => {
    // Guardar el idioma antes de limpiar
    const currentLanguage = localStorage.getItem('userLanguage');

    // Limpiar autenticación
    localStorage.removeItem('authToken');
    // Otros limpiezas necesarias

    // Restaurar el idioma
    if (currentLanguage) {
        localStorage.setItem('userLanguage', currentLanguage);
    }

    // Actualizar estado
    state.authenticated = false;
    state.data = {
        language: currentLanguage || 'en'
    };

    document.getElementById('2fa').classList.add('invisible');
    document.getElementById('loginForm').classList.remove('invisible');
    if (state.gameRef) {
        state.gameRef.removeRenderer();
        state.gameRef = null;
    }

    // Recargar o redirigir
    updateView();
};

let $loginForm = D.getElementById('loginForm');
let $registerForm = D.getElementById('registerForm');
let $2fa = D.getElementById('2fa');
//listeners
let toggleRegister = () => {
    $loginForm.classList.toggle('invisible');
    $registerForm.classList.toggle('invisible');
    D.getElementById('registerEmail').value = '';
    D.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    D.getElementById('loginEmail').value = '';
    D.getElementById('loginPassword').value = '';
};

let $viewFailure = D.getElementById('view-failure');
let $viewNeedsLogin = D.getElementById('view-needs-login');

export const  backToLogin = () => {
    state.authenticated = false;
    state.error = false;
    document.getElementById('2fa').classList.add('invisible');
    document.getElementById('loginForm').classList.remove('invisible');
    D.getElementById('registerEmail').value = '';
    D.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    D.getElementById('loginEmail').value = '';
    D.getElementById('loginPassword').value = '';
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
    const passwordInput = document.getElementById('registerPassword');
    const password = passwordInput.value;

    if (checkPassword(password) === true) {
        register(username, email, password);
        //remove input message 
        D.getElementById('registerEmail').value = '';
        D.getElementById('registerUsername').value = '';
        document.getElementById('registerPassword').value = '';
    }
});

function checkPassword(password) {
    // Al menos 8 carácteres, una Mayus, una minus, un número y un símbolo.
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    const formDiv = D.getElementById("inputPwd");

    const previousError = D.getElementById("pwdError");
    if (previousError) previousError.remove();

    if (!regex.test(password)) {
        const errorDiv = D.createElement('div');
        errorDiv.id = "pwdError";
        errorDiv.style.color = "red";
        const errorMsg = D.createTextNode("La contraseña debe tener al menos 8 caracteres,\nuna mayúscula, una minúscula, un número y un símbolo.")
        errorDiv.append(errorMsg);
        formDiv.appendChild(errorDiv);
        return false;
    }
    return true;
}

