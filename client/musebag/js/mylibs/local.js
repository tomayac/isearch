function localConfig(data)
{
	data.visOptions.method = 'classic' ;
	data.fileUploadServer = "http://vision.iti.gr/sotiris/isearch/upload.php" ;
	data.queryFormulatorUrl = "http://vision.iti.gr/sotiris/isearch/client/musebag/mqf.php?index=iaprtc12&cls=3" ;
	data.userProfileServerUrl = "http://vision.iti.gr/sotiris/isearch/client/musebag/user.php?mode=Profile&key=" ;
	data.userLoginServerUrl = "http://vision.iti.gr/sotiris/isearch/client/musebag/user.php?mode=login" ;
	data.tagServerUrl = "http://vision.iti.gr/sotiris/isearch/client/musebag/user.php?mode=tags&index=iaprtc12" ;
}