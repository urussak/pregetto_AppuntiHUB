<?php
// api/auth/verifica-otp.php
// POST — Step 2 del login: verifica OTP e restituisce token JWT

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

setHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') errore('Metodo non consentito.', 405);

$body      = getBody();
$id_utente = (int)($body['id_utente'] ?? 0);
$codice    = trim($body['codice'] ?? '');

if (!$id_utente || !$codice) errore('id_utente e codice OTP sono obbligatori.');

// ── Cerca l'OTP nel DB ───────────────────────────────────────
$stmt = $conn->prepare('SELECT * FROM otp WHERE id_utente = ? AND codice = ?');
$stmt->bind_param('is', $id_utente, $codice);
$stmt->execute();
$otp = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$otp) errore('Codice OTP non valido.', 401);

// ── Controlla scadenza ───────────────────────────────────────
if (strtotime($otp['scadenza']) < time()) {
    // Elimina l'OTP scaduto
    $stmt = $conn->prepare('DELETE FROM otp WHERE id = ?');
    $stmt->bind_param('i', $otp['id']);
    $stmt->execute();
    $stmt->close();
    errore('Codice OTP scaduto. Effettua di nuovo il login.', 401);
}

// ── OTP valido: eliminalo dal DB ─────────────────────────────
$stmt = $conn->prepare('DELETE FROM otp WHERE id = ?');
$stmt->bind_param('i', $otp['id']);
$stmt->execute();
$stmt->close();

// ── Recupera i dati dell'utente ──────────────────────────────
$stmt = $conn->prepare('SELECT id, email, ruolo FROM utenti WHERE id = ?');
$stmt->bind_param('i', $id_utente);
$stmt->execute();
$utente = $stmt->get_result()->fetch_assoc();
$stmt->close();

// ── Crea il token JWT ────────────────────────────────────────
$token = creaToken([
    'id'    => $utente['id'],
    'email' => $utente['email'],
    'ruolo' => $utente['ruolo']
]);

risposta([
    'messaggio' => 'Login effettuato con successo!',
    'token'     => $token,
    'utente'    => $utente
]);
