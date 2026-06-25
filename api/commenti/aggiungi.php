<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
setHeaders();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') errore('Metodo non consentito.', 405);
$utente     = getUtenteLoggato();
richiediNonBannato($conn, $utente);
$body       = getBody();
$id_appunto = (int)($body['id_appunto'] ?? 0);
$testo      = trim($body['testo'] ?? '');
if (!$id_appunto || !$testo) errore('id_appunto e testo sono obbligatori.');
if (contieneContenutoNonScolastico($testo)) errore('Il commento contiene termini non ammessi.');
$stmt = $conn->prepare('INSERT INTO commenti (testo, id_utente, id_appunto) VALUES (?, ?, ?)');
$stmt->bind_param('sii', $testo, $utente['id'], $id_appunto);
$stmt->execute();
$id = $conn->insert_id;
$stmt->close();
risposta(['messaggio' => 'Commento aggiunto.', 'id' => $id], 201);
