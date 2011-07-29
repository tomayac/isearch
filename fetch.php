<?php


function invokeService()
{
	set_time_limit(100) ;
	$ch = curl_init("http://vision.iti.gr:8080/fcgi-bin/indexer2.exe?" . $_SERVER['QUERY_STRING']);

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HEADER, 0);

	$data = curl_exec($ch);
	curl_close($ch);

	return $data ;
}

function parseClusters($outerNode)
{	

	$rootNode = null ;
	
	$res = array() ;
	
	$children = array() ;
	
	foreach( $outerNode->childNodes as $childNode )
	{
		if ( $childNode->nodeName == "Cluster" ) {
			
			$cluster = array() ;
			
			$rootNode = $childNode ;
		
			$level = $rootNode->getAttribute('level') ;
			$cluster['level'] = $level ;
			
			
			$nodes = array() ;
				
			foreach ( $rootNode->childNodes as $nodeElement )
			{
				if ( $nodeElement->nodeName != 'Node' ) continue ;
				
				$node = array() ;
				$node['docidx'] = $nodeElement->getAttribute("docidx") ;
				$x = $nodeElement->getAttribute("x") ;
				if ( $x ) $node['x'] = $x ;
				$y = $nodeElement->getAttribute("y") ;
				if ( $y ) $node['y'] = $y ;
						
				$nodes[] = $node ;
			}
	
			
			$cluster['nodes'] = $nodes ;
							
			$cl = parseClusters($childNode) ;
			
			if ( !empty($cl) )
				$cluster['children'] = $cl ;
				
			$res[] = $cluster ;
						
		}
		
		
	}
	
	return $res ;
}

function xml2json($data)
{
	$xml = DOMDocument::loadXML($data);
	$callback = '' ;
	if ( isset($_GET['callback'] ) ) $callback = $_GET['callback'] ; 
	
	if ( !$xml )
	{
		if ( $callback == '' ) 
			echo "{ 'error': 'service invocation error'}" ;
		else
			echo $callback . "({ 'error': 'service invocation error'});" ;
	}
	
	$res = array() ;
	
	$res['documentList'] = array() ;
	
	$docs = $xml->getElementsByTagName("Document") ;
	
	// parse documents
	
	foreach ($docs as $docElement)
	{	
		$docObj = array() ;
		
		$docObj['id'] = $docElement->getAttribute("id") ;
		$docObj['score'] = $docElement->getAttribute("score") ;
		$mediaList = $docElement->getElementsByTagName("MultimediaContent") ;
		
		$media = array() ;
		
		foreach ( $mediaList as $mediaElement ) 
		{
			$mediaItem = array() ;
			
			$type = $mediaElement->getAttribute("type") ;
			
			$mediaItem['type'] = $type ;
			
			$formatElements = $mediaElement->getElementsByTagName("FileFormat") ;
			if ( $formatElements->length == 1 ) $mediaItem['format'] = $formatElements->item(0)->firstChild->nodeValue ;
			
			$uriElements = $mediaElement->getElementsByTagName("MediaUri") ;
			if ( $uriElements->length == 1  ) $mediaItem['url'] = $uriElements->item(0)->firstChild->nodeValue ;
			
			if ( $type == "Text" )
			{
				$freeText = $mediaElement->getElementsByTagName("FreeText") ;
				if ( $freeText->length == 1 )
				{
					$text = str_replace("\n", ' ', $freeText->item(0)->firstChild->textContent) ;
					$mediaItem['text'] = $text ;
				}
			}
			
			$previews = array() ;
			
			$previewElements = $mediaElement->getElementsByTagName("MediaPreview") ;
			
			foreach ( $previewElements as $previewElement )
			{
				$previewItem = array() ;
				$previewItem['format'] = $previewElement->getAttribute('format') ;
				$previewItem['url'] = $previewElement->firstChild->nodeValue ;
			
				
				$previews[] = $previewItem ;
			}
						
			$mediaItem['previews'] = $previews ;
						
			$media[] = $mediaItem ;
		
		}
		
		$docObj['media'] = $media ;
		
		$rw = array() ;
		
		$rwInfoList = $docElement->getElementsByTagName("RealWorldInfo") ;
		
		if ( $rwInfoList->length > 0 )
		{
			$rwInfo = $rwInfoList->item(0) ;
			
			$sposElements = $rwInfo->getElementsByTagName("CircleByCenterPoint") ;
			
			if ( $sposElements->length > 0 )
			{
				$sp = $sposElements->item(0) ;
								
				$rw['pos'] = array() ;
				
						
				foreach ( $sp->childNodes as $ce )
				{
								
					if ( $ce->nodeName == "pos" )
					{
						$coords = array() ;
						$latlon = preg_split("/[\s]+/", $ce->firstChild->nodeValue)  ;
						
						$coords['lat'] = $latlon[0] ;
						$coords['lon'] = $latlon[1] ;
						
						$rw['pos']['coords'] = $coords ;
					}
					else if ( $ce->nodeName == "radius" )
					{
						$rw['pos']['radius'] = $ce->firstChild->nodeValue ;
					}
				}		
			}

			$dtElements = $rwInfo->getElementsByTagName("DateTime") ;
			
			if ( $dtElements->length > 0 )
			{
				$dtEle = $dtElements->item(0) ;
				
				$rw['time'] = array() ;
				
				foreach ( $dtEle->childNodes as $ce )
				{
					if ( $ce->nodeName == "Date" )
					{
						$rw['time']['dateTime'] = $ce->firstChild->nodeValue ;
					}
					else if ( $ce->nodeName == "Length" )
					{
						$rw['time']['duration'] = $ce->firstChild->nodeValue ;
					}
				}		
			


			}
		}
		
		if ( !empty($rw) ) $docObj['rw'] = $rw ;
		
		$res['documentList'][] = $docObj ;
		
	}	
	
	$rootNode = $xml->getElementsByTagName("SearchResults")->item(0) ;
	
	$res['clusters'] = parseClusters($rootNode) ;
	
	if ( $callback )
		echo $callback . '(' . json_encode($res) . ')' ;
	else
		echo json_encode($res) ;
	
}

if ( isset($_GET['out']) && $_GET['out'] == "xml" )
{
	header("content-type: text/xml");
	echo invokeService() ;
}
else
{
//	header("content-type: text/plain");
	
	if ( isset($_GET['callback']) ) 
		header("content-type: application/javascript");
	else 
		header("content-type: application/json");
	
	xml2json(invokeService()) ;
	
	
}
?>