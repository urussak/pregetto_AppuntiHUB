<?php
require_once __DIR__ . '/env.php';

define('JWT_SECRET', env('JWT_SECRET', 'cambia-questa-stringa'));
define('BASE_URL',   env('BASE_URL',   'http://localhost/appuntihub'));

function setHeaders() {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);
}

function risposta($dati, $codice = 200) {
    http_response_code($codice);
    echo json_encode($dati, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function errore($messaggio, $codice = 400) {
    http_response_code($codice);
    echo json_encode(['errore' => $messaggio], JSON_UNESCAPED_UNICODE);
    exit;
}

function getBody() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function creaToken($utente) {
    $header    = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload   = base64_encode(json_encode([
        'id'    => $utente['id'],
        'email' => $utente['email'],
        'ruolo' => $utente['ruolo'],
        'exp'   => time() + 86400,
    ]));
    $signature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$signature";
}

function verificaToken($token) {
    $parti = explode('.', $token);
    if (count($parti) !== 3) return null;
    [$header, $payload, $signature] = $parti;
    $firmaAttesa = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    if (!hash_equals($firmaAttesa, $signature)) return null;
    $dati = json_decode(base64_decode($payload), true);
    if (!$dati || $dati['exp'] < time()) return null;
    return $dati;
}

function getUtenteLoggato() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$authHeader && function_exists('apache_request_headers')) {
        $headers    = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }
    if (!$authHeader) $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer '))
        errore('Token mancante. Effettua il login.', 401);
    $token  = substr($authHeader, 7);
    $utente = verificaToken($token);
    if (!$utente) errore('Token non valido o scaduto.', 403);
    return $utente;
}

function richiediAdmin($conn, $utente) {
    $stmt = $conn->prepare('SELECT ruolo, bannato FROM utenti WHERE id = ?');
    $stmt->bind_param('i', $utente['id']);
    $stmt->execute();
    $dati = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$dati) errore('Utente non trovato.', 404);
    if ((int)$dati['bannato'] === 1) errore('Il tuo account è stato bannato.', 403);
    if ($dati['ruolo'] !== 'admin') errore('Accesso riservato agli amministratori.', 403);
}

function richiediNonBannato($conn, $utente) {
    $stmt = $conn->prepare('SELECT bannato FROM utenti WHERE id = ?');
    $stmt->bind_param('i', $utente['id']);
    $stmt->execute();
    $dati = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if ($dati && (int)$dati['bannato'] === 1)
        errore('Il tuo account è stato sospeso. Contatta un amministratore.', 403);
}

function contieneContenutoNonScolastico($testo) {
    $testo = mb_strtolower($testo, 'UTF-8');
    $blacklist = [
        'cazzo','merda','stronzo','puttana','troia','vaffanculo','bastardo','figa','minchia','coglione',
        'porno','pornografia','xxx','sesso','nudo','nuda',
        'clicca qui','vinci ora','bitcoin','crypto','scommesse','casino online','guadagna soldi facili',
    ];
    foreach ($blacklist as $parola) {
        if (str_contains($testo, $parola)) return true;
    }
    return false;
}
