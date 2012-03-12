function localConfig(data)
{
	data.visOptions.method = 'classic' ;
	data.visOptions.filterBar.modalities =  { "audio": { label: "Audio Files" }  }
	data.fileUploadServer = "http://vision.iti.gr/sotiris/isearch/debug/upload.php" ;
	data.queryFormulatorUrl = "http://vision.iti.gr/sotiris/isearch/debug/mqf.php?index=uc1&cls=3" ;
	data.userProfileServerUrl = "http://vision.iti.gr/sotiris/isearch/debug/user.php?mode=Profile&key=" ;
	data.userLoginServerUrl = "http://vision.iti.gr/sotiris/isearch/debug/user.php?mode=login" ;
	data.tagServerUrl = "http://vision.iti.gr/sotiris/isearch/debug/user.php?mode=tags&index=uc1" ;
}