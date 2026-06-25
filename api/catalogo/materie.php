<?php
// api/catalogo/materie.php
// GET — Materie, filtrabili per indirizzo (?id_indirizzo=1)

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

setHeaders();

if (!empty($_GET['id_indirizzo'])) {
    $id   = (int)$_GET['id_indirizzo'];
    $stmt = $conn->prepare('
        SELECT m.*, i.nome AS indirizzo, s.nome AS scuola
        FROM materie m
        JOIN indirizzi i ON m.id_indirizzo = i.id
        JOIN scuole    s ON i.id_scuola    = s.id
        WHERE m.id_indirizzo = ?
    ');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $materie = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
} else {
    $materie = $conn->query('
        SELECT m.*, i.nome AS indirizzo
        FROM materie m
        JOIN indirizzi i ON m.id_indirizzo = i.id
    ')->fetch_all(MYSQLI_ASSOC);
}

risposta($materie);
