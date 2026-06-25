<?php
// api/commenti/get.php
// GET — Tutti i commenti di un appunto (?id_appunto=1)

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

setHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') errore('Metodo non consentito.', 405);

$id_appunto = (int)($_GET['id_appunto'] ?? 0);
if (!$id_appunto) errore('id_appunto obbligatorio.');

$stmt = $conn->prepare("
    SELECT
        c.id,
        c.testo,
        c.data_commento,
        u.email AS autore,
        u.ruolo
    FROM commenti c
    JOIN utenti u ON c.id_utente = u.id
    WHERE c.id_appunto = ?
    ORDER BY c.data_commento ASC
");
$stmt->bind_param('i', $id_appunto);
$stmt->execute();
$commenti = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

risposta(['totale' => count($commenti), 'commenti' => $commenti]);
