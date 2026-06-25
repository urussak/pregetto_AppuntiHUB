// js/home.js
// Logica homepage: sidebar, feed, upload, ricerca, votazione

let tuttiAppunti = [];

const INDIRIZZI = [
    { nome: 'Informatica',       icona: '💻' },
    { nome: 'Meccanica',         icona: '⚙️'  },
    { nome: 'Elettrotecnica',    icona: '⚡'  },
    { nome: 'Liceo Scientifico', icona: '🔬' },
];
const ANNI = ['1° Anno', '2° Anno', '3° Anno', '4° Anno', '5° Anno'];

document.addEventListener('DOMContentLoaded', async () => {
    if (!Storage.isLoggato()) { Utils.vai(CONFIG.PAGINE.LOGIN); return; }

    caricaUtenteTopbar();
    costruisciSidebar();
    await caricaFeed();

    document.getElementById('hamburger')?.addEventListener('click', toggleSidebar);
    document.getElementById('overlay-sidebar')?.addEventListener('click', chiudiSidebar);
    document.getElementById('btn-logout')?.addEventListener('click', () => Storage.logout());
    document.getElementById('btn-carica')?.addEventListener('click', apriModal);
    document.getElementById('modal-chiudi')?.addEventListener('click', chiudiModal);
    document.getElementById('form-upload')?.addEventListener('submit', gestisciUpload);
    document.getElementById('input-ricerca')?.addEventListener('input', gestisciRicerca);
    document.getElementById('select-scuola')?.addEventListener('change', cambiaScuola);
    document.getElementById('select-indirizzo')?.addEventListener('change', cambiaIndirizzo);

    inizializzaDropZone();
    caricaScuole();
});

// ── TOPBAR ───────────────────────────────────────────────────

async function caricaUtenteTopbar() {
    try {
        const utente = Storage.leggiUtente();
        if (utente) {
            const iniziali = utente.email[0].toUpperCase();
            document.getElementById('avatar-topbar').src =
                `https://ui-avatars.com/api/?background=2563EB&color=fff&size=36&name=${iniziali}`;
        }
        const dati = await Api.getMe();
        if (dati.avatar_url) {
            document.getElementById('avatar-topbar').src = dati.avatar_url;
        }
        if (dati.ruolo === 'admin') {
            const linkAdmin = document.getElementById('link-admin');
            if (linkAdmin) linkAdmin.style.display = 'inline-flex';
        }
    } catch (err) {
        console.warn('Impossibile caricare avatar:', err.message);
    }
}

// ── SIDEBAR ──────────────────────────────────────────────────

