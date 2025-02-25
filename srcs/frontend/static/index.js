import { updateUITexts } from './Languages.js';
import { loadData } from './api.js';
import { updateInitialView, updateView } from './views.js';
import { AUTH, state } from './state.js';
import { updateLanguage } from './api.js';

// Función para inicializar el selector de idiomas
const initLanguageSelector = () => {
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        // Establecer el valor inicial basado en el estado y localStorage
        const currentLang = state.data.language || localStorage.getItem('userLanguage') || 'en';
        languageSelector.value = currentLang;
        
        // Añadir el event listener
        languageSelector.addEventListener('change', async (e) => {
            try {
                await updateLanguage(e.target.value);
                await updateUITexts();
            } catch (error) {
                console.error('Error updating language:', error);
            }
        });
    }
};
document.addEventListener('DOMContentLoaded', async () => { 
    if (!AUTH) {
        state.authenticated = false;
        state.loading = false;
        console.log("No AUTH token");
        updateView();
        initLanguageSelector();
        await updateUITexts();
    } else {
        await loadData();
        updateInitialView();
        initLanguageSelector();
    }
});