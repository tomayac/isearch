<?php

require_once("db.php");

session_start(); 

header('Content-Type: application/json; charset=utf8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, HEAD, PUT") ;
header("Access-Control-Allow-Headers: Origin, Content-Type, Accept") ;

$errors = array();

if ( isset($_GET['mode']) )
{
	if ( $_GET['mode'] == "login" )
	{
		if ( $_SERVER['REQUEST_METHOD'] == "POST" )
		{

			$db = connectDb() ;

			if( isset($HTTP_RAW_POST_DATA) )
			{
				$data = json_decode($HTTP_RAW_POST_DATA, true);
				$username = trim($data["email"]);
				$password = md5(trim($data["pw"]));
				
				$sql = "SELECT ID,EMAIL,PROFILE FROM `users` WHERE EMAIL = '$username' AND PASSWORD = '$password';" ;
		
				$result = mysql_query($sql, $db) ;
			
				if ( mysql_num_rows($result) == 0 )
				{
					echo '{ "error": "Invalid username or password" }' ;
				}
				else
				{
					$row = mysql_fetch_assoc($result);
		
					$_SESSION['user'] = array("ID" => $row['ID'], "Email" => $row["EMAIL"], "Settings" => json_decode($row['PROFILE'], true) ) ;
					
					echo json_encode($_SESSION['user']) ;
				}
			
			}
		}
		else
		{
			session_destroy(); 
		
		}
	}
	else if ( $_GET['mode'] == 'Profile' ) 
	{
		$key = $_GET['key'] ;
			
		if ( $_GET['key'] == 'Settings' ) 
		{
	
			if( isset($HTTP_RAW_POST_DATA) )
			{
				if ( isset($_SESSION['user']) )
				{	
					$data = json_decode( $HTTP_RAW_POST_DATA, true) ;
										
					$_SESSION['user']['Settings'] = $data['data'] ;
					
					$edata = json_encode($data['data']) ;
					
					echo $edata ;
					
					$db = connectDb() ;
					
					$sql = "UPDATE `users` SET PROFILE = '" . $edata . "' WHERE ID = '" . $_SESSION['user']['ID']  . "';" ;
					
					$result = mysql_query($sql, $db) ;
				
				}
			}
			else
			{
				if ( isset($_SESSION['user']) )
				{	
					$profile = $_SESSION['user'] ;
					echo json_encode($profile) ;
				}
				else echo '{ "Settings": "" }' ;
			}
		}
		else {
			if ( isset($_SESSION['user']) ) echo '{"' . $key . '":"' . $_SESSION['user'][$key] . '"}' ;
			else echo '{}' ;
		}
	}
	else if ( $_GET['mode'] == 'tags' )
	{
		$index = $_GET['index'] ;
		
		if ( $_GET['a'] == 'all' )
		{
			$userid = 0 ;
			if ( isset($_SESSION['user']) ) $userid = $_SESSION['user']['ID'] ;
		
			$db = connectDb() ;
					
			$sql = "SELECT * FROM `tags` WHERE USERID = '$userid' AND IDX = '$index' AND DOCID = " ;
		
			$data = json_decode( $_POST['tags'] ) ;
		
			$docs = array() ;
		
			foreach ( $data as $docid )
			{
				$sqls = $sql . "'$docid'" ;
					
				$result = mysql_query($sqls, $db) ;
			
				$row = mysql_fetch_assoc($result) ;
			
				if ( mysql_num_rows($result) == 0 )
					$docs[] = array("id" => $docid, "tags" => array()) ;
				else
				{
					$stags = preg_split("/#/", $row["TAGS"]) ;
				
					$docs[] = array("id" => $docid, "tags" => $stags) ;
				}
			}

			echo json_encode($docs) ;
		}
		else if ( $_GET['a'] == 'store' )
		{
			$userid = 0 ;
			if ( isset($_SESSION['user']) ) $userid = $_SESSION['user']['ID'] ;
		
			$db = connectDb() ;
		
			$docid = $_GET['id'] ;
			$tags = json_decode($_GET['tags']) ;
			
			if ( empty($tags) )
			{
				$sql = "DELETE FROM `tags` WHERE USERID = '$userid' AND IDX = '$index' AND DOCID = '$docid'" ;
				$result = mysql_query($sql, $db) ;
			}
			else
			{
				$stags = mysql_real_escape_string(implode("#", $tags)) ;
				
				$sql = "INSERT INTO `tags` (USERID, IDX, DOCID, TAGS) VALUES ( '$userid', '$index', '$docid', '$stags' ) ON DUPLICATE KEY UPDATE TAGS='$stags';" ;
				$result = mysql_query($sql, $db) ;
			}
				
		
		}
	}

}

?>