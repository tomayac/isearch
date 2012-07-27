/*
 *  User profile data manager
 */
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

define("mylibs/profile", ["libs/modernizr.min"], function(){

  var profile = {};
  var profileServerUrl = 'profile/' ;
  
  var setServerUrl = function(profileUrl) {
    if(profileUrl) {
      profileServerUrl = profileUrl;
    }
  };
  
  var init = function() {
    console.log('Init profile data.');
    var ok = false;
  
 
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
          ok = true;
        } else {
          console.log(data.error);
          //even if we have guest user, let him/her use the setting values stored in the session
          if(data.settings) {
            profile['settings'] = data.settings;
          }
        }
      },
      error: function() {},
      dataType: "text",
      contentType : "application/json; charset=utf-8"
    });
    
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
  
  return {
    setServerUrl : setServerUrl, 
    init         : init,
    get          : get,
    getAll       : getAll,
    set          : set,
    setForm      : setForm,
    setFromForm  : setFromForm,
    reset        : reset
  };
  
});
