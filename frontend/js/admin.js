// js/admin.js
let utenteCorrente = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!Storage.isLoggato()) { Utils.vai(CONFIG.PAGINE.LOGIN); return; }
    document.getElementById('btn-logout')?.addEventListener('click', () => Storage.logout());
    utenteCorrente = Storage.leggiUtente();
    try {
        const me = await Api.getMe();
        if (me.ruolo !== 'admin') {
            document.querySelector('.main-admin').innerHTML = '<div class="admin-vuoto">🚫 Accesso riservato agli amministratori.<br><a href="home.html">Torna alla home</a></div>';
            return;
        }
    } catch (err) { Utils.vai(CONFIG.PAGINE.LOGIN); return; }
    await caricaStatistiche();
    await caricaRevisione();
});

function cambiaTab(nome) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('attiva', t.dataset.tab === nome));
    document.querySelectorAll('.admin-sezione').forEach(s => s.classList.remove('visibile'));
    document.getElementById(`sezione-${nome}`).classList.add('visibile');
    if (nome === 'revisione') caricaRevisione();
    if (nome === 'appunti')   caricaTuttiAppunti();
    if (nome === 'utenti')    caricaUtenti();
}

async function caricaStatistiche() {
    try {
        const s = await Api.adminStatistiche();
        document.getElementById('stat-utenti').textContent    = s.totale_utenti;
        document.getElementById('stat-bannati').textContent   = s.utenti_bannati;
        document.getElementById('stat-appunti').textContent   = s.totale_appunti;
        document.getElementById('stat-revisione').textContent = s.in_revisione;
        document.getElementById('stat-commenti').textContent  = s.totale_commenti;
    } catch (err) { Utils.mostraErrore('messaggio-admin', err.message); }
}

async function caricaRevisione() {
    const tbody = document.getElementById('tabella-revisione');
    tbody.innerHTML = '<tr><td colspan="5" class="admin-vuoto">Caricamento...</td></tr>';
    try {
        const r = await Api.adminGetAppunti('in_revisione');
        const appunti = r.appunti || [];
        if (!appunti.length) { tbody.innerHTML = '<tr><td colspan="5" class="admin-vuoto">✅ Nessun appunto in revisione.</td></tr>'; return; }
        tbody.innerHTML = appunti.map(a => `<tr>
            <td>${a.titolo}</td><td>${a.autore}</td><td>${a.materia}</td>
            <td><span class="badge-stato ${a.stato}">${a.stato.replace('_',' ')}</span></td>
            <td class="admin-azioni">
                <button class="admin-btn admin-btn-approva" onclick="moderaAppunto(${a.id},'approvato')">✅ Approva</button>
                <button class="admin-btn admin-btn-rifiuta" onclick="moderaAppunto(${a.id},'rifiutato')">❌ Rifiuta</button>
            </td></tr>`).join('');
    } catch (err) { tbody.innerHTML = `<tr><td colspan="5" class="admin-vuoto">${err.message}</td></tr>`; }
}

async function moderaAppunto(id, stato) {
    try {
        await Api.adminModeraAppunto(id, stato);
        Utils.mostraSuccesso('messaggio-admin', stato === 'approvato' ? 'Appunto approvato!' : 'Appunto rifiutato.');
        await caricaRevisione(); await caricaStatistiche();
    } catch (err) { Utils.mostraErrore('messaggio-admin', err.message); }
}

async function caricaTuttiAppunti() {
    const tbody = document.getElementById('tabella-appunti');
    tbody.innerHTML = '<tr><td colspan="5" class="admin-vuoto">Caricamento...</td></tr>';
    try {
        const r = await Api.adminGetAppunti();
        const appunti = r.appunti || [];
        if (!appunti.length) { tbody.innerHTML = '<tr><td colspan="5" class="admin-vuoto">Nessun appunto.</td></tr>'; return; }
        tbody.innerHTML = appunti.map(a => `<tr>
            <td>${a.titolo}</td><td>${a.autore}</td><td>${a.materia}</td>
            <td><span class="badge-stato ${a.stato}">${a.stato.replace('_',' ')}</span></td>
            <td class="admin-azioni">
                <button class="admin-btn admin-btn-elimina" onclick="eliminaAppunto(${a.id})">🗑️ Elimina</button>
            </td></tr>`).join('');
    } catch (err) { tbody.innerHTML = `<tr><td colspan="5" class="admin-vuoto">${err.message}</td></tr>`; }
}

async function eliminaAppunto(id) {
    if (!confirm('Eliminare definitivamente? Azione irreversibile.')) return;
    try {
        await Api.adminEliminaAppunto(id);
        Utils.mostraSuccesso('messaggio-admin', 'Appunto eliminato.');
        await caricaTuttiAppunti(); await caricaStatistiche();
    } catch (err) { Utils.mostraErrore('messaggio-admin', err.message); }
}

async function caricaUtenti() {
    const tbody = document.getElementById('tabella-utenti');
    tbody.innerHTML = '<tr><td colspan="6" class="admin-vuoto">Caricamento...</td></tr>';
    try {
        const r = await Api.adminGetUtenti();
        const utenti = r.utenti || [];
        tbody.innerHTML = utenti.map(u => {
            const isMe = u.id === utenteCorrente?.id;
            return `<tr>
                <td>${u.email}</td>
                <td><select class="admin-select-ruolo" onchange="cambiaRuolo(${u.id},this.value)" ${isMe?'disabled':''}>
                    <option value="studente"   ${u.ruolo==='studente'  ?'selected':''}>Studente</option>
                    <option value="professore" ${u.ruolo==='professore'?'selected':''}>Professore</option>
                    <option value="admin"      ${u.ruolo==='admin'     ?'selected':''}>Admin</option>
                </select></td>
                <td>${u.bannato?'<span class="badge-bannato">Bannato</span>':'✅ Attivo'}</td>
                <td>${u.num_appunti}</td><td>${u.num_commenti}</td>
                <td class="admin-azioni">${u.ruolo==='admin'?'':(u.bannato
                    ?`<button class="admin-btn admin-btn-sban" onclick="cambiaBan(${u.id},false)">✅ Sbanna</button>`
                    :`<button class="admin-btn admin-btn-ban" ${isMe?'disabled':''} onclick="cambiaBan(${u.id},true)">🚫 Banna</button>`)
                }</td></tr>`;
        }).join('');
    } catch (err) { tbody.innerHTML = `<tr><td colspan="6" class="admin-vuoto">${err.message}</td></tr>`; }
}

async function cambiaRuolo(id, ruolo) {
    try { await Api.adminPromuovi(id, ruolo); Utils.mostraSuccesso('messaggio-admin', `Ruolo aggiornato a "${ruolo}".`); await caricaUtenti(); }
    catch (err) { Utils.mostraErrore('messaggio-admin', err.message); await caricaUtenti(); }
}

async function cambiaBan(id, bannato) {
    if (bannato && !confirm('Bannare questo utente?')) return;
    try { await Api.adminBan(id, bannato); Utils.mostraSuccesso('messaggio-admin', bannato?'Utente bannato.':'Utente sbannato.'); await caricaUtenti(); await caricaStatistiche(); }
    catch (err) { Utils.mostraErrore('messaggio-admin', err.message); }
}
