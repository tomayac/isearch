/*
 *  User profile data manager
 */
define("mylibs/profile", ["libs/modernizr.min"], function(){

  var profile = {};
  var profileServerUrl = 'profile/' ;
  
  var getAll = function() {
    return profile;
  };
  
  var init = function(options) {
    profileServerUrl = options.userProfileServerUrl || "profile/" ;
  } ;
  
  var get = function(key) {
    if(profile[key]) {
      return profile[key];
    } else {
      console.log('Profile key "' + key + '" does not exist...get it');
      //Get the user data if available		  
      $.ajax({
        type: "GET",
        url: profileServerUrl + key,
        async: false,
        success: function(data) {
          data = JSON.parse(data);

          if(!data.error) {
            set(key,data[key]);
          }
        },
        error: function() {
          
        },
        dataType: "text",
        contentType : "application/json; charset=utf-8"
      });
      
      if(profile[key]) {
        return profile[key];
      } else {
        return false;
      }
    }
  };
  
  var set = function() {
    
    if(arguments.length === 1 && arguments[0] && typeof(arguments[0]) === 'object') {
      profile = arguments[0];
      return true;
    } else {
      var key = arguments[0];
      var value = arguments[1] || false;
      
      if(value) {
        profile[key] = value;
        return true;
      } else {
        return false;
      }
    }
  };
  
  var reset = function() {
    profile = {};
  };
  
  return {
    init  : init,
    get   : get,
    getAll: getAll,
    set   : set,
    reset : reset
  };
  
});