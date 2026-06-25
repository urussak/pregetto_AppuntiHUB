<?php
function caricaEnv() {
    static $caricato = false;
    static $variabili = [];
    if ($caricato) return $variabili;
    $percorso = __DIR__ . '/../../.env';
    if (!file_exists($percorso)) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['errore' => 'File .env non trovato. Copia .env.example in .env e inserisci le tue credenziali.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $righe = file($percorso, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($righe as $riga) {
        $riga = trim($riga);
        if ($riga === '' || str_starts_with($riga, '#')) continue;
        if (!str_contains($riga, '=')) continue;
        [$chiave, $valore] = explode('=', $riga, 2);
        $variabili[trim($chiave)] = trim($valore);
    }
    $caricato = true;
    return $variabili;
}
function env($chiave, $default = null) {
    $variabili = caricaEnv();
    return $variabili[$chiave] ?? $default;
}
