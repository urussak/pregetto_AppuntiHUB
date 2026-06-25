<?php
// api/appunti/download.php
// GET — Scarica il PDF di un appunto (?id=1)

require_once __DIR__ . '/../config/db.php';

// Header CORS (senza JSON perché mandiamo un PDF)
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    exit('Metodo non consentito.');
}

$id = (int)($_GET['id'] ?? 0);
if (!$id) { http_response_code(400); exit('ID mancante.'); }

$stmt = $conn->prepare('SELECT file_pdf, titolo FROM appunti WHERE id = ?');
$stmt->bind_param('i', $id);
$stmt->execute();
$appunto = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$appunto) { http_response_code(404); exit('Appunto non trovato.'); }

$percorso = __DIR__ . '/../../uploads/' . $appunto['file_pdf'];
if (!file_exists($percorso)) { http_response_code(404); exit('File non trovato sul server.'); }

// Forza il download nel browser
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $appunto['titolo'] . '.pdf"');
header('Content-Length: ' . filesize($percorso));
readfile($percorso);
exit;
