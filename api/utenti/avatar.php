<?php
// api/utenti/avatar.php
// POST — Carica o aggiorna l'immagine profilo (richiede login)

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

setHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') errore('Metodo non consentito.', 405);

$utente = getUtenteLoggato();

if (empty($_FILES['avatar'])) errore('Nessuna immagine ricevuta.');

$file        = $_FILES['avatar'];
$tipiAmmessi = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

if (!in_array($file['type'], $tipiAmmessi)) {
    errore('Sono accettate solo immagini JPEG, PNG, WEBP o GIF.');
}
if ($file['size'] > 2 * 1024 * 1024) {
    errore('L\'immagine non può superare 2MB.');
}

// ── Elimina vecchio avatar dal disco ─────────────────────────
$avatarDir = __DIR__ . '/../../uploads/avatars/';
if (!is_dir($avatarDir)) mkdir($avatarDir, 0755, true);

$stmt = $conn->prepare('SELECT avatar FROM utenti WHERE id = ?');
$stmt->bind_param('i', $utente['id']);
$stmt->execute();
$dati = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($dati['avatar']) {
    $vecchio = $avatarDir . $dati['avatar'];
    if (file_exists($vecchio)) unlink($vecchio);
}

// ── Salva il nuovo avatar ────────────────────────────────────
$ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$nomeFile = 'avatar_' . $utente['id'] . '_' . time() . '.' . $ext;
$percorso = $avatarDir . $nomeFile;

if (!move_uploaded_file($file['tmp_name'], $percorso)) {
    errore('Errore nel salvataggio dell\'immagine.', 500);
}

// ── Aggiorna il DB ───────────────────────────────────────────
$stmt = $conn->prepare('UPDATE utenti SET avatar = ? WHERE id = ?');
$stmt->bind_param('si', $nomeFile, $utente['id']);
$stmt->execute();
$stmt->close();

risposta([
    'messaggio'  => 'Avatar aggiornato con successo!',
    'avatar_url' => BASE_URL . '/uploads/avatars/' . $nomeFile
]);
