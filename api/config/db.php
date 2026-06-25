<?php
require_once __DIR__ . '/env.php';
$db_host = env('DB_HOST', 'localhost');
$db_user = env('DB_USER', 'root');
$db_pass = env('DB_PASS', '');
$db_name = env('DB_NAME', 'AppuntiHUB');
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
$conn->set_charset('utf8mb4');
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['errore' => 'Connessione al database fallita.']);
    exit;
}
