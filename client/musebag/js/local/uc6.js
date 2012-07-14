function localConfig(data)
{
	data.visOptions.filterBar.modalities =  { "image": { label: "Images"}, "3d": { label: "3D models" }, "audio": { label: "Audio"}, "video": { label: "Video"}  }
	data.fileUploadServer = "http://vision.iti.gr/sotiris/isearch/debug/upload.php" ;
	data.queryFormulatorUrl = "http://vision.iti.gr/sotiris/isearch/debug/mqf.php?index=uc6" ;
	data.userProfileServerUrl = "http://localhost/isearch/server/scripts/user.php?mode=Profile&key=" ;
	data.userLoginServerUrl = "http://localhost/isearch/server/scripts/user.php?mode=login" ;
	data.userLogoutServerUrl = "http://localhost/isearch/server/scripts/user.php?mode=logout" ;
	data.userRegisterServerUrl = "http://localhost/isearch/server/scripts/register.php" ;
	
	
	data.tagServerUrl = "http://vision.iti.gr/sotiris/isearch/debug/user.php?mode=tags&index=uc6" ;
	//data.visOptions.method = "mst" ;
	data.useOldAuthentication = true ;
}
