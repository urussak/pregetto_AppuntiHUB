// js/appunto.js
// Logica pagina dettaglio appunto: dati, PDF viewer, stelle, commenti

let idAppunto = null;
let votoCorrente = 0;
let idAutoreAppunto = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!Storage.isLoggato()) { Utils.vai(CONFIG.PAGINE.LOGIN); return; }

    const params = new URLSearchParams(window.location.search);
    idAppunto = parseInt(params.get('id'));

    if (!idAppunto) {
        document.getElementById('appunto-card').innerHTML = `
            <div class="stato-vuoto"><div class="icona">❌</div><p>ID appunto non valido.</p></div>`;
        return;
    }

    // Avatar topbar
    const utente = Storage.leggiUtente();
    if (utente) {
        document.getElementById('avatar-topbar').src =
            `https://ui-avatars.com/api/?background=2563EB&color=fff&size=36&name=${utente.email[0].toUpperCase()}`;
    }

    document.getElementById('btn-logout')?.addEventListener('click', () => Storage.logout());

    await caricaAppunto();
    await caricaCommenti();
    inizializzaStelle();
});

// ── CARICA APPUNTO ───────────────────────────────────────────

async function caricaAppunto() {
    try {
        const a = await Api.getAppunto(idAppunto);
        idAutoreAppunto = a.id_autore;
        document.title = `${a.titolo} — AppuntiHUB`;

        const utenteLoggato = Storage.leggiUtente();
        const isAutore = utenteLoggato?.id == a.id_autore;

        // Link download PDF
        const urlDownload = `${CONFIG.API_BASE_URL}/appunti/download.php?id=${a.id}`;
        // URL diretto al file per il viewer
        const urlPdf = `${CONFIG.API_BASE_URL}/appunti/download.php?id=${a.id}`;

        document.getElementById('appunto-card').innerHTML = `
            <h1 class="appunto-titolo">${a.titolo}</h1>
            <div class="appunto-meta">
                <span class="appunto-autore">👤 ${a.autore || 'Utente'}</span>
                <span class="appunto-data">• ${Utils.formatData(a.data_upload)}</span>
                ${!isAutore ? `
                <a href="messaggi.html?id_utente=${a.id_autore}&email=${encodeURIComponent(a.autore)}"
                   class="btn-contatta">✉️ Contatta autore</a>
                ` : ''}
            </div>
            <div class="appunto-badges">
                <span class="badge badge-materia">📚 ${a.materia || '—'}</span>
                <span class="badge badge-indirizzo">🏫 ${a.indirizzo || '—'}</span>
                ${a.anno ? `<span class="badge badge-anno">🎓 ${a.anno}</span>` : ''}
                <span class="badge badge-anno">${a.scuola || '—'}</span>
            </div>
            <div class="appunto-stats">
                <div class="stat">⭐ ${a.voto_medio ? a.voto_medio + '/5' : 'Nessun voto'}
                    ${a.num_valutazioni ? `(${a.num_valutazioni} voti)` : ''}</div>
                <div class="stat">💬 ${a.num_commenti || 0} commenti</div>
            </div>
        `;

        // Mostra sezioni
        document.getElementById('sezione-pdf').style.display = 'block';
        document.getElementById('sezione-voto').style.display = 'block';
        document.getElementById('sezione-commenti').style.display = 'block';

        // Configura PDF viewer
        document.getElementById('pdf-iframe').src = urlPdf;
        document.getElementById('btn-download-pdf').href = urlDownload;

        // Stelle
        votoCorrente = parseFloat(a.voto_medio) || 0;
        aggiornaStelle(Math.round(votoCorrente));

    } catch (err) {
        document.getElementById('appunto-card').innerHTML = `
            <div class="stato-vuoto"><div class="icona">❌</div><p>${err.message}</p></div>`;
    }
}

// ── STELLE ───────────────────────────────────────────────────

function inizializzaStelle() {
    document.querySelectorAll('.stella-grande').forEach(stella => {
        const voto = parseInt(stella.dataset.voto);
        stella.addEventListener('mouseenter', () => aggiornaStelle(voto, true));
        stella.addEventListener('mouseleave', () => aggiornaStelle(Math.round(votoCorrente)));
        stella.addEventListener('click', () => votaAppunto(voto));
    });
}

function aggiornaStelle(voto, isHover = false) {
    const label = ['', 'Scarso', 'Insufficiente', 'Sufficiente', 'Buono', 'Ottimo'];
    document.querySelectorAll('.stella-grande').forEach(s => {
        const v = parseInt(s.dataset.voto);
        s.classList.toggle('piena', v <= voto && !isHover);
        s.classList.toggle('hover', v <= voto && isHover);
    });
    const testo = document.getElementById('testo-voto');
    if (testo) testo.textContent = voto > 0 ? label[voto] : 'Clicca per votare';
}

async function votaAppunto(voto) {
    try {
        const risposta = await Api.vota(idAppunto, voto);
        votoCorrente = parseFloat(risposta.voto_medio) || voto;
        aggiornaStelle(voto);
        document.getElementById('testo-voto').textContent =
            `Hai votato ${voto}/5 — Media: ${risposta.voto_medio}`;
    } catch (err) {
        alert(err.message);
    }
}

// ── COMMENTI ─────────────────────────────────────────────────

async function caricaCommenti() {
    try {
        const risposta = await Api.getCommenti(idAppunto);
        renderCommenti(risposta.commenti || []);
    } catch (err) {
        console.warn('Errore commenti:', err.message);
    }
}

function renderCommenti(commenti) {
    const lista = document.getElementById('lista-commenti');
    if (!commenti.length) {
        lista.innerHTML = `<div style="padding:var(--spazio-4) 0;color:var(--testo-chiaro);font-size:var(--testo-sm)">
            Nessun commento ancora. Sii il primo!</div>`;
        return;
    }
    lista.innerHTML = commenti.map(c => `
        <div class="commento-item">
            <div class="commento-header">
                <img class="commento-avatar"
                     src="https://ui-avatars.com/api/?background=6D28D9&color=fff&size=32&name=${encodeURIComponent(c.autore?.[0] || '?')}"
                     alt="Avatar">
                <span class="commento-autore">${c.autore}</span>
                <span class="commento-data">${Utils.formatData(c.data_commento)}</span>
            </div>
            <p class="commento-testo">${c.testo}</p>
        </div>
    `).join('');
}

async function inviaCommento() {
    const input   = document.getElementById('input-commento');
    const bottone = document.getElementById('btn-commento');
    const testo   = input.value.trim();
    if (!testo) { Utils.mostraErrore('messaggio-commento', 'Scrivi qualcosa prima di pubblicare.'); return; }
    Utils.bottoneCaricamento(bottone, 'Pubblicazione...');
    try {
        await Api.aggiungiCommento(idAppunto, testo);
        input.value = '';
        Utils.mostraSuccesso('messaggio-commento', 'Commento pubblicato!');
        await caricaCommenti();
    } catch (err) {
        Utils.mostraErrore('messaggio-commento', err.message);
    } finally {
        Utils.bottoneRipristina(bottone);
    }
}
