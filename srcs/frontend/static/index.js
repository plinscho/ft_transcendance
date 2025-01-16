const View = {
    LOADING: 0,
    OK: 1,
    NEEDS_AUTH: 2,
    ERROR: 3,
  };

  const URL = 'http://localhost';
  
  // Application state
  let state = {
    loading: true,
    authenticated: false,
    error: false,
    data: null,
  };
  
  // Fetch and handle data
  let loadData = () => {
    return fetch(URL + '/verify')
      .then((resp) => {
        state.authenticated = resp.ok;
        if (resp.ok) return fetch('/data/');
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
  let $messageCount = document.getElementById('message-count');
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
  
  let updateMessageCount = () => {
    let n = messageCount();
    $messageCount.textContent = `${n || 'no'} message${n === 1 ? '' : 's'}`;
    $messageCount.classList.toggle('warning', n > 100);
  };
  
  let updateInitialView = () => {
    updateMessageCount();
    updateView();
  };
  
  // Initialize the app
  loadData().then(updateInitialView);
  