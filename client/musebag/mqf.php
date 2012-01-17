<?php
  	
function processRequest($data)
{
	$imageUrl = null ;
	$keywords = '' ;
	
	foreach ( $data['fileItems'] as $item )
	{
		if ( $item['Type'] == 'ImageType' ) $imageUrl = $item['Content'] ;
		else if ( $item['Type'] = 'Text' )	$keywords = $item['Content'] ;
	}
			
	$url = "http://vision.iti.gr/sotiris/isearch/client/musebag/fetch.php?" . $_SERVER['QUERY_STRING'] ;
	if ( $keywords ) $url .= '&q=' . urlencode($keywords) ;
	if ( $imageUrl ) $url .= '&img=' . urlencode($imageUrl) ;
	
	echo file_get_contents($url) ;
}

session_start(); 

header('Content-Type: application/json; charset=utf8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, HEAD, PUT") ;
header("Access-Control-Allow-Headers: Origin, Content-Type, Accept") ;

//header('Access-Control-Max-Age: 3628800');

// database index

$data = json_decode($HTTP_RAW_POST_DATA, true);
processRequest($data) ;

//print_r($data) ;
?>