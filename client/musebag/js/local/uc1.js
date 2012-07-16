function localConfig(data)
{
	data.visOptions.method = 'classic' ;
	data.visOptions.thumbOptions.thumbSize = 128 ;
	data.visOptions.thumbOptions.iconArrange = "list" ;
	
	data.visOptions.filterBar.modalities =  { "audio": { label: "Audio Files" }  }
	data.queryFormulatorUrl = "http://localhost/isearch/server/scripts/mqf.php?index=uc1" ;
	data.userProfileServerUrl = "http://localhost/isearch/server/scripts/user.php?mode=Profile&key=" ;
	data.userLoginServerUrl = "http://localhost/isearch/server/scripts/user.php?mode=login" ;
	data.userLogoutServerUrl = "http://localhost/isearch/server/scripts/user.php?mode=logout" ;
	data.userRegisterServerUrl = "http://localhost/isearch/server/scripts/register.php" ;
	
	
	data.tagServerUrl = "http://localhost/isearch/server/scripts/user.php?mode=tags&index=uc1" ;

	data.useOldAuthentication = true ;
}
