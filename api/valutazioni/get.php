<?php
// api/valutazioni/get.php
// GET — Statistiche voti di un appunto (?id_appunto=1)

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

setHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') errore('Metodo non consentito.', 405);

$id_appunto = (int)($_GET['id_appunto'] ?? 0);
if (!$id_appunto) errore('id_appunto obbligatorio.');

$stmt = $conn->prepare("
    SELECT
        ROUND(AVG(voto), 1)                              AS voto_medio,
        COUNT(*)                                         AS totale_voti,
        SUM(CASE WHEN voto = 1 THEN 1 ELSE 0 END)       AS stelle_1,
        SUM(CASE WHEN voto = 2 THEN 1 ELSE 0 END)       AS stelle_2,
        SUM(CASE WHEN voto = 3 THEN 1 ELSE 0 END)       AS stelle_3,
        SUM(CASE WHEN voto = 4 THEN 1 ELSE 0 END)       AS stelle_4,
        SUM(CASE WHEN voto = 5 THEN 1 ELSE 0 END)       AS stelle_5
    FROM valutazioni
    WHERE id_appunto = ?
");
$stmt->bind_param('i', $id_appunto);
$stmt->execute();
$risultato = $stmt->get_result()->fetch_assoc();
$stmt->close();

risposta($risultato);
