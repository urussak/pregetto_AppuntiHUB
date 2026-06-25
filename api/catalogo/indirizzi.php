<?php
// api/catalogo/indirizzi.php
// GET — Indirizzi, filtrabili per scuola (?id_scuola=1)

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

setHeaders();

if (!empty($_GET['id_scuola'])) {
    $id   = (int)$_GET['id_scuola'];
    $stmt = $conn->prepare('
        SELECT i.*, s.nome AS scuola
        FROM indirizzi i
        JOIN scuole s ON i.id_scuola = s.id
        WHERE i.id_scuola = ?
    ');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $indirizzi = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
} else {
    $indirizzi = $conn->query('
        SELECT i.*, s.nome AS scuola
        FROM indirizzi i
        JOIN scuole s ON i.id_scuola = s.id
    ')->fetch_all(MYSQLI_ASSOC);
}

risposta($indirizzi);
