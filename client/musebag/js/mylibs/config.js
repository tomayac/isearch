//  define("mylibs/config", ["mylibs/tags", "mylibs/profile", "!js/mylibs/visualization/DefaultThumbRenderer.js", "libs/jquery.select-to-autocomplete"],
//  function(tags, profile, cofind) {
    
define("mylibs/config", [
    "mylibs/profile"
  ],
  function(cofind, profile) {

    var constants = {
      //Menu parameters
      slideUpAnimationTime: 200,
      slideDownAnimationTime: 200,
      menuWidth: 470, //cf style.css for more explanations
      useOldAuthentication: false,

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
    
    var getURLParameter = function(name) {
      return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    };
    
    //initialize settings from local configuration if any 
    if(localConfig) {
      if(typeof(localConfig) === "function") {
        localConfig(constants);
      }
    } 
    
    //Public variables and functions
    return {
      constants : constants,
      getURLParameter : getURLParameter,
      set: set
    };
    
  }
);
  

