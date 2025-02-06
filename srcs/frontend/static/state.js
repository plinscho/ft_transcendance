export const View = {
    LOADING: 0,
    OK: 1,
    NEEDS_AUTH: 2,
    ERROR: 3,
  };
  
  export let state = {
    loading: true,
    authenticated: false,
    error: false,
    data: {
      language: 'es' // Cambiar idioma | Hardcodeo temporal ('en', 'es', 'it', 'fr')
    },
  };
  
  export const AUTH = localStorage.getItem('authToken');
  