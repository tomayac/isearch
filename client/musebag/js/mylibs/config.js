/* 
 * Author: Arnaud Brousseau, Jonas Etzold, Sotiris Malassiotis
 *  
 */
define("mylibs/config", [                     
    "mylibs/profile"
  ],
  function(profile) {
   // private use case translator
   var ucTranslator = {
     'uc1' : 'music',
     'uc3' : 'furniture',
     'uc6' : 'generic'
   };
  
   /**
    * Global configuration, the constants object includes all currently active settings 
    */
    var constants = {
      //Menu parameters
      slideUpAnimationTime: 200,
      slideDownAnimationTime: 200,
      menuWidth: 470, //cf style.css for more explanations
      useOldAuthentication: ( window.useOldAuthentication === true ) ? true : false,

      //Query parameters
  	  queryOptions: {
    		maxNumResults: 100,
    		clusterType: '3D',
    		clusters0: 5,
    		clusters1: 3, 
    		trans: "rand", //Can be "lle" or "rand" 
			  smatrix: true,
			  useCase: 'uc6'
      },

      //Visualization parameters  
  	  visOptions: {
	  	  methods: [ "classic", "tmap",  "htree", "hpanel" ], // this can be adjusted to restrict visualisation options
	      method: "classic", //tmap, htree, hpan, classic or cubes (or mst)
	      thumbOptions: {
  	      thumbSize: 128, //16, 32, 48, 64, 96, 128
		      iconArrange: "grid",
		      iconArrangeMethods: [ "grid", "smart", "smart-grid", "list" ],
  	      navMode: "browse",	
		      navModes: ["feedback", "browse"],
		      feedback: ["tags", "likes"],
		      thumbRenderer: "default",
		      documentPreview: "url" // can be one of  ["none", "popup", "url""]
	      },
    		showFilterPane: true,
    	  filterBar: {
    			  modalities: { 
    			    "image": { label: "Images"}, 
    			    "3d"   : { label: "3D models" }, 
    			    "audio": { label: "Audio"}, 
    			    "video": { label: "Video"} 
    			  } // this is the modalities that the user can switch between, depending on use case.
    			}
    	  }
    };
    
    /**
     * Possible use case configuration objects which can be chosen via URL 
     * i.e. /music, /furniture, /video or /
     */
    var useCaseConfig = {
        'uc1' : {
          queryOptions : {
            clusterType : 'audio',
            useCase: 'uc1'
          },
          visOptions: {
            method: "classic",
            thumbOptions: {
              thumbSize: 64,
              iconArrange: "list",
              iconArrangeMethods: [ "list" ],
              thumbRenderer: "audio"
            },
            filterBar: {
              modalities: {
                "audio": { label: "Audio Files"},
                "image": { label: "Images"}
              } 
            }
          }
        }, //End uc1
        'uc3' : {
          queryOptions : {
            clusterType : '3D',
            useCase: 'uc3'
          },
          visOptions: {
            method: "classic",
            thumbOptions: {
              thumbSize: 96,
              iconArrange: "grid",
              iconArrangeMethods: [ "grid", "smart", "smart-grid", "list" ],
              thumbRenderer: "default"
            },
            filterBar: {
              modalities: {
                "image": { label: "Images"}, 
                "3d"   : { label: "3D models" } 
              } 
            }
          }
        }, //End uc3
        'uc6' : {
          queryOptions : {
            clusterType : '3D',
            useCase: 'uc6'
          },
          visOptions: {
            method: "classic",
            thumbOptions: {
              thumbSize: 128,
              iconArrange: "grid",
              iconArrangeMethods: [ "grid", "smart", "smart-grid", "list" ],
              thumbRenderer: "default"
            },
            filterBar: {
              modalities: { 
                "image": { label: "Images"}, 
                "3d"   : { label: "3D models" }, 
                "audio": { label: "Audio"}, 
                "video": { label: "Video"} 
              }
            } 
          }
        } //End uc6
      };
    
    /**
     * Possible URL configurations depending on a urlSetKey variable defined in the 
     * respective use case index.html
     */
    var useCaseUrls = {
      'local' : {
        // query related URLs
        fileUploadServer     : "query/item",
        queryUrl             : "query",
        // result related URLs
        resultItemUrl         : "result/item",
        // user/profile URLs
        userProfileServerUrl  : "profile/",
        userLoginServerUrl    : "login",
        userLogoutServerUrl   : "login",
        // tagging URLs
        tagRecomUrl           : "ptag/tagRecommendations",
        filterTagUrl          : "ptag/filterTags",
        storeTagUrl           : "ptag/tag",
        storeImplicitTagUrl   : "ptag/implicitTags", 
        // authentication method choice
        useOldAuthentication  : false
      },
      'remote' : {
        fileUploadServer      : "http://vision.iti.gr/isearch/server/scripts/upload.php",
        queryUrl              : "http://vision.iti.gr/isearch/server/scripts/mqf.php?index=[[useCase]]",
        
        userProfileServerUrl  : "http://vision.iti.gr/isearch/server/scripts/user.php?mode=Profile&key=",
        userLoginServerUrl    : "http://vision.iti.gr/isearch/server/scripts/user.php?mode=login",
        userLogoutServerUrl   : "http://vision.iti.gr/isearch/server/scripts/user.php?mode=logout",
        userRegisterServerUrl : "http://vision.iti.gr/isearch/server/scripts/register.php",
      
        tagRecomUrl           : "http://vision.iti.gr/isearch/server/scripts/user.php?mode=tags&index=[[useCase]]&a=rec", 
        filterTagUrl          : "http://vision.iti.gr/isearch/server/scripts/user.php?mode=tags&index=[[useCase]]&a=all",
        storeTagUrl           : "http://vision.iti.gr/isearch/server/scripts/user.php?mode=tags&index=[[useCase]]&a=store",
        useOldAuthentication  : true
      }
    };
    
    //Global set function
    var set = function(key, value) {
      var keys = key.split('.');
      
      if(constants.hasOwnProperty(keys[0])) {
        if(keys.length > 1) {
          constants[keys[0]][keys[1]] = value;
          //eval('constants.' + key + '=\'' + value + '\'');
        } else {
          constants[keys[0]] = value;
        }
        return true;
      } else {
        return false;
      }
    };
    
    var getUseCaseConfig = function(uc,urlSetKey) {
      if(!useCaseConfig[uc]) {
        return false;
      }

      var urlSet = {};
      
      if(!urlSetKey || urlSetKey === 'local') {
        urlSet = useCaseUrls['local'];
      } else if(urlSetKey === 'remote') {
        for (var key in useCaseUrls[urlSetKey]) {
          if (useCaseUrls[urlSetKey].hasOwnProperty(key) && typeof useCaseUrls[urlSetKey][key] === 'string') {
            urlSet[key] = useCaseUrls[urlSetKey][key].replace("[[useCase]]",uc);
          }
        }    
      } 
      return $.extend({},useCaseConfig[uc],urlSet);
    };
    
    var updateConfig = function(uc) {
      // urlSet can be defined in the main use case html file (i.e. index.html)
      // in order to specify if all requests should be send to the local MuseBag server
      // or a remote server which deals as query formulator, tagging and user profile sever:
      // it can contain either "local" or "remote" as possible values.
      var urlSetKey = window.urlSetKey; 
      var newConfig = getUseCaseConfig(uc,urlSetKey);
      if(typeof newConfig === 'object') {
        //Reset modalities before updating it with UC specific config
        constants.visOptions.filterBar.modalities = {}; 
        $.extend(true,constants,newConfig);
        console.dir(constants);
      }
    };
    
    var getURLParameter = function(name) {
      return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    };
    
    var getUrlUseCase = function(url_) {
      //attempt to get use case from document path, name or query parameter
      //define priority:
      //1. url path
      //Sotiris: I have added an extra parameter to parse url from an href string
      var url = url_ || window.location.pathname ;
      var pathArray = url.split( '/' );
      var pathArrayClean = [] ;
      
      // The pathArray may contain empty strings (maybe this is specific to Javascript implementation)
     
      for (var c=0 ; c<pathArray.length ; c++)
      	if ( pathArray[c] != "") pathArrayClean.push(pathArray[c]) ;
      	
      var uc = pathArrayClean[pathArrayClean.length-1];
      //2. document name
      if(uc.lastIndexOf('.html') > -1) {
        uc = ucTranslator[uc.substring(0,uc.lastIndexOf('.html'))];
      }
      //3. query parameter
      if(!uc) {
        uc = ucTranslator[getURLParameter('uc')];
      }
      console.log('set use case to: ' + (uc ? uc : 'generic'));
      return uc ? uc : 'generic';
    };
    
    //Public variables and functions
    return {
      constants     : constants,
      getUrlUseCase : getUrlUseCase,
      updateConfig  : updateConfig,
      set           : set
    };
    
  }
);
  

