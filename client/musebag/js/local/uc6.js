function localConfig(data)
{
	data.visOptions.method = 'classic';
	data.visOptions.thumbOptions.thumbSize = 96;
	data.visOptions.thumbOptions.iconArrange = "grid";
	data.visOptions.thumbOptions.thumbRenderer = "default" ;

	data.visOptions.filterBar.modalities =  
	{ "image": { label: "Images"}, "3d": { label: "3D models" }, "audio": { label: "Audio"}, "video": { label: "Video"}  }	;

	data.fileUploadServer      = "http://vision.iti.gr/isearch/server/scripts/upload.php";
	data.queryUrl              = "http://vision.iti.gr/isearch/server/scripts/mqf.php?index=uc6";
	//queryUrl = "http://vision.iti.gr/isearch/server/scripts/proxy.php?index=uc6&t=" + Math.floor(Math.random()*83483) ; 
	
	data.userProfileServerUrl  = "http://vision.iti.gr/sotiris/isearch/debug/user.php?mode=Profile&key=" ;
  data.userLoginServerUrl    = "http://vision.iti.gr/sotiris/isearch/debug/user.php?mode=login" ;
  data.userLogoutServerUrl   = "http://vision.iti.gr/isearch/server/scripts/user.php?mode=logout";
  data.userRegisterServerUrl = "http://vision.iti.gr/isearch/server/scripts/register.php";
	
  data.tagRecomUrl           = "http://vision.iti.gr/isearch/server/scripts/user.php?mode=tags&index=uc6&a=rec";
  data.filterTagUrl          = "http://vision.iti.gr/isearch/server/scripts/user.php?mode=tags&index=uc1&a=all";
  data.storeTagUrl           = "http://vision.iti.gr/isearch/server/scripts/user.php?mode=tags&index=uc1&a=store";

	data.useOldAuthentication = true;
}
