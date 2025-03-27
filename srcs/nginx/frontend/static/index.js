import { updateUITexts } from './Languages.js';
import { loadData } from './api.js';
import { updateInitialView, updateView } from './views.js';
import { AUTH, state } from './state.js';
import { updateLanguage } from './api.js';

var globalVar = false;

// Función para inicializar el selector de idiomas
const initLanguageSelector = () => {
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        // Priorizar localStorage, luego estado
        const currentLang = localStorage.getItem('userLanguage') || state.data.language || 'en';
        languageSelector.value = currentLang;
        
        // Añadir el event listener
        languageSelector.addEventListener('change', async (e) => {
            try {
                const newLang = e.target.value;
                // Guardar en localStorage inmediatamente
                localStorage.setItem('userLanguage', newLang);
                
                // Si el usuario está autenticado, también actualizar en el servidor
                if (state.authenticated) {
                    await updateLanguage(newLang);
                } else {
                    // Solo actualizar el estado si no está autenticado
                    state.data.language = newLang;
                }
                
                await updateUITexts();
            } catch (error) {
                //console.error('Error updating language:', error);
            }
        });
    }
};



document.addEventListener('DOMContentLoaded', async () => { 
    if (!AUTH || !globalVar) {
        state.authenticated = false;
        state.loading = false;
        globalVar = true;
        // Asegurarse de que el idioma de localStorage se cargue correctamente
        const storedLang = localStorage.getItem('userLanguage');
        if (storedLang) {
            state.data.language = storedLang;
        }
        //console.log("No AUTH token, using language:", state.data.language);
        updateView();
        initLanguageSelector();
        await updateUITexts();
    } else {
        await loadData();
        updateInitialView();
        initLanguageSelector();
    }
});