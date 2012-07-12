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
          setProfileForm();
          ok = true;
        } else {
          console.error(data.error);
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
  
  var set = function() {
    
    var ok = false;
    if(arguments.length === 1 && arguments[0]) {
      profile = arguments[0];
      ok = true;
    } else {
      var key = arguments[0];
      var value = arguments[1] || false;
      var callback = arguments[2] || false;
      
      if(value) {
        if(!profile[key] || (profile[key] && profile[key] !== value)) {
          profile[key] = value;
          save(key,value,callback);
          ok = true;
        }
      }
    }    
    setProfileForm();
    return ok;
  };
  
  var reset = function() {
    profile = {};
  };
  
  var setProfileForm = function() {
    $.each(profile, function(index, value) {
      $('#' + index).val(value);
    });
    
  };
  
  var setFromForm = function(callback) {
    $("#profile-settings input,#profile-settings select").each(function(){
      if($(this).attr('id')) {
        var key = String($(this).attr('id'));
        set(key,$(this).val(),callback);
      }
    });
  };
  
  var save = function(key,value,callback) {
    console.log('Saving ' + key + ' with value ' + value);
    
    var postData = {
      data : value 
    };
    //Save profile to server
    $.ajax({
      type: "POST",
      url: profileServerUrl + key,
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
          console.log("User profile key saved: " + data.success);
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
    setFromForm  : setFromForm,
    reset        : reset
  };
  
});