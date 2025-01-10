import state from '../state/state.js';
import { login, register, handleLogin, handleRegister, toggleForm } from './AuthForms.js';
import main from './MainPage.js';
import join from './TournamentPage.js';

function renderContent(activePage) {
    if (!state.contents.isLogged) {
        return state.contents.showRegister ? register() : login();
    }

    switch (activePage) {
        case 'Play': return main();
        case 'Tournament': return join();
        case 'Chat': return `<h1>Chat Page</h1><p>Join the chat.</p>`;
        default: return `<h1>404</h1><p>Page not found.</p>`;
    }
}

export { renderContent };
