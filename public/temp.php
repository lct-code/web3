<?php
echo "Current working directory: " . getcwd() . PHP_EOL;

// List all files and directories
$files = scandir(getcwd());
echo "Contents of directory:" . PHP_EOL;
print_r($files);
?>