function costruisciSidebar() {
    const lista = document.getElementById('sidebar-lista');
    if (!lista) return;
    lista.innerHTML = INDIRIZZI.map(ind => `
        <div class="indirizzo-item">
            <div class="indirizzo-header" onclick="toggleIndirizzo(this)">
                <span class="indirizzo-nome">${ind.icona} ${ind.nome}</span>
                <span class="indirizzo-freccia">▶</span>
            </div>
            <div class="anni-lista">
                ${ANNI.map(anno => `
                    <div class="anno-item">
                        <div class="anno-header"
                             onclick="filtraPerAnno(event, '${ind.nome}', '${anno}')">
                            <span>${anno}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function filtraPerAnno(event, indirizzo, anno) {
    event.stopPropagation();
    chiudiSidebar();
    // Rimuove tutti i chip attivi e deseleziona
    document.querySelectorAll('.filtro-chip').forEach(c => c.classList.remove('attivo'));
    const filtrati = tuttiAppunti.filter(a =>
        a.indirizzo?.toLowerCase().includes(indirizzo.toLowerCase()) &&
        a.anno === anno
    );
    renderFeed(filtrati);
    // Mostra quanti risultati
    const feed = document.getElementById('feed');
    const titolo = document.createElement('div');
    titolo.style.cssText = 'padding:0 0 var(--spazio-3);color:var(--testo-chiaro);font-size:var(--testo-sm)';
    titolo.textContent = `📂 ${indirizzo} — ${anno} (${filtrati.length} appunti)`;
    feed.prepend(titolo);
}

function toggleIndirizzo(header) { header.parentElement.classList.toggle('aperto'); }

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('aperta');
    document.getElementById('hamburger').classList.toggle('aperto');
    document.getElementById('overlay-sidebar').classList.toggle('visibile');
}
function chiudiSidebar() {
    document.getElementById('sidebar').classList.remove('aperta');
    document.getElementById('hamburger').classList.remove('aperto');
    document.getElementById('overlay-sidebar').classList.remove('visibile');
}

// ── FEED ─────────────────────────────────────────────────────

async function caricaFeed() {
    const feed = document.getElementById('feed');
    feed.innerHTML = '<div class="stato-vuoto"><div class="icona">⏳</div><p>Caricamento...</p></div>';
    try {
        const risposta = await Api.getAppunti();
        tuttiAppunti = risposta.appunti || [];
        renderFeed(tuttiAppunti);
    } catch (err) {
        feed.innerHTML = `<div class="stato-vuoto"><div class="icona">❌</div><p>${err.message}</p></div>`;
    }
}

function renderFeed(appunti) {
    const feed = document.getElementById('feed');
    if (!appunti.length) {
        feed.innerHTML = '<div class="stato-vuoto"><div class="icona">📭</div><p>Nessun appunto trovato.</p></div>';
        return;
    }
    feed.innerHTML = appunti.map((a, i) => `
        <div class="post-card" style="animation-delay:${i * 0.05}s" onclick="apriAppunto(${a.id})">
            <div class="post-header">
                <img class="post-avatar"
                     src="https://ui-avatars.com/api/?background=6D28D9&color=fff&size=40&name=${encodeURIComponent(a.autore?.[0] || '?')}"
                     alt="Avatar">
                <div class="post-meta">
                    <div class="post-autore">${a.autore || 'Utente'}</div>
                    <div class="post-data">${Utils.formatData(a.data_upload)}</div>
                </div>
            </div>
            <div class="post-titolo">${a.titolo}</div>
            <div class="post-anteprima">Appunti di ${a.materia} — clicca per aprire</div>
            <div class="post-badges">
                <span class="badge badge-materia">📚 ${a.materia || '—'}</span>
                <span class="badge badge-indirizzo">🏫 ${a.indirizzo || '—'}</span>
               <span class="badge badge-anno"> ${a.anno || 'Anno non specificato'}</span>
                <span class="badge badge-anno">${a.scuola || '—'}</span>
            </div>
            <div class="post-footer" onclick="event.stopPropagation()">
                <div class="stelle" data-id="${a.id}">
                    ${[1,2,3,4,5].map(n =>
                        `<span class="stella ${a.voto_medio >= n ? 'piena' : ''}"
                               onclick="vota(${a.id}, ${n})">★</span>`
                    ).join('')}
                    <span style="font-size:var(--testo-xs);color:var(--testo-chiaro);margin-left:4px">
                        ${a.voto_medio ? `(${a.voto_medio})` : ''}
                    </span>
                </div>
                <div class="post-azione">💬 ${a.num_commenti || 0}</div>
                <div class="post-azione" onclick="scaricaAppunto(${a.id}, event)">⬇️ Scarica</div>
            </div>
        </div>
    `).join('');
}

function gestisciRicerca(e) {
    const termine = e.target.value.toLowerCase().trim();
    const filtrati = tuttiAppunti.filter(a =>
        a.titolo.toLowerCase().includes(termine) ||
        a.materia?.toLowerCase().includes(termine) ||
        a.autore?.toLowerCase().includes(termine)
    );
    renderFeed(filtrati);
}

function filtraFeed(chip, indirizzo) {
    document.querySelectorAll('.filtro-chip').forEach(c => c.classList.remove('attivo'));
    chip.classList.add('attivo');
    renderFeed(!indirizzo ? tuttiAppunti : tuttiAppunti.filter(a =>
        a.indirizzo?.toLowerCase().includes(indirizzo.toLowerCase())
    ));
}

async function vota(id_appunto, voto) {
    if (!Storage.isLoggato()) { alert('Devi essere loggato per votare!'); return; }
    try {
        const risposta = await Api.vota(id_appunto, voto);
        document.querySelectorAll(`.stelle[data-id="${id_appunto}"] .stella`).forEach((s, i) => {
            s.classList.toggle('piena', risposta.voto_medio >= i + 1);
        });
    } catch (err) { alert(err.message); }
}

function apriAppunto(id) { Utils.vai(`appunto.html?id=${id}`); }

function scaricaAppunto(id, e) {
    e.stopPropagation();
    window.open(`${CONFIG.API_BASE_URL}/appunti/download.php?id=${id}`, '_blank');
}

// ── MODAL UPLOAD ─────────────────────────────────────────────

function apriModal()  { document.getElementById('modal-overlay').classList.add('visibile'); }
function chiudiModal() {
    document.getElementById('modal-overlay').classList.remove('visibile');
    document.getElementById('form-upload').reset();
    document.getElementById('drop-testo').textContent = 'Trascina qui il PDF o clicca per scegliere';
}

async function caricaScuole() {
    try {
        const scuole = await Api.getScuole();
        const select = document.getElementById('select-scuola');
        scuole.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.nome;
            select.appendChild(opt);
        });
    } catch (err) { console.warn(err.message); }
}

