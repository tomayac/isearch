<?php

if ( isset($_GET["filename"] ) )
{
	$filename = $_GET["filename"] ;
	header('Content-type: application/xml');
	header('Content-Disposition: attachment; filename="' . $filename . '"');

	readfile($filename) ;
	
	unlink($filename) ;
}
else
{
	$content = $_POST['content'] ;
	$filename = $_POST['filename'] ;
	
	$handle = fopen($filename, 'w');
	fwrite($handle, $content) ;
	fclose($handle) ;
	
	header('Content-type: application/json');
	echo '{ "success": "true" }' ;
}
?>