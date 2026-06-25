<?php
// api/catalogo/scuole.php
// GET — Lista tutte le scuole

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

setHeaders();

$scuole = $conn->query('SELECT * FROM scuole ORDER BY nome')->fetch_all(MYSQLI_ASSOC);
risposta($scuole);
