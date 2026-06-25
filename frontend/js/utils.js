// js/utils.js
// Funzioni di utilità usate in tutto il frontend

const Utils = {

    mostraErrore(idElemento, testo) {
        const el = document.getElementById(idElemento);
        if (!el) return;
        el.textContent = testo;
        el.className = 'messaggio messaggio-errore visibile';
        clearTimeout(el._timer);
        el._timer = setTimeout(() => el.classList.remove('visibile'), 5000);
    },

    mostraSuccesso(idElemento, testo) {
        const el = document.getElementById(idElemento);
        if (!el) return;
        el.textContent = testo;
        el.className = 'messaggio messaggio-successo visibile';
        clearTimeout(el._timer);
        el._timer = setTimeout(() => el.classList.remove('visibile'), 4000);
    },

    bottoneCaricamento(bottone, testo = 'Caricamento...') {
        bottone.disabled = true;
        bottone._testoOriginale = bottone.textContent;
        bottone.innerHTML = `<span class="spinner visibile"></span> ${testo}`;
    },

    bottoneRipristina(bottone) {
        bottone.disabled = false;
        bottone.textContent = bottone._testoOriginale || 'Invia';
    },

    isEmailValida(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    mostraErroreCampo(input, messaggio) {
        input.classList.add('errore');
        const errTesto = input.closest('.campo')?.querySelector('.errore-testo');
        if (errTesto) {
            errTesto.textContent = messaggio;
            errTesto.classList.add('visibile');
        }
    },

    rimuoviErroreCampo(input) {
        input.classList.remove('errore');
        const errTesto = input.closest('.campo')?.querySelector('.errore-testo');
        if (errTesto) errTesto.classList.remove('visibile');
    },

    vai(pagina) {
        window.location.href = pagina;
    },

    vaiDopo(pagina, ms = 1500) {
        setTimeout(() => this.vai(pagina), ms);
    },

    formatData(dataString) {
        return new Date(dataString).toLocaleDateString('it-IT', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    }
};
