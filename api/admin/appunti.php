<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
setHeaders();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') errore('Metodo non consentito.', 405);
$utente = getUtenteLoggato(); richiediAdmin($conn, $utente);
$where=[]; $params=[]; $types='';
if (!empty($_GET['stato'])) { $where[]='a.stato=?'; $params[]=$_GET['stato']; $types.='s'; }
$whereSQL = $where ? 'WHERE '.implode(' AND ',$where) : '';
$sql = "SELECT a.id,a.titolo,a.file_pdf,a.anno,a.stato,a.data_upload,u.id AS id_autore,u.email AS autore,m.nome AS materia,i.nome AS indirizzo,s.nome AS scuola FROM appunti a JOIN utenti u ON a.id_utente=u.id JOIN materie m ON a.id_materia=m.id JOIN indirizzi i ON m.id_indirizzo=i.id JOIN scuole s ON i.id_scuola=s.id $whereSQL ORDER BY a.data_upload DESC";
$stmt = $conn->prepare($sql);
if ($params) $stmt->bind_param($types, ...$params);
$stmt->execute();
$appunti = $stmt->get_result()->fetch_all(MYSQLI_ASSOC); $stmt->close();
risposta(['totale'=>count($appunti),'appunti'=>$appunti]);
