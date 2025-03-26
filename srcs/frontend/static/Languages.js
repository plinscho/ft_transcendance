import { state } from './state.js';
import { languages } from './LanguageData.js';

// Objeto que mantendremos actualizado con los textos del idioma actual
let currentLanguageTexts = {};

// Función para obtener el idioma actual
// Función para obtener el idioma actual
export function getCurrentLanguage() {
    const storedLang = localStorage.getItem('userLanguage');
    const stateLang = state.data?.language;
    
    // Si hay un idioma en localStorage, usarlo primero
    // Esto es especialmente importante cuando no hay sesión activa
    const selectedLang = storedLang || stateLang || 'en';
    
    // Si el idioma seleccionado no existe, usar inglés
    return languages[selectedLang] ? selectedLang : 'en';
}

// Función para establecer el idioma
export function setLanguage(langCode) {
    if (!languages[langCode]) {
        console.error(`Language ${langCode} not found, falling back to English`);
        langCode = 'en';
    }
    
    // Actualizar localStorage y estado
    localStorage.setItem('userLanguage', langCode);
    if (state.data) {
        state.data.language = langCode;
    }
    
    // Actualizar los textos
    updateLanguageTexts(langCode);
    
    // Disparar evento de cambio de idioma
    const event = new CustomEvent('languageChanged', {
        detail: { language: langCode }
    });
    window.dispatchEvent(event);
}

// Función para actualizar los textos del idioma actual
function updateLanguageTexts(langCode) {
    const targetLanguage = languages[langCode] || languages.en;
    
    // Combinar con inglés para casos donde falten traducciones
    currentLanguageTexts = {
        ...languages.en,  // Base en inglés
        ...targetLanguage // Sobrescribir con el idioma seleccionado
    };
}

// Inicializar con el idioma actual
updateLanguageTexts(getCurrentLanguage());

// Función para actualizar los textos de la UI - AHORA ASÍNCRONA
export const updateUITexts = async () => {
    try {
        const currentLanguage = getCurrentLanguage();
        //console.log("Current language from localStorage:", localStorage.getItem('userLanguage'));
        //console.log("Current language from state:", state.data?.language);
        //console.log("Selected language:", currentLanguage);
        //console.log("Updating UI texts to language:", currentLanguage);        
        // Actualizar los textos del idioma actual
        updateLanguageTexts(currentLanguage);
        
        // Mapeo de IDs a claves de idioma
        const elementMappings = {
            // Login form
            'loginTitle': 'login.title',
            'loginEmailLabel': 'login.email',
            'loginPasswordLabel': 'login.password',
            'loginButton': 'login.submit',
            'registerPrompt': 'login.registerPrompt',
            'registerLink': 'login.registerLink',
            
            // Register form
            'registerTitle': 'register.title',
            'registerUsernameLabel': 'register.username',
            'registerEmailLabel': 'register.email',
            'registerPasswordLabel': 'register.password',
            'registerButton': 'register.submit',
            'loginPrompt': 'register.loginPrompt',
            'loginLink': 'register.loginLink',
            
            // 2FA form
            'twoFactorTitle': 'twoFactor.title',
            'twoFactorCodeLabel': 'twoFactor.code',
            'twoFactorVerifyButton': 'twoFactor.verify',
            
            // Error view
            'errorTitle': 'error.title',
            'errorMessage': 'error.message',
            'errorLogin': 'error.back'
        };
        
        // Actualizar cada elemento si existe
        Object.entries(elementMappings).forEach(([elementId, langKey]) => {
            const element = document.getElementById(elementId);
            if (element) {
                // Dividir la clave por puntos para acceder a objetos anidados
                const parts = langKey.split('.');
                const translation = parts.reduce((obj, key) => obj?.[key], lang) || langKey;
                element.textContent = translation;
            }
        });
        
        return Promise.resolve(true);
    } catch (error) {
        console.error('Error updating UI texts:', error);
        return Promise.reject(error);
    }
};

// Exportar un proxy que siempre accede a los textos actualizados
export const lang = new Proxy(currentLanguageTexts, {
    get: function(target, prop) {
        // Si la propiedad es un objeto, devolver otro proxy para acceso anidado
        if (typeof currentLanguageTexts[prop] === 'object' && currentLanguageTexts[prop] !== null) {
            return new Proxy(currentLanguageTexts[prop], {
                get: function(obj, key) {
                    return obj[key] || `${prop}.${key}`;
                }
            });
        }
        return currentLanguageTexts[prop] || prop;
    }
});

// Escuchar cambios de idioma para actualizar los textos
window.addEventListener('languageChanged', () => {
    updateLanguageTexts(getCurrentLanguage());
});
