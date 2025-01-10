import state from '../state/state.js'; // Import state

function renderNavbar(state) {
    return `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">42 Transcendence</a>
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link ${state.activePage === 'Play' ? 'active' : ''}" href="#" data-page="Play">Play</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${state.activePage === 'Tournament' ? 'active' : ''}" href="#" data-page="Tournament">Tournament</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${state.activePage === 'Chat' ? 'active' : ''}" href="#" data-page="Chat">Chat</a>
                    </li>
                </ul>
            </div>
        </nav>
    `;
}

export { renderNavbar };