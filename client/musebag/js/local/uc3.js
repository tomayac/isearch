function localConfig(data)
{
	data.visOptions.method = 'classic' ;
	data.visOptions.filterBar.modalities =  { "image": { label: "Images"}, "3d": { label: "3D models" }  };
	
	data.fileUploadServer      = "http://vision.iti.gr/sotiris/isearch/debug/upload.php" ;
	data.queryUrl              = "http://vision.iti.gr/sotiris/isearch/debug/mqf.php?index=uc3" ;
	
	data.userProfileServerUrl  = "http://vision.iti.gr/sotiris/isearch/debug/user.php?mode=Profile&key=" ;
	data.userLoginServerUrl    = "http://vision.iti.gr/sotiris/isearch/debug/user.php?mode=login" ;
	data.userLogoutServerUrl   = "http://vision.iti.gr/isearch/server/scripts/user.php?mode=logout";
  data.userRegisterServerUrl = "http://vision.iti.gr/isearch/server/scripts/register.php";
	
  data.tagRecomUrl           = "http://vision.iti.gr/isearch/server/scripts/user.php?mode=tags&index=uc3&a=rec";
  data.filterTagUrl          = "http://vision.iti.gr/isearch/server/scripts/user.php?mode=tags&index=uc3&a=all";
  data.storeTagUrl           = "http://vision.iti.gr/isearch/server/scripts/user.php?mode=tags&index=uc3&a=store";
}