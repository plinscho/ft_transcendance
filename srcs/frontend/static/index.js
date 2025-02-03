import { loadData } from './api.js';
import { updateInitialView, updateView } from './views.js';
import { AUTH, state } from './state.js';

if (!AUTH) {
    state.authenticated = false;
    state.loading = false;
	console.log("No AUTH token");
    updateView();
} else {
    loadData().then(updateInitialView);
}
