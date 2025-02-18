import { updateUITexts } from './Languages.js';
import { loadData } from './api.js';
import { updateInitialView, updateView } from './views.js';
import { AUTH, state } from './state.js';
import { updateLanguage } from './api.js';

// Función para inicializar el selector de idiomas
const initLanguageSelector = () => {
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        // Establecer el valor inicial basado en el estado
        languageSelector.value = state.data.language || 'en';
        
        // Añadir el event listener
        languageSelector.addEventListener('change', async (e) => {
            try {
                await updateLanguage(e.target.value);
                updateUITexts();
            } catch (error) {
                console.error('Error updating language:', error);
            }
        });
    }
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    if (!AUTH) {
        state.authenticated = false;
        state.loading = false;
        console.log("No AUTH token");
        updateView();
        initLanguageSelector();
        updateUITexts(); // Asegurarse de que los textos se actualizan inicialmente
    } else {
        loadData().then(() => {
            updateInitialView();
            initLanguageSelector();
        });
    }
});