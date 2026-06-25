<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/env.php';

define('EMAIL_HOST', env('EMAIL_HOST', 'smtp.gmail.com'));
define('EMAIL_PORT', (int)env('EMAIL_PORT', 587));
define('EMAIL_USER', env('EMAIL_USER', ''));
define('EMAIL_PASS', env('EMAIL_PASS', ''));

function creaMailer() {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = EMAIL_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = EMAIL_USER;
    $mail->Password   = EMAIL_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = EMAIL_PORT;
    $mail->CharSet    = 'UTF-8';
    $mail->setFrom(EMAIL_USER, 'AppuntiHUB');
    return $mail;
}

function inviaOTP($emailDestinatario, $codice) {
    $mail = creaMailer();
    $mail->addAddress($emailDestinatario);
    $mail->Subject = 'Il tuo codice di accesso — AppuntiHUB';
    $mail->isHTML(true);
    $mail->Body = "
        <div style='font-family:Arial,sans-serif;max-width:500px;margin:auto'>
            <h2 style='color:#2563EB'>📚 AppuntiHUB</h2>
            <p>Ecco il tuo codice di verifica:</p>
            <div style='font-size:40px;font-weight:bold;letter-spacing:10px;
                        color:#2563EB;padding:24px;background:#F3F4F6;
                        border-radius:12px;text-align:center;margin:20px 0'>
                {$codice}
            </div>
            <p style='color:#6B7280;font-size:14px'>
                Il codice scade tra <strong>10 minuti</strong>.<br>
                Se non hai richiesto questo codice, ignora questa email.
            </p>
        </div>";
    $mail->send();
}

function inviaResetPassword($emailDestinatario, $token) {
    $link = BASE_URL . "/frontend/pages/reset-password.html?token={$token}";
    $mail = creaMailer();
    $mail->addAddress($emailDestinatario);
    $mail->Subject = 'Reset password — AppuntiHUB';
    $mail->isHTML(true);
    $mail->Body = "
        <div style='font-family:Arial,sans-serif;max-width:500px;margin:auto'>
            <h2 style='color:#2563EB'>📚 AppuntiHUB</h2>
            <p>Hai richiesto il reset della password.</p>
            <a href='{$link}'
               style='display:inline-block;padding:14px 28px;background:#2563EB;
                      color:white;text-decoration:none;border-radius:8px;margin:16px 0;font-weight:bold'>
                Reimposta password
            </a>
            <p style='color:#6B7280;font-size:14px'>
                Il link scade tra <strong>1 ora</strong>.<br>
                Se non hai richiesto il reset, ignora questa email.
            </p>
        </div>";
    $mail->send();
}
