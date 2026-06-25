<?php
// api/auth/forgot-password.php
// POST — Invia email con link per reset password

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/email.php';

setHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') errore('Metodo non consentito.', 405);

$body  = getBody();
$email = trim($body['email'] ?? '');

if (!$email || !isEmailValida($email)) errore('Inserisci un\'email valida.');

// Risposta sempre uguale per sicurezza (non rivela se l'email esiste)
$messaggio = ['messaggio' => 'Se l\'email è registrata, riceverai un link a breve.'];

$stmt = $conn->prepare('SELECT id FROM utenti WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$utente = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($utente) {
    // Genera token casuale sicuro
    $token    = bin2hex(random_bytes(32));
    $scadenza = date('Y-m-d H:i:s', time() + 3600); // 1 ora

    // Elimina vecchi token di questo utente
    $stmt = $conn->prepare('DELETE FROM reset_password WHERE id_utente = ?');
    $stmt->bind_param('i', $utente['id']);
    $stmt->execute();
    $stmt->close();

    // Salva il nuovo token
    $stmt = $conn->prepare('INSERT INTO reset_password (token, id_utente, scadenza) VALUES (?, ?, ?)');
    $stmt->bind_param('sis', $token, $utente['id'], $scadenza);
    $stmt->execute();
    $stmt->close();

    try {
        inviaResetPassword($email, $token);
    } catch (Exception $e) {
        errore('Errore invio email.', 500);
    }
}

risposta($messaggio);
