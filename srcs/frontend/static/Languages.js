import { state } from './state.js';
import { languages } from './LanguageData.js';

// Objeto que mantendremos actualizado con los textos del idioma actual
let currentLanguageTexts = {};

// Función para obtener el idioma actual
// Función para obtener el idioma actual
export function getCurrentLanguage() {
    // Priorizar el idioma del estado sobre localStorage
    const stateLang = state.data?.language;
    const storedLang = localStorage.getItem('userLanguage');
    
    // Usar el idioma del estado, el almacenado o inglés por defecto
    const selectedLang = stateLang || storedLang || 'en';
    
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
        // const currentLanguage = getCurrentLanguage();
        // console.log("Updating UI texts to language:", currentLanguage);
        
        // Añade este código al principio de updateUITexts() para debug
        const currentLanguage = getCurrentLanguage();
        console.log("Current language from localStorage:", localStorage.getItem('userLanguage'));
        console.log("Current language from state:", state.data?.language);
        console.log("Selected language:", currentLanguage);
        
        // Actualizar los textos del idioma actual
        updateLanguageTexts(currentLanguage);
        
        // Login form
        const elements = {
            loginTitle: document.getElementById('loginTitle'),
            loginEmailLabel: document.getElementById('loginEmailLabel'),
            loginPasswordLabel: document.getElementById('loginPasswordLabel'),
            loginButton: document.getElementById('loginButton'),
            registerPrompt: document.getElementById('registerPrompt'),
            registerLink: document.getElementById('registerLink'),

            // Register form
            registerTitle: document.getElementById('registerTitle'),
            registerUsernameLabel: document.getElementById('registerUsernameLabel'),
            registerEmailLabel: document.getElementById('registerEmailLabel'),
            registerPasswordLabel: document.getElementById('registerPasswordLabel'),
            registerButton: document.getElementById('registerButton'),
            loginPrompt: document.getElementById('loginPrompt'),
            loginLink: document.getElementById('loginLink'),

            // 2FA form
            twoFactorTitle: document.getElementById('twoFactorTitle'),
            twoFactorCodeLabel: document.getElementById('twoFactorCodeLabel'),
            twoFactorVerifyButton: document.getElementById('twoFactorVerifyButton'),

            // Error view
            errorTitle: document.getElementById('errorTitle'),
            errorMessage: document.getElementById('errorMessage'),
            errorLogin: document.getElementById('errorLogin')
        };

        // Actualizar textos solo si el elemento existe
        if (elements.loginTitle) elements.loginTitle.textContent = lang.login.title;
        if (elements.loginEmailLabel) elements.loginEmailLabel.textContent = lang.login.email;
        if (elements.loginPasswordLabel) elements.loginPasswordLabel.textContent = lang.login.password;
        if (elements.loginButton) elements.loginButton.textContent = lang.login.submit;
        if (elements.registerPrompt) elements.registerPrompt.textContent = lang.login.registerPrompt;
        if (elements.registerLink) elements.registerLink.textContent = lang.login.registerLink;

        if (elements.registerTitle) elements.registerTitle.textContent = lang.register.title;
        if (elements.registerUsernameLabel) elements.registerUsernameLabel.textContent = lang.register.username;
        if (elements.registerEmailLabel) elements.registerEmailLabel.textContent = lang.register.email;
        if (elements.registerPasswordLabel) elements.registerPasswordLabel.textContent = lang.register.password;
        if (elements.registerButton) elements.registerButton.textContent = lang.register.submit;
        if (elements.loginPrompt) elements.loginPrompt.textContent = lang.register.loginPrompt;
        if (elements.loginLink) elements.loginLink.textContent = lang.register.loginLink;

        if (elements.twoFactorTitle) elements.twoFactorTitle.textContent = lang.twoFactor.title;
        if (elements.twoFactorCodeLabel) elements.twoFactorCodeLabel.textContent = lang.twoFactor.code;
        if (elements.twoFactorVerifyButton) elements.twoFactorVerifyButton.textContent = lang.twoFactor.verify;

        if (elements.errorTitle) elements.errorTitle.textContent = lang.error.title;
        if (elements.errorMessage) elements.errorMessage.textContent = lang.error.message;
        if (elements.errorLogin) elements.errorLogin.textContent = lang.error.back;

        // Devolver una promesa resuelta para confirmar que todo ha terminado
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