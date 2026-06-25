<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
setHeaders();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') errore('Metodo non consentito.', 405);
$utente = getUtenteLoggato();
richiediNonBannato($conn, $utente);
$titolo     = trim($_POST['titolo']     ?? '');
$id_materia = (int)($_POST['id_materia'] ?? 0);
$anno       = trim($_POST['anno']       ?? '');
if (!$titolo || !$id_materia) errore('Titolo e materia sono obbligatori.');
$statoIniziale = contieneContenutoNonScolastico($titolo) ? 'in_revisione' : 'approvato';
if (!isset($_FILES['file_pdf']) || $_FILES['file_pdf']['error'] !== UPLOAD_ERR_OK)
    errore('File PDF non ricevuto o errore durante il caricamento.');
$file     = $_FILES['file_pdf'];
$ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if ($ext !== 'pdf') errore('Solo file PDF sono accettati.');
if ($file['size'] > 20 * 1024 * 1024) errore('Il file supera i 20 MB.');
$nomeFile = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file['name']);
$destDir  = __DIR__ . '/../../uploads/';
if (!is_dir($destDir)) mkdir($destDir, 0777, true);
if (!move_uploaded_file($file['tmp_name'], $destDir . $nomeFile)) errore('Errore nel salvataggio del file.', 500);
$stmt = $conn->prepare('INSERT INTO appunti (titolo, file_pdf, id_utente, id_materia, anno, stato) VALUES (?, ?, ?, ?, ?, ?)');
$stmt->bind_param('ssiiss', $titolo, $nomeFile, $utente['id'], $id_materia, $anno, $statoIniziale);
$stmt->execute();
$nuovoId = $conn->insert_id;
$stmt->close();
risposta([
    'messaggio' => $statoIniziale === 'in_revisione'
        ? 'Appunto caricato! È in revisione prima di essere pubblicato.'
        : 'Appunto caricato con successo!',
    'id'    => $nuovoId,
    'file'  => $nomeFile,
    'stato' => $statoIniziale
], 201);
