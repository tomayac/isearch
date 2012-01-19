<?php 

function createThumbnail($name, $filename, $new_w, $new_h)
{
	$ext = pathinfo($filename, PATHINFO_EXTENSION) ;
	
	$src_img ;
	
	if ( preg_match("/jpg|jpeg/i",$ext)) { $src_img = @imagecreatefromjpeg($name) ; }
	else if ( preg_match("/png/i",$ext) ){ $src_img = @imagecreatefrompng($name); }
	else if ( preg_match("/gif/i",$ext) ){ $src_img = @imagecreatefromgif($name); }
	else return false ;
		
	if ( !$src_img ) return false ;
	
	$old_x = imageSX($src_img) ;
	$old_y = imageSY($src_img) ;
	
	if ( $old_x > $old_y ) 
	{
		$thumb_w = $new_w;
		$thumb_h = $old_y *($new_h/$old_x) ;
	}
	if ( $old_x < $old_y ) 
	{
		$thumb_w=$old_x*($new_w/$old_y);
		$thumb_h=$new_h;
	}
	if ($old_x == $old_y) 
	{
		$thumb_w = $new_w;
		$thumb_h = $new_h;
	}
	$dst_img = imagecreatetruecolor($thumb_w, $thumb_h);
	imagecopyresampled($dst_img, $src_img, 0,0,0,0, $thumb_w,$thumb_h, $old_x, $old_y); 
	
	if ( preg_match("/png/i",$ext) ) imagepng($dst_img, $filename) ; 
	else if ( preg_match("/jpg|jpeg/i", $ext) ) imagejpeg($dst_img, $filename) ; 
	else if ( preg_match("/gif/i", $ext) ) imagegif($dst_img, $filename) ; 
	
	imagedestroy($dst_img) ; 
	imagedestroy($src_img) ; 
	
	return true ;
}


function randomFileName($dir, $prefix, $suffix)
{
    do
	{
        $file =  $prefix . strtoupper(substr(uniqid(mt_rand(), true), 0, 6)) . '.' . $suffix;
		
        $fp = @fopen($dir . $file, 'x');
    }
    while(!$fp);

    fclose($fp);
	unlink($dir . $file) ;
    return $file;
}

function uploadPicture($name, $uploaddir, &$file, &$errors)
{
	$thumbSmall = 64 ;
	$thumbMedium = 96 ;
	$thumbLarge = 128 ;
	
	$fileName = $_FILES[$name]['name'] ;
		
	$ext = pathinfo($_FILES[$name]['name'], PATHINFO_EXTENSION) ;
			
	$tmpfname = randomFileName($uploaddir, "PIC", $ext) ;
		
	if ( !move_uploaded_file($_FILES[$name]['tmp_name'], $uploaddir . 'orig/' . $tmpfname) ||
		 !createThumbnail($uploaddir . 'orig/' . $tmpfname, $uploaddir . 'thumb/' . $tmpfname, $thumbLarge, $thumbLarge )			 )
	{
		$errors['error'] = "Error uploading file" ;
		return false ;
	}

	// delete the old image if any
							
	if ( isset( $file ) ) {
		unlink($uploaddir . 'orig/' . $file ) ;
		unlink($uploaddir . 'thumb/' . $file ) ;
	}
					
	$file = $tmpfname ;
		
	return true ;
		
	
}

function uploadFile($name, $uploaddir, &$file, &$errors)
{
		
	$fileName = $_FILES[$name]['name'] ;
		
	$ext = pathinfo($_FILES[$name]['name'], PATHINFO_EXTENSION) ;
			
	$tmpfname = randomFileName($uploaddir, "MD", $ext) ;
		
	if ( !move_uploaded_file($_FILES[$name]['tmp_name'], $uploaddir . 'orig/' . $tmpfname) 	 )
	{
		$errors['error'] = "Error uploading file" ;
		return false ;
	}

	// delete the old image if any
							
	if ( isset( $file ) ) {
		unlink($uploaddir . 'orig/' . $file ) ;
	}
					
	$file = $tmpfname ;
		
	return true ;
	
}

session_start() ;

header('Content-Type: application/json; charset=utf8');

if( !isset($_SESSION['query']) ) 
{
	$_SESSION['query'] = array( "items" => array() ) ;
}

$localFile = null ;
$errors = array() ;
$uploadurl = "http://vision.iti.gr/sotiris/isearch/" ;
$uploaddir = "tmp/uploads/" ; // local folder to store files 
$fileinfo = null ;

if( isset($_FILES['files']) && !empty($_FILES['files']['name']))  // file upload
{
	$fileName = $_FILES['files']['name'] ;
	
	if ( $_FILES['files']['size'] > 2000000000 ) // file size check
	{
			
		$errors['error'] =  "$fileName: the maximum upload size is set to 2MB!";
		echo json_encode($errors) ;
	}	
	
	if( eregi('image/', $_FILES['files']['type']) ) // if it is a picture
	{
		if ( !uploadPicture("files", $uploaddir, $localFile, $errors)  )
		{
			echo json_encode($errors) ;
		}
		else
		{
			$url = $uploadurl .  $uploaddir . 'orig/' . $localFile ;
			
			// Probably another field is needed for thumbnails or previews.
			$fileInfo = array("type" => $_FILES['files']['type'], "subtype" => "image", 
				"originPath" => $_FILES['files']['name'], "path" => $url ) ;
				
			echo json_encode($fileInfo) ;
			
			$fileInfo['localFileName'] = 'orig/' . $localFile ;
			
			$_SESSION['query']['items'][] = $fileInfo ;
			
		
		}
	
	}	
	else  // another kind of file
	{
		if ( !uploadFile("files", $uploaddir, $localFile, $errors) )
		{
			echo json_encode($errors) ;
		}
		else
		{
			$url = $uploadurl .  $uploaddir . 'orig/' . $localFile ;
			
			$fileInfo = array("type" => $_FILES['files']['type'], "originPath" => $_FILES['files']['name'], "path" => $url ) ;
									
			echo json_encode($fileInfo) ;
			
			$fileInfo['localFileName'] = 'orig/' . $localFile ;
			
			$_SESSION['query']['items'][] = $fileInfo ;
		}		
	
	}
	
}	
else if ( isset($_POST['canvas']) ) // handle inline images from canvas
{
	$sketchData = $_POST['canvas'] ;
	
	$origName = $_POST['name'] ;
	$subtype = $_POST['subtype'] ;
	
	$parts = preg_split("/[,;]/", $sketchData) ; 
	
	$mime = substr($parts[0], 5) ;
	
	$encodedData = str_replace(' ','+',$parts[2]);
  	$img = base64_decode($encodedData) ;
	
	if ( $mime == 'image/png' ) $ext = "png" ;
		
	$tmpfname = randomFileName($uploaddir, "PIC", $ext) ;
	
	file_put_contents($uploaddir . "orig/" . $tmpfname, $img) ;
	
	$url = $uploadurl .  $uploaddir . 'orig/' . $tmpfname ;
	
	$fileInfo = array("type" => $mime, "subtype" => $subtype, "originPath" => $origName, "path" => $url ) ;
			
	echo json_encode($fileInfo) ;
	
	$fileInfo['localFileName'] = 'orig/' . $tmpfname ;
			
	$_SESSION['query']['items'][] = $fileInfo ;
}
	
if ( $fileinfo && $fileinfo['subtype'] == 'image' )
{
	// call low level descriptor extraction
}

?>