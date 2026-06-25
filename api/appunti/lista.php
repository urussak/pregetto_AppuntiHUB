<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
setHeaders();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') errore('Metodo non consentito.', 405);
$where  = ["a.stato = 'approvato'"];
$params = [];
$types  = '';
if (!empty($_GET['id_materia']))  { $where[] = 'a.id_materia = ?';  $params[] = (int)$_GET['id_materia'];  $types .= 'i'; }
if (!empty($_GET['id_indirizzo'])){ $where[] = 'm.id_indirizzo = ?';$params[] = (int)$_GET['id_indirizzo'];$types .= 'i'; }
if (!empty($_GET['anno']))        { $where[] = 'a.anno = ?';        $params[] = $_GET['anno'];              $types .= 's'; }
if (!empty($_GET['cerca']))       { $where[] = 'a.titolo LIKE ?';   $params[] = '%'.$_GET['cerca'].'%';    $types .= 's'; }
$whereSQL = 'WHERE ' . implode(' AND ', $where);
$sql = "
    SELECT a.id, a.titolo, a.file_pdf, a.anno, a.stato, a.data_upload,
           u.email AS autore, m.nome AS materia, i.nome AS indirizzo, s.nome AS scuola,
           ROUND(AVG(v.voto),1) AS voto_medio, COUNT(DISTINCT v.id) AS num_valutazioni
    FROM appunti a
    JOIN utenti    u ON a.id_utente    = u.id
    JOIN materie   m ON a.id_materia   = m.id
    JOIN indirizzi i ON m.id_indirizzo = i.id
    JOIN scuole    s ON i.id_scuola    = s.id
    LEFT JOIN valutazioni v ON a.id = v.id_appunto
    $whereSQL
    GROUP BY a.id
    ORDER BY a.data_upload DESC";
$stmt = $conn->prepare($sql);
if ($params) $stmt->bind_param($types, ...$params);
$stmt->execute();
$appunti = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();
risposta(['totale' => count($appunti), 'appunti' => $appunti]);
