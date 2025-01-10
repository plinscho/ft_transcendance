import state from '../state/state.js';
import { registerUser } from '../api/Api.js';

// Login Form
const login = () => `
    <form>
        <h2>Login</h2>
        <div class="form-outline mb-4">
            <input type="email" id="loginEmail" class="form-control" />
            <label class="form-label" for="loginEmail">Email address</label>
        </div>
        <div class="form-outline mb-4">
            <input type="password" id="loginPassword" class="form-control" />
            <label class="form-label" for="loginPassword">Password</label>
        </div>
        <button type="button" id="loginButton" class="btn btn-primary btn-block mb-4">Sign in</button>
        <p>Not a member? <a href="#" id="registerLink">Register</a></p>
    </form>`;

// Register Form
const register = () => `
    <form>
        <h2>Register</h2>
        <div class="form-outline mb-4">
            <input type="text" id="registerUsername" class="form-control" />
            <label class="form-label" for="registerUsername">Username</label>
        </div>
        <div class="form-outline mb-4">
            <input type="email" id="registerEmail" class="form-control" />
            <label class="form-label" for="registerEmail">Email address</label>
        </div>
        <div class="form-outline mb-4">
            <input type="password" id="registerPassword" class="form-control" />
            <label class="form-label" for="registerPassword">Password</label>
        </div>
        <button type="button" id="registerButton" class="btn btn-primary btn-block mb-4">Register</button>
        <p>Already have an account? <a href="#" id="loginLink">Login</a></p>
    </form>`;

function renderForm() {
    const contentContainer = document.getElementById('content-container');
    contentContainer.innerHTML = state.contents.showRegister ? register() : login();

    // Add event listeners
    if (state.contents.showRegister) {
        document.getElementById('registerButton').addEventListener('click', handleRegister);
        document.getElementById('loginLink').addEventListener('click', (e) => {
            e.preventDefault();
            toggleForm();
        });
    } else {
        document.getElementById('loginButton').addEventListener('click', handleLogin);
        document.getElementById('registerLink').addEventListener('click', (e) => {
            e.preventDefault();
            toggleForm();
        });
    }
}

// Authentication Logic
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (email && password) {
        state.contents.isLogged = true;
        state.contents.activePage = 'Play';
    } else {
        alert('Enter valid credentials');
    }
}

async function handleRegister() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const username = document.getElementById('registerUsername').value;

    const userData = { email, password, username };

    try {
        const response = await registerUser(userData);
        state.contents.isLogged = true;
        state.contents.activePage = 'Play';
        
    } catch (error) {
        alert(`Registration failed: ${error.message}`);
    }
}

function toggleForm() {
    state.contents.showRegister = !state.contents.showRegister;
    renderForm(); // Re-render the form
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    renderForm(); // Render the appropriate form on page load
});

export { login, register, handleLogin, handleRegister, toggleForm };
