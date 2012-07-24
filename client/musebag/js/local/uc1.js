function localConfig(data) {
	data.visOptions.method = 'classic';
	data.visOptions.thumbOptions.thumbSize = 128;
	data.visOptions.thumbOptions.iconArrange = "list";
	data.visOptions.thumbRender = "audio";

	data.visOptions.filterBar.modalities = {
		"audio": {
			label: "Audio Files"
		}
	};

	data.fileUploadServer = "http://vision.iti.gr/isearch/server/scripts/upload.php";
	data.queryFormulatorUrl = "http://vision.iti.gr/isearch/server/scripts/mqf.php?index=uc1";
	data.userProfileServerUrl = "http://vision.iti.gr/isearch/server/scripts/user.php?mode=Profile&key=";
	data.userLoginServerUrl = "http://vision.iti.gr/isearch/server/scripts/user.php?mode=login";
	data.userLogoutServerUrl = "http://vision.iti.gr/isearch/server/scripts/user.php?mode=logout";
	data.userRegisterServerUrl = "http://vision.iti.gr/isearch/server/scripts/register.php";


	data.tagServerUrl = "http://vision.iti.gr/isearch/server/scripts/user.php?mode=tags&index=uc1";

	data.useOldAuthentication = true;
}
