<?php
declare(strict_types=1);

$lang = isset($_GET['lang']) && $_GET['lang'] === 'cs' ? 'cs' : 'en';
$file = $lang === 'cs' ? '/index.cs.html' : '/index.html';

header('Content-Language: ' . $lang);

readfile(__DIR__ . $file);