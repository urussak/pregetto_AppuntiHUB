// js/registrazione.js
// Logica pagina registrazione

let ruoloScelto = null;

document.addEventListener('DOMContentLoaded', () => {
    if (Storage.isLoggato()) { Utils.vai(CONFIG.PAGINE.HOME); return; }

    Avatar.inizializza('avatar-wrapper', 'input-avatar', 'avatar-preview');

    document.querySelectorAll('.ruolo-card').forEach(card => {
        card.addEventListener('click', () => selezionaRuolo(card.dataset.ruolo));
    });

    document.getElementById('form-registrazione')?.addEventListener('submit', gestisciRegistrazione);

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => Utils.rimuoviErroreCampo(input));
    });
});

function selezionaRuolo(ruolo) {
    ruoloScelto = ruolo;
    document.querySelectorAll('.ruolo-card').forEach(card => {
        card.classList.toggle('selezionato', card.dataset.ruolo === ruolo);
    });
}

async function gestisciRegistrazione(evento) {
    evento.preventDefault();

    const email        = document.getElementById('email').value.trim();
    const password     = document.getElementById('password').value;
    const confermaPass = document.getElementById('conferma-password').value;
    const bottone      = document.getElementById('btn-registrati');

    let valido = true;
    if (!Utils.isEmailValida(email)) {
        Utils.mostraErroreCampo(document.getElementById('email'), 'Email non valida');
        valido = false;
    }
    if (password.length < 6) {
        Utils.mostraErroreCampo(document.getElementById('password'), 'Minimo 6 caratteri');
        valido = false;
    }
    if (password !== confermaPass) {
        Utils.mostraErroreCampo(document.getElementById('conferma-password'), 'Le password non coincidono');
        valido = false;
    }
    if (!ruoloScelto) {
        Utils.mostraErrore('messaggio-reg', 'Seleziona se sei studente o professore.');
        valido = false;
    }
    if (!valido) return;

    Utils.bottoneCaricamento(bottone, 'Registrazione...');

    try {
        await Api.registrazione(email, password, ruoloScelto);
        Utils.mostraSuccesso('messaggio-reg', '🎉 Account creato! Ora accedi.');
        Utils.vaiDopo(CONFIG.PAGINE.LOGIN, 2000);
    } catch (err) {
        Utils.mostraErrore('messaggio-reg', err.message);
    } finally {
        Utils.bottoneRipristina(bottone);
    }
}
