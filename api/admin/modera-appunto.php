<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
setHeaders();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') errore('Metodo non consentito.', 405);
$utente = getUtenteLoggato(); richiediAdmin($conn, $utente);
$body = getBody();
$id_appunto = (int)($body['id_appunto'] ?? 0);
$nuovoStato = trim($body['stato'] ?? '');
if (!$id_appunto || !in_array($nuovoStato, ['approvato','rifiutato'])) errore('Dati non validi.');
$stmt = $conn->prepare('UPDATE appunti SET stato=? WHERE id=?');
$stmt->bind_param('si', $nuovoStato, $id_appunto); $stmt->execute(); $stmt->close();
risposta(['messaggio' => "Appunto impostato come \"$nuovoStato\"."]);
