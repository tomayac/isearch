function localConfig(data)
{
	data.visOptions.method = 'classic' ;
	data.fileUploadServer = "http://vision.iti.gr/sotiris/isearch/upload.php" ; //"query/item"; //
	data.queryFormulatorUrl = "http://vision.iti.gr/sotiris/isearch/mqf.php?index=uc6"; //"query"; //"http://vision.iti.gr/sotiris/isearch/client/musebag/mqf.php?index=iaprtc12&cls=3" ;
	data.userProfileServerUrl = "profile/"; //"http://vision.iti.gr/sotiris/isearch/client/musebag/user.php?mode=Profile&key=" ;
	data.userLoginServerUrl = "login" ;
	data.tagServerUrl = "http://vision.iti.gr/sotiris/isearch/client/musebag/user.php?mode=tags&index=iaprtc12" ;
};