function localConfig(data)
{
	data.visOptions.method = 'mst';
	data.fileUploadServer =  "http://vision.iti.gr/sotiris/isearch/upload.php"; //"query/item"; 
	data.queryFormulatorUrl = "http://vision.iti.gr/sotiris/isearch/mqf.php?index=uc6"; //"query";  
	data.userProfileServerUrl = "profile/"; 
	data.userLoginServerUrl = "login" ;
	data.tagServerUrl = "http://vision.iti.gr/sotiris/isearch/user.php?mode=tags&index=uc6"; //"pTag/tag" ;
};
