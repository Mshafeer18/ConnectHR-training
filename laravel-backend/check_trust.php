<?php
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/app/Http/Middleware/TrustProxies.php';
echo "Declared classes:\n";
foreach (get_declared_classes() as $c) {
    if (str_starts_with($c, 'App\\Http\\Middleware')) {
        echo $c . PHP_EOL;
    }
}
echo "autoload class_exists: ";
echo class_exists('App\\Http\\Middleware\\TrustProxies') ? "yes\n" : "no\n";