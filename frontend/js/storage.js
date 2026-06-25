// js/storage.js
// Salva e legge i dati dell'utente nel localStorage del browser

const Storage = {

    salvaToken(token) {
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
    },
    leggiToken() {
        return localStorage.getItem(CONFIG.TOKEN_KEY);
    },
    eliminaToken() {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
    },

    salvaUtente(utente) {
        localStorage.setItem(CONFIG.UTENTE_KEY, JSON.stringify(utente));
    },
    leggiUtente() {
        const dati = localStorage.getItem(CONFIG.UTENTE_KEY);
        return dati ? JSON.parse(dati) : null;
    },
    eliminaUtente() {
        localStorage.removeItem(CONFIG.UTENTE_KEY);
    },

    isLoggato() {
        return !!this.leggiToken();
    },

    logout() {
        this.eliminaToken();
        this.eliminaUtente();
        window.location.href = CONFIG.PAGINE.LOGIN;
    }
};
