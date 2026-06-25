<?php
// api/appunti/dettaglio.php
// GET — Dettaglio singolo appunto (?id=1)

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

setHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') errore('Metodo non consentito.', 405);

$id = (int)($_GET['id'] ?? 0);
if (!$id) errore('Parametro id obbligatorio.');

$stmt = $conn->prepare("
    SELECT
        a.id, a.titolo, a.file_pdf, a.anno, a.data_upload,
        u.id   AS id_autore,
        u.email AS autore,
        m.id   AS id_materia,
        m.nome AS materia,
        i.nome AS indirizzo,
        s.nome AS scuola,
        ROUND(AVG(v.voto), 1) AS voto_medio,
        COUNT(DISTINCT v.id)  AS num_valutazioni,
        COUNT(DISTINCT c.id)  AS num_commenti
    FROM appunti a
    JOIN utenti    u ON a.id_utente    = u.id
    JOIN materie   m ON a.id_materia   = m.id
    JOIN indirizzi i ON m.id_indirizzo = i.id
    JOIN scuole    s ON i.id_scuola    = s.id
    LEFT JOIN valutazioni v ON a.id = v.id_appunto
    LEFT JOIN commenti    c ON a.id = c.id_appunto
    WHERE a.id = ?
    GROUP BY a.id
");
$stmt->bind_param('i', $id);
$stmt->execute();
$appunto = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$appunto) errore('Appunto non trovato.', 404);

risposta($appunto);
