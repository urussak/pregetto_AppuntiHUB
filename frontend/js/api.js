// js/api.js
// Tutte le chiamate al backend PHP
// Ogni funzione corrisponde a un file PHP nella cartella api/

const Api = {

    // ── FUNZIONE BASE ────────────────────────────────────────
    // Tutte le altre la usano internamente

    async _chiedi(metodo, endpoint, corpo = null, conFile = false) {
        const headers = {};

        const token = Storage.leggiToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        if (!conFile) headers['Content-Type'] = 'application/json';

        const opzioni = { method: metodo, headers };

        if (corpo) {
            opzioni.body = conFile ? corpo : JSON.stringify(corpo);
        }

        const risposta = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, opzioni);
        const dati     = await risposta.json();

        if (!risposta.ok) {
            throw new Error(dati.errore || 'Errore dal server');
        }

        return dati;
    },

    // ── AUTENTICAZIONE ───────────────────────────────────────

    registrazione: (email, password, ruolo) =>
        Api._chiedi('POST', '/auth/registrazione.php', { email, password, ruolo }),

    login: (email, password) =>
        Api._chiedi('POST', '/auth/login.php', { email, password }),

    verificaOTP: (id_utente, codice) =>
        Api._chiedi('POST', '/auth/verifica-otp.php', { id_utente, codice }),

    forgotPassword: (email) =>
        Api._chiedi('POST', '/auth/forgot-password.php', { email }),

    resetPassword: (token, nuova_password) =>
        Api._chiedi('POST', '/auth/reset-password.php', { token, nuova_password }),

    // ── UTENTI ───────────────────────────────────────────────

    getMe: () =>
        Api._chiedi('GET', '/utenti/me.php'),

    uploadAvatar: (formData) =>
        Api._chiedi('POST', '/utenti/avatar.php', formData, true),

    // ── CATALOGO ─────────────────────────────────────────────

    getScuole: () =>
        Api._chiedi('GET', '/catalogo/scuole.php'),

    getIndirizzi: (id_scuola) =>
        Api._chiedi('GET', `/catalogo/indirizzi.php?id_scuola=${id_scuola}`),

    getMaterie: (id_indirizzo) =>
        Api._chiedi('GET', `/catalogo/materie.php?id_indirizzo=${id_indirizzo}`),

    // ── APPUNTI ──────────────────────────────────────────────

    getAppunti: (filtri = {}) => {
        const params = new URLSearchParams(filtri).toString();
        return Api._chiedi('GET', `/appunti/lista.php${params ? '?' + params : ''}`);
    },

    getAppunto: (id) =>
        Api._chiedi('GET', `/appunti/dettaglio.php?id=${id}`),

    caricaAppunto: (formData) =>
        Api._chiedi('POST', '/appunti/carica.php', formData, true),

    // ── VALUTAZIONI ──────────────────────────────────────────

    getValutazioni: (id_appunto) =>
        Api._chiedi('GET', `/valutazioni/get.php?id_appunto=${id_appunto}`),

    vota: (id_appunto, voto) =>
        Api._chiedi('POST', '/valutazioni/vota.php', { id_appunto, voto }),

    // ── COMMENTI ─────────────────────────────────────────────

    getCommenti: (id_appunto) =>
        Api._chiedi('GET', `/commenti/get.php?id_appunto=${id_appunto}`),

    aggiungiCommento: (id_appunto, testo) =>
        Api._chiedi('POST', '/commenti/aggiungi.php', { id_appunto, testo }),

    // ── MESSAGGI ─────────────────────────────────────────────

    getInbox: () =>
        Api._chiedi('GET', '/messaggi/inbox.php'),

    getConversazione: (id_utente) =>
        Api._chiedi('GET', `/messaggi/conversazione.php?id_utente=${id_utente}`),

    inviamessaggio: (destinatario_id, testo) =>
        Api._chiedi('POST', '/messaggi/invia.php', { destinatario_id, testo }),

    // ── ADMIN ──────────────────────────────────────────────────
    adminGetUtenti:       ()              => Api._chiedi('GET',  '/admin/utenti.php'),
    adminPromuovi:        (id_utente, ruolo)   => Api._chiedi('POST', '/admin/promuovi.php',        { id_utente, ruolo }),
    adminBan:             (id_utente, bannato) => Api._chiedi('POST', '/admin/ban.php',             { id_utente, bannato }),
    adminGetAppunti:      (stato = '')    => Api._chiedi('GET',  `/admin/appunti.php${stato ? '?stato='+stato : ''}`),
    adminModeraAppunto:   (id_appunto, stato)  => Api._chiedi('POST', '/admin/modera-appunto.php',  { id_appunto, stato }),
    adminEliminaAppunto:  (id_appunto)   => Api._chiedi('POST', '/admin/elimina-appunto.php',  { id_appunto }),
    adminEliminaCommento: (id_commento)  => Api._chiedi('POST', '/admin/elimina-commento.php', { id_commento }),
    adminStatistiche:     ()              => Api._chiedi('GET',  '/admin/statistiche.php'),
};
