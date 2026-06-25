// js/profilo.js
// Logica pagina profilo: dati utente, cambio avatar, lista appunti

document.addEventListener('DOMContentLoaded', async () => {
    if (!Storage.isLoggato()) { Utils.vai(CONFIG.PAGINE.LOGIN); return; }

    document.getElementById('btn-logout')?.addEventListener('click', () => Storage.logout());

    // Avatar cliccabile → apre il selettore file
    document.getElementById('avatar-wrapper')?.addEventListener('click', () => {
        document.getElementById('input-avatar').click();
    });

    // Quando si sceglie un file → carica subito
    document.getElementById('input-avatar')?.addEventListener('change', gestisciCambioAvatar);

    await caricaProfilo();
    await caricaMieiAppunti();
});

// ── CARICA PROFILO ───────────────────────────────────────────

async function caricaProfilo() {
    try {
        const utente = await Api.getMe();

        // Avatar
        const avatarSrc = utente.avatar_url ||
            `https://ui-avatars.com/api/?background=2563EB&color=fff&size=120&name=${utente.email[0].toUpperCase()}`;
        document.getElementById('avatar-grande').src = avatarSrc;
        document.getElementById('avatar-topbar').src =
            utente.avatar_url ||
            `https://ui-avatars.com/api/?background=2563EB&color=fff&size=36&name=${utente.email[0].toUpperCase()}`;

        // Info
        document.getElementById('profilo-email').textContent = utente.email;
        document.getElementById('profilo-ruolo').textContent =
            utente.ruolo === 'professore' ? '👨‍🏫 Professore' : '🎒 Studente';
        document.getElementById('profilo-data').textContent =
            'Iscritto il ' + Utils.formatData(utente.created_at);

    } catch (err) {
        console.warn('Errore caricamento profilo:', err.message);
    }
}

// ── CAMBIO AVATAR ────────────────────────────────────────────

async function gestisciCambioAvatar(evento) {
    const file = evento.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        Utils.mostraErrore('messaggio-avatar', 'Seleziona un\'immagine.');
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        Utils.mostraErrore('messaggio-avatar', 'Immagine troppo grande. Max 2MB.');
        return;
    }

    // Preview immediata
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('avatar-grande').src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Upload
    try {
        const formData = new FormData();
        formData.append('avatar', file);
        const risposta = await Api.uploadAvatar(formData);
        document.getElementById('avatar-grande').src = risposta.avatar_url;
        Utils.mostraSuccesso('messaggio-avatar', '✅ Foto profilo aggiornata!');
    } catch (err) {
        Utils.mostraErrore('messaggio-avatar', 'Errore: ' + err.message);
    }
}

// ── MIEI APPUNTI ─────────────────────────────────────────────

async function caricaMieiAppunti() {
    try {
        const utente = Storage.leggiUtente();
        const risposta = await Api.getAppunti();
        const miei = (risposta.appunti || []).filter(a => a.autore === utente?.email);

        // Aggiorna stats
        document.getElementById('stat-appunti').textContent = miei.length;

        const votoMedio = miei.filter(a => a.voto_medio).reduce((acc, a, _, arr) => {
            return acc + parseFloat(a.voto_medio) / arr.length;
        }, 0);
        document.getElementById('stat-voto').textContent =
            miei.some(a => a.voto_medio) ? votoMedio.toFixed(1) + '★' : '—';

        // Conta commenti totali
        const totCommenti = miei.reduce((acc, a) => acc + (parseInt(a.num_commenti) || 0), 0);
        document.getElementById('stat-commenti').textContent = totCommenti;

        // Lista appunti
        const lista = document.getElementById('miei-appunti');
        if (!miei.length) {
            lista.innerHTML = `
                <div class="stato-vuoto" style="padding: var(--spazio-6) 0">
                    <p style="color: var(--testo-chiaro)">Non hai ancora caricato appunti.</p>
                </div>`;
            return;
        }

        lista.innerHTML = miei.map(a => `
            <div class="appunto-profilo" onclick="Utils.vai('appunto.html?id=${a.id}')">
                <div class="appunto-profilo-info">
                    <div class="appunto-profilo-titolo">${a.titolo}</div>
                    <div class="appunto-profilo-meta">
                        ${a.materia} • ${Utils.formatData(a.data_upload)}
                        • ⭐ ${a.voto_medio || '—'} • 💬 ${a.num_commenti || 0}
                    </div>
                </div>
                <span class="appunto-profilo-freccia">›</span>
            </div>
        `).join('');

    } catch (err) {
        console.warn('Errore appunti:', err.message);
    }
}
