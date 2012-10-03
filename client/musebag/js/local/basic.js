function localConfig(data)
{
  //Use Case Constant - defines which data set to use for the query
  data.queryOptions.useCase = 'uc6';
  
	data.visOptions.method    = 'classic';
	
	data.fileUploadServer     = "query/item";
  data.queryUrl             = "query";
  
  data.resultItemUrl        = "result/item";
  
  data.userProfileServerUrl = "profile";
  data.userLoginServerUrl   = "login";
  data.userLogoutServerUrl  = "login";
  
  data.tagRecomUrl          = "ptag/tagRecommendations";
  data.filterTagUrl         = "ptag/filterTags";
  data.storeTagUrl          = "ptag/tag";
  data.storeImplicitTagUrl  = "ptag/implicitTags";
  
};
