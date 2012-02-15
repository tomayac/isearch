function localConfig(data)
{
	data.visOptions.method = 'classic' ;
	data.visOptions.filterBar.modalities =  { "image": { label: "Images"}, "3d": { label: "3D models" }  }
	data.fileUploadServer = "http://vision.iti.gr/sotiris/isearch/upload.php" ;
	data.queryFormulatorUrl = "http://vision.iti.gr/sotiris/isearch/mqf.php?index=uc3&cls=3" ;
	data.userProfileServerUrl = "http://vision.iti.gr/sotiris/isearch/user.php?mode=Profile&key=" ;
	data.userLoginServerUrl = "http://vision.iti.gr/sotiris/isearch/user.php?mode=login" ;
	data.tagServerUrl = "http://vision.iti.gr/sotiris/isearch/user.php?mode=tags&index=uc3" ;
}