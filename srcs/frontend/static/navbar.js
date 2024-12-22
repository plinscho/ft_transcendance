// Initialize Reactive state
const state = new Reactive({
    activePage: 'Play'
});

// Navbar template rendering
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

// Content rendering based on activePage
function renderContent(activePage) {
    switch (activePage) {
        case 'Play':
            return `<h1>Welcome to the Play Page</h1><p>Here you can start playing.</p>`;
        case 'Tournament':
            return `<h1>Tournament Page</h1><p>View ongoing tournaments and results.</p>`;
        case 'Chat':
            return `<h1>Chat Page</h1><p>Join the community chat here.</p>`;
        default:
            return `<h1>404</h1><p>Page not found.</p>`;
    }
}

// Initial Render
const navbarContainer = document.getElementById('navbar-container');
const contentContainer = document.getElementById('content-container');

navbarContainer.innerHTML = renderNavbar(state.contents);
contentContainer.innerHTML = renderContent(state.contents.activePage);

// Listen for state changes
state.listen('activePage', (newValue) => {
    navbarContainer.innerHTML = renderNavbar(state.contents);
    contentContainer.innerHTML = renderContent(newValue);
});

// Handle navbar link clicks
navbarContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.dataset.page) {
        e.preventDefault();
        state.contents.activePage = e.target.dataset.page;
    }
});
