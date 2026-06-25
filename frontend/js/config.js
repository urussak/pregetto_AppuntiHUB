// js/config.js
// Configurazione globale — URL dinamico, funziona in locale e online

const CONFIG = {
    // Costruisce l'URL automaticamente in base a dove gira il sito.
    // In locale  → http://localhost/appuntihub/api
    // Su hosting → https://tuosito.altervista.org/appuntihub/api
    // Non serve modificare nulla al momento del deploy.
    API_BASE_URL: window.location.origin + '/appuntihub/api',

    TOKEN_KEY:  'appuntihub_token',
    UTENTE_KEY: 'appuntihub_utente',

    PAGINE: {
        LOGIN:         'login.html',
        REGISTRAZIONE: 'registrazione.html',
        HOME:          'home.html',
    }
};
