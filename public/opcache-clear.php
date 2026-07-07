<?php
// Standalone script to clear PHP OPcache on the VPS
header('Content-Type: text/plain');

if (function_exists('opcache_reset')) {
    if (opcache_reset()) {
        echo "SUCCESS: OPcache has been reset successfully!\n";
    } else {
        echo "FAILED: opcache_reset() returned false.\n";
    }
} else {
    echo "ERROR: OPcache extension is not enabled or opcache_reset function does not exist.\n";
}
