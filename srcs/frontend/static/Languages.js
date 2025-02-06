const languages = {
  en: {
    loading: "Loading...",
    error: {
      title: "Failed to load!",
      message: "An unexpected error occurred. Please try again later.",
      back: "BACK TO LOGIN"
    },
    login: {
      title: "Login",
      email: "Email address",
      password: "Password",
      submit: "Sign in",
      registerPrompt: "Not a member?",
      registerLink: "Register"
    },
    twoFactor: {
      title: "2FA",
      code: "2FA Code",
      verify: "Verify"
    },
    register: {
      title: "Register",
      username: "Username",
      email: "Email address",
      password: "Password",
      submit: "Register",
      loginPrompt: "Already have an account?",
      loginLink: "Login"
    },
    menu: {
      play: "Play",
      multiplayer: "Multiplayer",
      tournament: "Tournament",
      languages: "Languages",
      logout: "Logout"
    }
  },
  es: {
    loading: "Cargando...",
    error: {
      title: "¡Error al cargar!",
      message: "Ocurrio un error inesperado. Por favor, inténtelo de nuevo mas tarde.",
      back: "VOLVER AL INICIO"
    },
    login: {
      title: "Iniciar sesion",
      email: "Correo electronico",
      password: "Contraseña",
      submit: "Iniciar sesion",
      registerPrompt: "¿No eres miembro?",
      registerLink: "Registrarse"
    },
    twoFactor: {
      title: "2FA",
      code: "Código 2FA",
      verify: "Verificar"
    },
    register: {
      title: "Registrarse",
      username: "Nombre de usuario",
      email: "Correo electrónico",
      password: "Contraseña",
      submit: "Registrarse",
      loginPrompt: "¿Ya tienes una cuenta?",
      loginLink: "Iniciar sesion"
    },
    menu: {
      play: "Jugar",
      multiplayer: "Multijugador",
      tournament: "Torneo",
      languages: "Idiomas",
      logout: "Cerrar sesion"
    }
  },
  it: {
    loading: "Caricamento...",
    error: {
      title: "Caricamento fallito!",
      message: "Si è verificato un errore imprevisto. Per favore riprova più tardi.",
      back: "TORNA AL LOGIN"
    },
    login: {
      title: "Accedi",
      email: "Indirizzo email",
      password: "Password",
      submit: "Accedi",
      registerPrompt: "Non sei un membro?",
      registerLink: "Registrati"
    },
    twoFactor: {
      title: "2FA",
      code: "Codice 2FA",
      verify: "Verifica"
    },
    register: {
      title: "Registrati",
      username: "Nome utente",
      email: "Indirizzo email",
      password: "Password",
      submit: "Registrati",
      loginPrompt: "Hai già un account?",
      loginLink: "Accedi"
    },
    menu: {
      play: "Giocare",
      multiplayer: "Multigiocatore",
      tournament: "Torneo",
      languages: "Lingue",
      logout: "Disconnettersi"
    }
  },
  fr: {
    loading: "Chargement...",
    error: {
      title: "Échec du chargement!",
      message: "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.",
      back: "RETOUR À LA CONNEXION"
    },
    login: {
      title: "Connexion",
      email: "Adresse e-mail",
      password: "Mot de passe",
      submit: "Se connecter",
      registerPrompt: "Pas encore membre?",
      registerLink: "S'inscrire"
    },
    twoFactor: {
      title: "2FA",
      code: "Code 2FA",
      verify: "Vérifier"
    },
    register: {
      title: "S'inscrire",
      username: "Nom d'utilisateur",
      email: "Adresse e-mail",
      password: "Mot de passe",
      submit: "S'inscrire",
      loginPrompt: "Vous avez déjà un compte?",
      loginLink: "Se connecter"
    },
    menu: {
      play: "Jouer",
      multiplayer: "Multijoueur",
      tournament: "Tournoi",
      languages: "Langues",
      logout: "Se déconnecter"
    }
  }
};

import { state } from "./state.js";

// Selecciona el diccionario de idiomas adecuado
const lang = languages[state.data.language];

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded and parsed");

  // Loading view
  document.getElementById('view-loading').textContent = lang.loading;

  // Error view
  document.getElementById('errorTitle').textContent = lang.error.title;
  document.getElementById('errorMessage').textContent = lang.error.message;
  document.getElementById('errorLogin').textContent = lang.error.back;

  // Login form
  document.getElementById('loginTitle').textContent = lang.login.title;
  document.getElementById('loginEmailLabel').textContent = lang.login.email;
  document.getElementById('loginPasswordLabel').textContent = lang.login.password;
  document.getElementById('loginButton').textContent = lang.login.submit;
  document.getElementById('registerPrompt').textContent = lang.login.registerPrompt;
  document.getElementById('registerLink').textContent = lang.login.registerLink;

  // 2FA form
  document.getElementById('twoFactorTitle').textContent = lang.twoFactor.title;
  document.getElementById('twoFactorCodeLabel').textContent = lang.twoFactor.code;
  document.getElementById('twoFactorVerifyButton').textContent = lang.twoFactor.verify;

  // Register form
  document.getElementById('registerTitle').textContent = lang.register.title;
  document.getElementById('registerUsernameLabel').textContent = lang.register.username;
  document.getElementById('registerEmailLabel').textContent = lang.register.email;
  document.getElementById('registerPasswordLabel').textContent = lang.register.password;
  document.getElementById('registerButton').textContent = lang.register.submit;
  document.getElementById('loginPrompt').textContent = lang.register.loginPrompt;
  document.getElementById('loginLink').textContent = lang.register.loginLink;
});

export { lang };
