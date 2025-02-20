export const View = {
    LOADING: 0,
    OK: 1,
    NEEDS_AUTH: 2,
    ERROR: 3,
    LANGUAGE_MENU: 4
};

export let state = {
    loading: true,
    authenticated: false,
    error: false,
    data: {
        language: 'en' // inglés por defecto
    },
};

export const AUTH = localStorage.getItem('authToken');