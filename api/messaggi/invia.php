<?php
// api/messaggi/invia.php
// POST — Invia un messaggio privato a un altro utente

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

setHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') errore('Metodo non consentito.', 405);

$utente          = getUtenteLoggato();
$body            = getBody();
$destinatario_id = (int)($body['destinatario_id'] ?? 0);
$testo           = trim($body['testo'] ?? '');

if (!$destinatario_id || !$testo) errore('destinatario_id e testo sono obbligatori.');
if ($destinatario_id === $utente['id']) errore('Non puoi mandare messaggi a te stesso.');

// Verifica che il destinatario esista
$stmt = $conn->prepare('SELECT id FROM utenti WHERE id = ?');
$stmt->bind_param('i', $destinatario_id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows === 0) errore('Destinatario non trovato.', 404);
$stmt->close();

$stmt = $conn->prepare('INSERT INTO messaggi (testo, mittente_id, destinatario_id) VALUES (?, ?, ?)');
$stmt->bind_param('sii', $testo, $utente['id'], $destinatario_id);
$stmt->execute();
$nuovoId = $conn->insert_id;
$stmt->close();

risposta(['messaggio' => 'Messaggio inviato!', 'id' => $nuovoId], 201);
