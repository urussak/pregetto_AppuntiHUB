// js/messaggi.js
// Logica pagina messaggi: lista conversazioni, chat, invio

let idInterlocutoreAttivo = null;
let emailInterlocutoreAttivo = '';
let intervalloAggiornamento = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!Storage.isLoggato()) { Utils.vai(CONFIG.PAGINE.LOGIN); return; }

    document.getElementById('btn-logout')?.addEventListener('click', () => Storage.logout());

    // Avatar topbar
    const utente = Storage.leggiUtente();
    if (utente) {
        document.getElementById('avatar-topbar').src =
            `https://ui-avatars.com/api/?background=2563EB&color=fff&size=36&name=${utente.email[0].toUpperCase()}`;
    }

    // Enter per inviare (Shift+Enter per andare a capo)
    document.getElementById('testo-messaggio')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            inviaMessaggio();
        }
    });

    // Ricerca conversazioni
    document.getElementById('ricerca-conv')?.addEventListener('input', filtraConversazioni);

    await caricaInbox();

    // Controlla se c'è un utente da aprire direttamente (da ?id_utente=2)
    const params = new URLSearchParams(window.location.search);
    const idUtente = params.get('id_utente');
    const emailUtente = params.get('email');
    if (idUtente && emailUtente) {
        apriConversazione(parseInt(idUtente), emailUtente);
    }
});

// ── INBOX ────────────────────────────────────────────────────

let tutteConversazioni = [];

async function caricaInbox() {
    try {
        const risposta = await Api.getInbox();
        tutteConversazioni = risposta.conversazioni || [];
        renderInbox(tutteConversazioni);
    } catch (err) {
        console.warn('Errore inbox:', err.message);
    }
}

function renderInbox(conversazioni) {
    const container = document.getElementById('conv-items');

    if (!conversazioni.length) {
        container.innerHTML = `
            <div style="padding: var(--spazio-6); text-align: center; color: var(--testo-chiaro); font-size: var(--testo-sm);">
                Nessuna conversazione ancora.
            </div>`;
        return;
    }

    container.innerHTML = conversazioni.map(c => `
        <div class="conv-item ${c.id_interlocutore == idInterlocutoreAttivo ? 'attiva' : ''}"
             onclick="apriConversazione(${c.id_interlocutore}, '${c.interlocutore_email}')">
            <img class="conv-avatar"
                 src="https://ui-avatars.com/api/?background=6D28D9&color=fff&size=44&name=${encodeURIComponent(c.interlocutore_email[0])}"
                 alt="Avatar">
            <div class="conv-info">
                <div class="conv-email">${c.interlocutore_email}</div>
                <div class="conv-ultimo">${c.ultimo_messaggio || '—'}</div>
            </div>
        </div>
    `).join('');
}

function filtraConversazioni(e) {
    const termine = e.target.value.toLowerCase();
    const filtrate = tutteConversazioni.filter(c =>
        c.interlocutore_email.toLowerCase().includes(termine)
    );
    renderInbox(filtrate);
}

// ── APRI CONVERSAZIONE ───────────────────────────────────────

async function apriConversazione(idUtente, email) {
    idInterlocutoreAttivo = idUtente;
    emailInterlocutoreAttivo = email;

    // Aggiorna UI
    document.getElementById('chat-placeholder').style.display = 'none';
    document.getElementById('chat-header').classList.add('visibile');
    document.getElementById('chat-input').classList.add('visibile');
    document.getElementById('chat-header-email').textContent = email;
    document.getElementById('chat-header-avatar').src =
        `https://ui-avatars.com/api/?background=6D28D9&color=fff&size=36&name=${encodeURIComponent(email[0])}`;

    // Evidenzia conversazione attiva nella lista
    renderInbox(tutteConversazioni);

    // Carica i messaggi
    await caricaMessaggi();

    // Aggiorna ogni 5 secondi
    if (intervalloAggiornamento) clearInterval(intervalloAggiornamento);
    intervalloAggiornamento = setInterval(caricaMessaggi, 5000);

    // Focus sul campo testo
    document.getElementById('testo-messaggio')?.focus();
}

// ── MESSAGGI ─────────────────────────────────────────────────

async function caricaMessaggi() {
    if (!idInterlocutoreAttivo) return;

    try {
        const utente = Storage.leggiUtente();
        const risposta = await Api.getConversazione(idInterlocutoreAttivo);
        const messaggi = risposta.messaggi || [];

        const container = document.getElementById('chat-messaggi');
        const eraInFondo = container.scrollHeight - container.scrollTop === container.clientHeight;

        if (!messaggi.length) {
            container.innerHTML = `
                <div style="text-align:center; color: var(--testo-chiaro); font-size: var(--testo-sm); padding: var(--spazio-8)">
                    Inizia la conversazione!
                </div>`;
            return;
        }

        container.innerHTML = messaggi.map(m => {
            const isMio = m.mittente_id == utente?.id;
            return `
                <div class="bubble-wrapper ${isMio ? 'mio' : 'altro'}">
                    <div class="bubble ${isMio ? 'mio' : 'altro'}">${m.testo}</div>
                    <div class="bubble-data">${Utils.formatData(m.data_invio)}</div>
                </div>
            `;
        }).join('');

        // Scrolla in fondo se era già in fondo
        if (eraInFondo || messaggi.length === 1) {
            container.scrollTop = container.scrollHeight;
        }

    } catch (err) {
        console.warn('Errore messaggi:', err.message);
    }
}

// ── INVIA MESSAGGIO ──────────────────────────────────────────

async function inviaMessaggio() {
    const input = document.getElementById('testo-messaggio');
    const testo = input.value.trim();

    if (!testo || !idInterlocutoreAttivo) return;

    input.value = '';

    try {
        await Api.inviamessaggio(idInterlocutoreAttivo, testo);
        await caricaMessaggi();
        await caricaInbox(); // aggiorna ultimo messaggio nella lista
    } catch (err) {
        alert('Errore: ' + err.message);
        input.value = testo; // rimette il testo se c'è errore
    }
}
