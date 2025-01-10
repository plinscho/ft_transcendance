import state from './state/state.js';
import { renderNavbar } from './components/navbar.js'
import { renderContent } from './components/RenderContent.js';


// Initialization
const navbarContainer = document.getElementById('navbar-container');
const contentContainer = document.getElementById('content-container');

navbarContainer.innerHTML = renderNavbar(state.contents);
contentContainer.innerHTML = renderContent(state.contents.activePage);

// Reactivity
state.listen('activePage', () => {
    contentContainer.innerHTML = renderContent(state.contents.activePage);
});

state.listen('isLogged', () => {
    contentContainer.innerHTML = renderContent(state.contents.activePage);
});

state.listen('showRegister', () => {
    contentContainer.innerHTML = renderContent(state.contents.activePage);
});

// Navbar click handling
navbarContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.dataset.page) {
        e.preventDefault();
        state.contents.activePage = e.target.dataset.page;
    }
});
