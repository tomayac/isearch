function localConfig(data)
{
	data.visOptions.method = 'cubes';
	data.fileUploadServer =  "query/item"; //"http://vision.iti.gr/isearch/server/scripts/upload.php";
	data.queryFormulatorUrl = "query"; //"http://vision.iti.gr/isearch/server/scripts/mqf.php?index=uc6"; 
	data.userProfileServerUrl = "profile/"; 
	data.userLoginServerUrl = "login" ;
	data.tagServerUrl = "http://vision.iti.gr/isearch/server/scripts/user.php?mode=tags&index=uc6"; //"pTag/tag" ;
};
