<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
setHeaders();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') errore('Metodo non consentito.', 405);
$utente = getUtenteLoggato(); richiediAdmin($conn, $utente);
$body = getBody();
$id_utente = (int)($body['id_utente'] ?? 0);
$bannato = isset($body['bannato']) ? (int)(bool)$body['bannato'] : null;
if (!$id_utente || $bannato === null) errore('Dati non validi.');
if ($id_utente === $utente['id']) errore('Non puoi bannare te stesso.');
$stmt = $conn->prepare('SELECT ruolo FROM utenti WHERE id=?');
$stmt->bind_param('i', $id_utente); $stmt->execute();
$target = $stmt->get_result()->fetch_assoc(); $stmt->close();
if (!$target) errore('Utente non trovato.', 404);
if ($target['ruolo'] === 'admin' && $bannato === 1) errore('Non puoi bannare un altro admin.');
$stmt = $conn->prepare('UPDATE utenti SET bannato=? WHERE id=?');
$stmt->bind_param('ii', $bannato, $id_utente); $stmt->execute(); $stmt->close();
risposta(['messaggio' => $bannato ? 'Utente bannato.' : 'Utente sbannato.']);
