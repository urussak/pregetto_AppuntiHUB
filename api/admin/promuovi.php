<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
setHeaders();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') errore('Metodo non consentito.', 405);
$utente = getUtenteLoggato(); richiediAdmin($conn, $utente);
$body = getBody();
$id_utente = (int)($body['id_utente'] ?? 0);
$nuovoRuolo = trim($body['ruolo'] ?? '');
if (!$id_utente || !in_array($nuovoRuolo, ['studente','professore','admin'])) errore('Dati non validi.');
if ($id_utente === $utente['id'] && $nuovoRuolo !== 'admin') errore('Non puoi rimuovere il tuo stesso ruolo admin.');
$stmt = $conn->prepare('UPDATE utenti SET ruolo=? WHERE id=?');
$stmt->bind_param('si', $nuovoRuolo, $id_utente);
$stmt->execute(); $stmt->close();
risposta(['messaggio' => "Ruolo aggiornato a \"$nuovoRuolo\"."]);
