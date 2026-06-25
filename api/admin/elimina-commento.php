<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
setHeaders();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') errore('Metodo non consentito.', 405);
$utente = getUtenteLoggato(); richiediAdmin($conn, $utente);
$body = getBody();
$id_commento = (int)($body['id_commento'] ?? 0);
if (!$id_commento) errore('id_commento obbligatorio.');
$stmt = $conn->prepare('DELETE FROM commenti WHERE id=?');
$stmt->bind_param('i',$id_commento); $stmt->execute();
if ($stmt->affected_rows === 0) errore('Commento non trovato.',404);
$stmt->close();
risposta(['messaggio'=>'Commento eliminato.']);
