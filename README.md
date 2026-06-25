# 📚 AppuntiHUB

Piattaforma per la condivisione di appunti PDF tra studenti. PHP + MySQL backend, HTML/CSS/JS frontend.

## Installazione

```bash
git clone https://github.com/tuo-utente/appuntihub.git
cd appuntihub
composer install
cp .env.example .env   # poi modifica .env con le tue credenziali
```

Importa `database.sql` su phpMyAdmin, poi copia la cartella in `htdocs/appuntihub`.

```bash
chmod -R 777 uploads/
```

Apri: `http://localhost/appuntihub/frontend/pages/login.html`

## Primo admin

Su phpMyAdmin → AppuntiHUB → SQL:
```sql
UPDATE utenti SET ruolo = 'admin' WHERE email = 'tuaemail@esempio.it';
```
Poi esci e rientra: apparirà il bottone 🛠️ Admin.

## Funzionalità
- Login 2 step (password + OTP email)
- Upload PDF con filtro per materia, indirizzo, anno
- Valutazioni, commenti, messaggistica privata
- Foto profilo
- Filtro automatico contenuti non scolastici
- Pannello admin: moderazione appunti, ban/promuovi utenti
