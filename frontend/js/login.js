// js/login.js
// Logica pagina login: step 1 credenziali, step 2 OTP

let idUtentePendente = null;

document.addEventListener('DOMContentLoaded', () => {
    if (Storage.isLoggato()) {
        Utils.vai(CONFIG.PAGINE.HOME);
        return;
    }

    document.getElementById('form-login')?.addEventListener('submit', gestisciLogin);
    document.getElementById('form-otp')?.addEventListener('submit', gestisciOTP);
    document.getElementById('link-forgot')?.addEventListener('click', gestisciForgot);

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => Utils.rimuoviErroreCampo(input));
    });
});

// ── STEP 1: login con email + password ───────────────────────

async function gestisciLogin(evento) {
    evento.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const bottone  = document.getElementById('btn-login');

    let valido = true;
    if (!Utils.isEmailValida(email)) {
        Utils.mostraErroreCampo(document.getElementById('email'), 'Email non valida');
        valido = false;
    }
    if (password.length < 6) {
        Utils.mostraErroreCampo(document.getElementById('password'), 'Minimo 6 caratteri');
        valido = false;
    }
    if (!valido) return;

    Utils.bottoneCaricamento(bottone, 'Accesso in corso...');

    try {
        const risposta = await Api.login(email, password);
        idUtentePendente = risposta.id_utente;

        // Nasconde step 1 e mostra step 2 (OTP)
        document.getElementById('sezione-login').style.display = 'none';
        document.getElementById('sezione-otp').classList.add('visibile');
        const emailOTP = document.getElementById('email-otp');
        if (emailOTP) emailOTP.textContent = email;
        document.getElementById('codice-otp')?.focus();

    } catch (err) {
        Utils.mostraErrore('messaggio-login', err.message);
    } finally {
        Utils.bottoneRipristina(bottone);
    }
}

// ── STEP 2: verifica OTP ─────────────────────────────────────

async function gestisciOTP(evento) {
    evento.preventDefault();

    const codice  = document.getElementById('codice-otp').value.trim();
    const bottone = document.getElementById('btn-otp');

    if (codice.length !== 6 || isNaN(codice)) {
        Utils.mostraErroreCampo(document.getElementById('codice-otp'), 'Il codice deve essere di 6 cifre');
        return;
    }

    Utils.bottoneCaricamento(bottone, 'Verifica...');

    try {
        const risposta = await Api.verificaOTP(idUtentePendente, codice);
        Storage.salvaToken(risposta.token);
        Storage.salvaUtente(risposta.utente);
        Utils.mostraSuccesso('messaggio-otp', '✅ Accesso effettuato!');
        Utils.vaiDopo(CONFIG.PAGINE.HOME, 1500);
    } catch (err) {
        Utils.mostraErrore('messaggio-otp', err.message);
        document.getElementById('codice-otp').value = '';
    } finally {
        Utils.bottoneRipristina(bottone);
    }
}

// ── FORGOT PASSWORD ──────────────────────────────────────────

async function gestisciForgot(evento) {
    evento.preventDefault();
    const email = document.getElementById('email')?.value?.trim();
    if (!email || !Utils.isEmailValida(email)) {
        Utils.mostraErrore('messaggio-login', 'Inserisci prima la tua email nel campo qui sopra.');
        return;
    }
    try {
        await Api.forgotPassword(email);
        Utils.mostraSuccesso('messaggio-login', '📧 Se l\'email è registrata riceverai un link a breve.');
    } catch (err) {
        Utils.mostraErrore('messaggio-login', err.message);
    }
}
