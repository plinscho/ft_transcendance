import { state } from './state.js';
import { languages } from './languagedata.js';

// Función para actualizar los textos de la UI
export const updateUITexts = () => {
    try {
        const currentLanguage = state.data.language || 'en';
        const texts = languages[currentLanguage];

        if (!texts) {
            console.error(`Language ${currentLanguage} not found`);
            return;
        }

        // Update lang export
        Object.assign(lang, texts);

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
        if (elements.loginTitle) elements.loginTitle.textContent = texts.login.title;
        if (elements.loginEmailLabel) elements.loginEmailLabel.textContent = texts.login.email;
        if (elements.loginPasswordLabel) elements.loginPasswordLabel.textContent = texts.login.password;
        if (elements.loginButton) elements.loginButton.textContent = texts.login.submit;
        if (elements.registerPrompt) elements.registerPrompt.textContent = texts.login.registerPrompt;
        if (elements.registerLink) elements.registerLink.textContent = texts.login.registerLink;

        if (elements.registerTitle) elements.registerTitle.textContent = texts.register.title;
        if (elements.registerUsernameLabel) elements.registerUsernameLabel.textContent = texts.register.username;
        if (elements.registerEmailLabel) elements.registerEmailLabel.textContent = texts.register.email;
        if (elements.registerPasswordLabel) elements.registerPasswordLabel.textContent = texts.register.password;
        if (elements.registerButton) elements.registerButton.textContent = texts.register.submit;
        if (elements.loginPrompt) elements.loginPrompt.textContent = texts.register.loginPrompt;
        if (elements.loginLink) elements.loginLink.textContent = texts.register.loginLink;

        if (elements.twoFactorTitle) elements.twoFactorTitle.textContent = texts.twoFactor.title;
        if (elements.twoFactorCodeLabel) elements.twoFactorCodeLabel.textContent = texts.twoFactor.code;
        if (elements.twoFactorVerifyButton) elements.twoFactorVerifyButton.textContent = texts.twoFactor.verify;

        if (elements.errorTitle) elements.errorTitle.textContent = texts.error.title;
        if (elements.errorMessage) elements.errorMessage.textContent = texts.error.message;
        if (elements.errorLogin) elements.errorLogin.textContent = texts.error.back;

    } catch (error) {
        console.error('Error updating UI texts:', error);
    }
};

// Exportar el diccionario de idiomas
export const lang = languages[state.data.language || 'en'];