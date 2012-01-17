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
					
					echo $data['data'] ;
					
					$db = connectDb() ;
					
					$sql = "UPDATE `users` SET PROFILE = '" . json_encode($data['data']) . "' WHERE ID = '" . $_SESSION['user']['ID']  . "';" ;
					
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
	
	
}

?>