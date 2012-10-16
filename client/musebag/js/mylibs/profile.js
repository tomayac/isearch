/*
 *  User profile data manager
 */
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

define("mylibs/profile", ["mylibs/tags","libs/modernizr.min"], function(tags){

  var profile = {};
  var profileServerUrl = 'profile/' ;
  
  var setServerUrl = function(profileUrl) {
    if(profileUrl) {
      profileServerUrl = profileUrl;
    }
  };
  
  var init = function(profileData) {
    console.log('Init profile data.');
    var ok = false;
  
    if(!profileData) {
      //Get the user data if available      
      $.ajax({
        type: "GET",
        url: profileServerUrl,
        async: false,
        success: function(data) {
          data = JSON.parse(data);
  
          if(!data.error) {
            profile = data;
            setForm(profile);
            
            //If we have login data, store eventually temporarily stored history data in user profile 
            updateHistory({},function(success) { 
              console.log('Search history saved on profile init: ' + success);
            });
            
            ok = true;
          } else {
            console.log(data.error);
            //even if we have guest user, let him/her use the setting values stored in the session
            if(data.settings) {
              profile['settings'] = data.settings;
            }
          }
        },
        error: function() { console.log('Error while checking profile status.'); },
        dataType: "text",
        contentType : "application/json; charset=utf-8"
      });
    } else { 
      profile = profileData;
      setForm(profile);
      ok = true;
    }
    
    //get user tags from pTag component
    tags.setUserTags();
    
    //console.dir(profile);
    return ok;
  } ;
  
  var get = function(key) {
    if(profile[key]) {
      return profile[key];
    } else {
      return false;
    }
  };
  
  var getAll = function() {
    return profile;
  };  
  
  var reset = function() {
    profile = {};
    tags.reset();
  };
  
  var set = function(key,value,callback) {
    if(!key || !value) {
      callback('Missing data to save profile.','error',false);
      return;
    }
    
    var profileItem = {};
    profileItem[key] = value;
    
    save(profileItem, callback); 
  };
  
  var setForm = function(newProfile) {
    $.each(newProfile, function(index, value) {
      $('#' + index).val(value);
    });
  };
  
  var setFromForm = function(callback) {
    
    $("#profile-settings input,#profile-settings select").each(function(){
      if($(this).attr('id')) {
        var key = String($(this).attr('id'));
        profile[key] = $(this).val();
      }
    });
    
    save(profile,callback);
  };
  
  var save = function(profile,callback) {
    console.log('Saving profile data with: ');
    console.dir(profile);
    
    var postData = {
      data : profile 
    };
    //Save profile to server
    $.ajax({
      type: "POST",
      url: profileServerUrl,
      data: JSON.stringify(postData),
      success: function(data) {
        //parse the result
        try {
          data = JSON.parse(data);
        } catch(e) {
          data = {error: "The server gave me an invalid result."};  
        }
        
        if(data.error) {
          console.log("Error during profile save: " + data.error);
          if(typeof callback === 'function') {
            callback('Profile couldn\'t be saved!','error',false);
          }
        } else if(data.info){
          console.log("Rejected because: " + data.info);
        } else {
          console.log("User profile saved: " + data.success);
          if(typeof callback === 'function') {
            callback('Profile saved!','success',false);
          }
        }
      },
      dataType: "text",
      contentType : "application/json; charset=utf-8"
    });
  };
  
  var updateHistory = function(items,callback) {
    
    if(!items) {
      items = {};
    }
    
     var historyServerUrl = profileServerUrl + "history";
     
    //Send it to the server
    $.ajax({
      type: "POST",
      url: historyServerUrl,
      data: JSON.stringify(items),
      success: function(data) {
        //parse the result
        try {
          data = JSON.parse(data);
        } catch(e) {
          data = {error: "The server gave me an invalid result."};
        }
        //check the result
        if(data.error) {
          console.log("Error during save history: " + data.error);
          callback(false);
        } else {
          console.log("History data saved.");
          callback(true);
        }
      },
      dataType: "text",
      contentType : "application/json; charset=utf-8"
    });
  };
  
  //Get user specific search history
  var getHistory = function(callback) {
    var userId = get('userId');     
    
    var historyServerUrl = profileServerUrl + "history";
    
    if(userId) {
      //Ask for user search history
      $.ajax({
        type: "GET",
        url: historyServerUrl,
        success: function(data) {          
          try {
            data = JSON.parse(data);
            if(typeof callback === 'function') {
              callback(data);
            }      
          } catch(e) {
            console.error(e);
          }  
        },
        dataType: "text",
        contentType : "application/json; charset=utf-8"
      });
    }     
  };
  
  return {
    setServerUrl  : setServerUrl, 
    init          : init,
    get           : get,
    getAll        : getAll,
    set           : set,
    setForm       : setForm,
    setFromForm   : setFromForm,
    updateHistory : updateHistory,
    getHistory    : getHistory,
    reset         : reset
  };
  
});