async function cambiaScuola() {
    const id = document.getElementById('select-scuola').value;
    const selInd = document.getElementById('select-indirizzo');
    const selMat = document.getElementById('select-materia');
    selInd.innerHTML = '<option value="">— Seleziona indirizzo —</option>';
    selMat.innerHTML = '<option value="">— Prima seleziona indirizzo —</option>';
    if (!id) return;
    try {
        const indirizzi = await Api.getIndirizzi(id);
        indirizzi.forEach(i => {
            const opt = document.createElement('option');
            opt.value = i.id; opt.textContent = i.nome;
            selInd.appendChild(opt);
        });
    } catch (err) { console.warn(err.message); }
}

async function cambiaIndirizzo() {
    const id = document.getElementById('select-indirizzo').value;
    const selMat = document.getElementById('select-materia');
    selMat.innerHTML = '<option value="">— Seleziona materia —</option>';
    if (!id) return;
    try {
        const materie = await Api.getMaterie(id);
        materie.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id; opt.textContent = m.nome;
            selMat.appendChild(opt);
        });
    } catch (err) { console.warn(err.message); }
}

async function gestisciUpload(evento) {
    evento.preventDefault();
    const titolo     = document.getElementById('upload-titolo').value.trim();
    const id_materia = document.getElementById('select-materia').value;
    const anno       = document.getElementById('select-anno').value;
    const fileInput  = document.getElementById('input-pdf');
    const bottone    = document.getElementById('btn-upload');

    if (!titolo || !id_materia || !anno || !fileInput.files[0]) {
        alert('Compila tutti i campi, seleziona l\'anno e un PDF.');
        return;
    }

    const formData = new FormData();
    formData.append('titolo', titolo);
    formData.append('id_materia', id_materia);
    formData.append('anno', anno);
    formData.append('file_pdf', fileInput.files[0]);

    Utils.bottoneCaricamento(bottone, 'Caricamento...');
    try {
        await Api.caricaAppunto(formData);
        chiudiModal();
        await caricaFeed();
    } catch (err) {
        alert('Errore: ' + err.message);
    } finally {
        Utils.bottoneRipristina(bottone);
    }
}

function inizializzaDropZone() {
    const zona  = document.getElementById('drop-zone');
    const input = document.getElementById('input-pdf');
    const testo = document.getElementById('drop-testo');
    if (!zona || !input) return;

    zona.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
        if (input.files[0]) testo.textContent = `✅ ${input.files[0].name}`;
    });
    zona.addEventListener('dragover', e => { e.preventDefault(); zona.classList.add('dragover'); });
    zona.addEventListener('dragleave', () => zona.classList.remove('dragover'));
    zona.addEventListener('drop', e => {
        e.preventDefault();
        zona.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file?.type === 'application/pdf') {
            input.files = e.dataTransfer.files;
            testo.textContent = `✅ ${file.name}`;
        } else {
            alert('Solo file PDF.');
        }
    });
}
