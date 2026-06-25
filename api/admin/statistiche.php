<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
setHeaders();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') errore('Metodo non consentito.', 405);
$utente = getUtenteLoggato(); richiediAdmin($conn, $utente);
risposta([
    'totale_utenti'  => (int)$conn->query('SELECT COUNT(*) n FROM utenti')->fetch_assoc()['n'],
    'utenti_bannati' => (int)$conn->query('SELECT COUNT(*) n FROM utenti WHERE bannato=1')->fetch_assoc()['n'],
    'totale_appunti' => (int)$conn->query('SELECT COUNT(*) n FROM appunti')->fetch_assoc()['n'],
    'in_revisione'   => (int)$conn->query("SELECT COUNT(*) n FROM appunti WHERE stato='in_revisione'")->fetch_assoc()['n'],
    'totale_commenti'=> (int)$conn->query('SELECT COUNT(*) n FROM commenti')->fetch_assoc()['n'],
]);
