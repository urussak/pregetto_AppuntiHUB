<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
setHeaders();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') errore('Metodo non consentito.', 405);
$utente = getUtenteLoggato(); richiediAdmin($conn, $utente);
$stmt = $conn->prepare('SELECT u.id,u.email,u.ruolo,u.bannato,u.created_at,(SELECT COUNT(*) FROM appunti a WHERE a.id_utente=u.id) AS num_appunti,(SELECT COUNT(*) FROM commenti c WHERE c.id_utente=u.id) AS num_commenti FROM utenti u ORDER BY u.created_at DESC');
$stmt->execute();
$utenti = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();
risposta(['totale' => count($utenti), 'utenti' => $utenti]);
