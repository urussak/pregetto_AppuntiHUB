<?php
// api/messaggi/inbox.php
// GET — Lista di tutte le conversazioni dell'utente loggato

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

setHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') errore('Metodo non consentito.', 405);

$utente = getUtenteLoggato();
$id     = $utente['id'];

$stmt = $conn->prepare("
    SELECT
        IF(m.mittente_id = ?, m.destinatario_id, m.mittente_id) AS id_interlocutore,
        u.email AS interlocutore_email,
        m.testo AS ultimo_messaggio,
        m.data_invio,
        m.mittente_id
    FROM messaggi m
    JOIN utenti u ON u.id = IF(m.mittente_id = ?, m.destinatario_id, m.mittente_id)
    WHERE m.mittente_id = ? OR m.destinatario_id = ?
    ORDER BY m.data_invio DESC
");
$stmt->bind_param('iiii', $id, $id, $id, $id);
$stmt->execute();
$tutti = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// Mostra solo l'ultimo messaggio per ogni conversazione
$visti = [];
$inbox = [];
foreach ($tutti as $messaggio) {
    $interlocutore = $messaggio['id_interlocutore'];
    if (!in_array($interlocutore, $visti)) {
        $visti[] = $interlocutore;
        $inbox[] = $messaggio;
    }
}

risposta(['conversazioni' => $inbox]);
