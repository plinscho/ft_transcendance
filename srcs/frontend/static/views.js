import { state, View } from './state.js';
import { startGame } from './game.js';
import { updateUITexts } from './Languages.js';


const D = document;

// Determine the current view
let currentView = () => {
	if (state.loading) return View.LOADING;
	if (state.error) return View.ERROR;
	if (!state.authenticated) return View.NEEDS_AUTH;
	return View.OK;
};

// DOM node references
let $viewLoading = D.getElementById('view-loading');
let $viewFailure = D.getElementById('view-failure');
let $viewNeedsLogin = D.getElementById('view-needs-login');
let $viewReady = D.getElementById('view-ready');

let $currentView = $viewLoading;

let $$viewNodes = [
	$viewLoading,
	$viewReady,
	$viewNeedsLogin,
	$viewFailure,
];

// DOM updates
export const updateView = () => {
    //console.log("Updating view with state:", state);
    let $nextView = $$viewNodes[currentView()];
    if ($nextView === $currentView) return;
    $currentView.classList.add('invisible');
    $nextView.classList.remove('invisible');
    $currentView = $nextView;
    updateUITexts();
};


export const  updateInitialView = () => {
    //console.log(state);
	updateView();
    startGame();
};