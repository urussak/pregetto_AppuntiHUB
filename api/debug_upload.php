<?php
// api/debug_upload.php
// FILE DI DIAGNOSTICA — eliminalo dopo aver risolto il problema!
// Aprilo nel browser: http://localhost/appuntihub_php/appuntihub_new/api/debug_upload.php

header('Content-Type: text/plain; charset=utf-8');

echo "=== DIAGNOSTICA UPLOAD ===\n\n";

// 1. Percorso cartella uploads
$uploadDir = realpath(__DIR__ . '/../') . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;
echo "Percorso uploads: $uploadDir\n";
echo "Esiste: " . (is_dir($uploadDir) ? "SÌ ✓" : "NO ✗ — CREA QUESTA CARTELLA!") . "\n";
echo "Scrivibile: " . (is_writable($uploadDir) ? "SÌ ✓" : "NO ✗ — IMPOSTA PERMESSI 755!") . "\n\n";

// 2. Impostazioni PHP rilevanti
echo "=== IMPOSTAZIONI PHP ===\n";
echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
echo "post_max_size: "       . ini_get('post_max_size') . "\n";
echo "file_uploads: "        . ini_get('file_uploads') . "\n";
echo "upload_tmp_dir: "      . (ini_get('upload_tmp_dir') ?: '(default sistema)') . "\n";
echo "tmp scrivibile: "      . (is_writable(sys_get_temp_dir()) ? "SÌ ✓" : "NO ✗") . "\n\n";

// 3. Percorso assoluto del progetto
echo "=== PERCORSI ===\n";
echo "__DIR__: " . __DIR__ . "\n";
echo "Radice progetto: " . realpath(__DIR__ . '/..') . "\n";
