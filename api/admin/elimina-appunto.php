<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
setHeaders();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') errore('Metodo non consentito.', 405);
$utente = getUtenteLoggato(); richiediAdmin($conn, $utente);
$body = getBody();
$id_appunto = (int)($body['id_appunto'] ?? 0);
if (!$id_appunto) errore('id_appunto obbligatorio.');
$stmt = $conn->prepare('SELECT file_pdf FROM appunti WHERE id=?');
$stmt->bind_param('i', $id_appunto); $stmt->execute();
$appunto = $stmt->get_result()->fetch_assoc(); $stmt->close();
if (!$appunto) errore('Appunto non trovato.', 404);
$conn->begin_transaction();
try {
    foreach (['DELETE FROM commenti WHERE id_appunto=?','DELETE FROM valutazioni WHERE id_appunto=?','DELETE FROM appunti WHERE id=?'] as $q) {
        $s=$conn->prepare($q); $s->bind_param('i',$id_appunto); $s->execute(); $s->close();
    }
    $conn->commit();
} catch(Exception $e) { $conn->rollback(); errore('Errore durante eliminazione.',500); }
$percorso = __DIR__.'/../../uploads/'.$appunto['file_pdf'];
if (file_exists($percorso)) unlink($percorso);
risposta(['messaggio'=>'Appunto eliminato definitivamente.']);
