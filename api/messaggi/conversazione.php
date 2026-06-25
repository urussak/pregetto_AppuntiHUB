<?php
// api/messaggi/conversazione.php
// GET — Tutti i messaggi tra me e un altro utente (?id_utente=2)

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

setHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') errore('Metodo non consentito.', 405);

$utente   = getUtenteLoggato();
$id_io    = $utente['id'];
$id_altro = (int)($_GET['id_utente'] ?? 0);

if (!$id_altro) errore('id_utente obbligatorio.');

$stmt = $conn->prepare("
    SELECT
        m.id,
        m.testo,
        m.data_invio,
        m.mittente_id,
        m.destinatario_id,
        u_mit.email AS mittente_email,
        u_des.email AS destinatario_email
    FROM messaggi m
    JOIN utenti u_mit ON m.mittente_id    = u_mit.id
    JOIN utenti u_des ON m.destinatario_id = u_des.id
    WHERE
        (m.mittente_id = ? AND m.destinatario_id = ?)
        OR
        (m.mittente_id = ? AND m.destinatario_id = ?)
    ORDER BY m.data_invio ASC
");
$stmt->bind_param('iiii', $id_io, $id_altro, $id_altro, $id_io);
$stmt->execute();
$messaggi = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

risposta(['totale' => count($messaggi), 'messaggi' => $messaggi]);
