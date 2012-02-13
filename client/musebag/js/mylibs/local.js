function localConfig(data)
{
	data.visOptions.method = 'classic' ;
	data.fileUploadServer = "query/item"; //"http://vision.iti.gr/sotiris/isearch/upload.php";
	data.queryFormulatorUrl = "query"; //"http://vision.iti.gr/sotiris/isearch/client/musebag/mqf.php?index=iaprtc12&cls=3"; 
	data.userProfileServerUrl = "profile/"; //"http://vision.iti.gr/sotiris/isearch/client/musebag/user.php?mode=Profile&key=";
	data.userLoginServerUrl = "login" ;
	data.tagServerUrl = "http://vision.iti.gr/sotiris/isearch/client/musebag/user.php?mode=tags&index=iaprtc12" ;
};
