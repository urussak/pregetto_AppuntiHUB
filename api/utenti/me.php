<?php
// api/utenti/me.php
// GET — Dati dell'utente attualmente loggato

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

setHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') errore('Metodo non consentito.', 405);

$utente = getUtenteLoggato();

$stmt = $conn->prepare('SELECT id, email, ruolo, avatar, created_at FROM utenti WHERE id = ?');
$stmt->bind_param('i', $utente['id']);
$stmt->execute();
$dati = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$dati) errore('Utente non trovato.', 404);

// ✅ FIX: BASE_URL già punta a localhost — URL avatar corretto
$dati['avatar_url'] = $dati['avatar']
    ? BASE_URL . '/uploads/avatars/' . $dati['avatar']
    : null;

risposta($dati);
