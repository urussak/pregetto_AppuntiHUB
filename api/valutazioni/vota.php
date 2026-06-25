<?php
// api/valutazioni/vota.php
// POST — Vota un appunto da 1 a 5 stelle (richiede login)

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

setHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') errore('Metodo non consentito.', 405);

$utente     = getUtenteLoggato();
$body       = getBody();
$id_appunto = (int)($body['id_appunto'] ?? 0);
$voto       = (int)($body['voto'] ?? 0);

if (!$id_appunto || !$voto) errore('id_appunto e voto sono obbligatori.');
if ($voto < 1 || $voto > 5) errore('Il voto deve essere tra 1 e 5.');

// ── Verifica che l'appunto esista e non sia tuo ───────────────
$stmt = $conn->prepare('SELECT id_utente FROM appunti WHERE id = ?');
$stmt->bind_param('i', $id_appunto);
$stmt->execute();
$appunto = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$appunto) errore('Appunto non trovato.', 404);
if ($appunto['id_utente'] == $utente['id']) {
    errore('Non puoi votare il tuo stesso appunto.', 403);
}

// ── INSERT o UPDATE ──────────────────────────────────────────
// Grazie al UNIQUE (id_utente, id_appunto) nel DB:
// se l'utente ha già votato → aggiorna il voto
// altrimenti → inserisce nuovo voto

$stmt = $conn->prepare("
    INSERT INTO valutazioni (voto, id_utente, id_appunto)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE voto = VALUES(voto)
");
$stmt->bind_param('iii', $voto, $utente['id'], $id_appunto);
$stmt->execute();
$stmt->close();

// ── Calcola nuovo voto medio ─────────────────────────────────
$stmt = $conn->prepare('
    SELECT ROUND(AVG(voto), 1) AS voto_medio, COUNT(*) AS totale
    FROM valutazioni
    WHERE id_appunto = ?
');
$stmt->bind_param('i', $id_appunto);
$stmt->execute();
$media = $stmt->get_result()->fetch_assoc();
$stmt->close();

risposta([
    'messaggio'   => 'Valutazione salvata!',
    'voto_medio'  => $media['voto_medio'],
    'totale_voti' => $media['totale']
]);
