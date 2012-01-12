<!doctype html>
<!--[if lt IE 7 ]> <html class="no-js ie6" lang="en"> <![endif]-->
<!--[if IE 7 ]>    <html class="no-js ie7" lang="en"> <![endif]-->
<!--[if IE 8 ]>    <html class="no-js ie8" lang="en"> <![endif]-->
<!--[if (gte IE 9)|!(IE)]><!--> <html class="no-js" lang="en"> <!--<![endif]-->
<head>
  <meta charset="utf-8"/>

  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>

  <title>I-Search Visualisation Demo</title>
  <meta name="description" 
        content="iSearch project is a multi-modal search engine."/>
  <meta name="author" content="iSearch project members"/>
  
  <meta name="HandheldFriendly" content="True"/>
  <meta name="MobileOptimized" content="320"/>

  <meta name="viewport" 
        content="width=device-width, initial-scale=1.0"/>

  <!-- For iPhone 4 with high-resolution Retina display: -->
  <link rel="apple-touch-icon-precomposed" sizes="114x114" href="img/h/apple-touch-icon.png"/>
  <!-- For first-generation iPad: -->
  <link rel="apple-touch-icon-precomposed" sizes="72x72" href="img/m/apple-touch-icon.png"/>
  <!-- For non-Retina iPhone, iPod Touch, and Android 2.1+ devices: -->
  <link rel="apple-touch-icon-precomposed" href="img/l/apple-touch-icon-precomposed.png"/>
  <!-- For nokia devices: -->
  <link rel="shortcut icon" href="img/l/apple-touch-icon.png"/>
  
  <meta name="apple-mobile-web-app-capable" content="yes"/>
  <meta name="apple-mobile-web-app-status-bar-style" content="black"/>
  <link rel="apple-touch-startup-image" href="img/l/splash.png"/>
  
  <!-- Mobile IE allows us to activate ClearType technology for smoothing fonts for easy reading -->
  <meta http-equiv="cleartype" content="on"/>
  <link rel="stylesheet" href="css/style.css?v=2"/>
  <!-- <link rel="stylesheet" href="css/token-input.css"/> -->
  <link rel="stylesheet" href="css/token-input.css"/>
    
  <link rel="stylesheet" href="css/vis.css"/>
  <link rel="stylesheet" href="css/jquery-ui-1.8.14.custom.css"/>
  
 
  <!-- get query parameters from request and put them in global variable -->
  <script>
		var __queryParams = { out: "json", 
<?php
	
	if ( isset($_GET['idx']) ) echo 'index: "' . $_GET['idx'] . '", ' ;
	else echo 'index: "iaprtc12", ' ;
	
	if ( isset($_GET['q']) ) 	echo 'q: "' . $_GET['q']  . '", ' ;
	
	if ( isset($_GET['url']) ) echo 'url: "' . $_GET['url'] . '", ' ;
	
	if ( isset($_GET['tr']) ) echo 'tr: "' . $_GET['tr'] . '", ' ;
	else echo 'tr: "mst", ' ;
	
	if ( isset($_GET['cls']) ) echo 'cls: "' . $_GET['cls'] . '", ' ;
	else echo 'cls: "5,3", ' ;
	
	if ( isset($_GET['total']) ) echo 'total: ' . $_GET['total']  ;
	else echo 'total: 100'
	
?>	
		};
  </script>
</head>

<body>
  <div id="container">
   
     <div id="main" role="main">
	 
	 </div>
   
    <footer>
      &copy; 2011 I-SEARCH Project - All rights reserved
    </footer>
  </div>

  <!--<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.js"></script>
  <script>window.jQuery || document.write("<script src='js/libs/jquery-1.6.2.min.js'>\x3C/script>")</script>
  -->
  
   
  <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=true"></script>
  <script type="text/javascript" src="js/mylibs/local.js"></script>
  <script data-main="js/main" src="js/libs/require-jquery.js"></script>     
  
   
 
  <!--No need for GA right now. But maybe later...who knows?!-->
  <!-- <script> -->
  <!--   var _gaq=[["_setAccount","UA-XXXXX-X"],["_trackPageview"]]; -->
  <!--   (function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];g.async=1; -->
  <!--   g.src=("https:"==location.protocol?"//ssl":"//www")+".google-analytics.com/ga.js"; -->
  <!--   s.parentNode.insertBefore(g,s)}(document,"script")); -->
  <!-- </script> -->

</body>
</html>