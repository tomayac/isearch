function localConfig(data)
{
	data.visOptions.method = 'cubes';
	data.fileUploadServer =  "http://vision.iti.gr/isearch/server/scripts/upload.php"; //"query/item"; 
	data.queryFormulatorUrl = "http://vision.iti.gr/isearch/server/scripts/mqf.php?index=uc6"; //"query";  
	data.userProfileServerUrl = "profile/"; 
	data.userLoginServerUrl = "login" ;
	data.tagServerUrl = "http://vision.iti.gr/isearch/server/scripts/user.php?mode=tags&index=uc6"; //"pTag/tag" ;
};
