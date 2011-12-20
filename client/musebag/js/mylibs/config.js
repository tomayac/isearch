define("mylibs/config", ["mylibs/tags", "mylibs/cofind", "!js/mylibs/visualization/DefaultThumbRenderer.js"],
  function(tags,cofind) {
    
    var constants = {
      //Menu parameters
      slideUpAnimationTime: 200,
      slideDownAnimationTime: 200,
      menuWidth: 470, //cf style.css for more explanations

      //Query parameters
      maxNumResults: 100,
      clusters0: 5,
      clusters1: 3, 
      trans: "rand", //Can be "lle" or "rand" 
      outFormat: "out",

      //Visualization parameters  
  	  visOptions: {
    		method: "classic", //tmap, htree, hpan or classic
    		thumbSize: 64, //16, 32, 48, 64, 128
    		iconArrange: "grid",
    		thumbRenderer: new DefaultThumbRenderer
    	}
    };
    
    var panels = {
        messages : null,
        settings : null,
        login : null,
        hide : function(speed) {
          $('.settings-panel').hide(speed);
          $(".settings ul li").removeClass('active');
          /*if(this.settings) {
            this.settings.hide(speed);
            $("#button-global-settings").removeClass('active');
          }
          if(this.login) {
            this.login.hide(speed);
            $("#button-login-settings").removeClass('active');
          }
          if(this.messages) {
            this.messages.hide(speed);
          }*/
        }
    };
    
    //Global set function
    var set = function(key, value) {
      var keys = key.split('.');
      
      if(constants.hasOwnProperty(keys[0])) {
        if(keys.length > 1) {
          eval('constants.' + key + '=\'' + value + '\'');
        } else {
          constants[keys[0]] = value;
        }
        return true;
      } else {
        return false;
      }
    };
    
    //Global message function
    var sendNotifyMessage = function(msg,type) {
      var type = type || 'info';
      var msgHtml = '<p class="' + type + '">' + msg + '</p>';
      panels.messages.html(msgHtml);
      panels.messages.show(constants.slideUpAnimationTime).delay(3000).hide(constants.slideDownAnimationTime);
    }; 
    
    //Get tag recommendations for the user which is logged in
    var getUserTags = function() {
      $.ajax({
        type: "GET",
        url: "profile/ID",
        success: function(data) {
          data = JSON.parse(data);

          if(!data.error) {
            
            //Ask for tag recommendations
            $.ajax({
              type: "GET",
              url: "ptag/tagRecommendations?userID=" + data.ID,
              success: function(data) {
                data = JSON.parse(data);

                var html = '';
                console.log(data);
                for(var t=0; t < data.length; t++) {
                  html += '<a href="#" data-rank="' + data[t][1] + '">' + data[t][0] + '</a>';
                }
                  
                $(".tags").html(html);
                
                //Initializes the tagging system
                tags.init();
                //Get tokens and load them as auto suggestions for the user
                var tokens = tags.getTokens();
                $(".token-input-list-isearch").remove();
                $("#query-field").tokenInput("clear");
                $("#query-field").tokenInput('init',tokens, {theme: "isearch", preventDuplicates:true});
                
              },
              dataType: "text",
              contentType : "application/json; charset=utf-8"
            });
            
          } // end if data.error
        },
        dataType: "text",
        contentType : "application/json; charset=utf-8"
      });
    };
    
    var initSettings = function() {
      
      var setForm = function() {
        //Initialize the form with the default values
        panels.settings.find("#max-num-results")
            .val(constants.maxNumResults);
        panels.settings.find("#icon-size option[value=" + constants.visOptions.thumbSize + "]")
            .attr('selected','selected');
        panels.settings.find("#visualization-method option[value=" + constants.visOptions.method + "]")
            .attr('selected','selected');
      };
      
      $.ajax({
        type: "GET",
        url: "profile/Settings",
        success: function(data) {
          data = JSON.parse(data);
          if(data.Settings) {
            data = JSON.parse(data.Settings);
  
            if(data.maxResults) {
              set('maxNumResults', data.maxResults);
              panels.settings.find("#max-num-results")
                .val(data.maxResults);
            }
            if(data.thumbSize) {
              set('visOptions.thumbSize', data.thumbSize);
              panels.settings.find("#icon-size option[value=" + data.thumbSize + "]")
                .attr('selected','selected');
            }
            if(data.method) {
              set('visOptions.method', data.method);
              panels.settings.find("#visualization-method option[value=" + data.method + "]")
                .attr('selected','selected');
            }
          }
        },
        error: function(error) {
          console.log('Setting connect error: ' + error);
          setForm();
        },
        dataType: "text",
        contentType : "application/json; charset=utf-8"
      });
    };
    
    var performLoggedInSetup = function(data) {
      $("#login-status").html("Hello " + data.Email);
      $("#button-login-settings").find('a:first').text('Logout');
      var cofindOptions = {
         addButtonTo   : '#settings ul li',
         addSettingsTo : '.settings-panel',
         addWorkspaceTo: '#container'
         
      };
      cofind.setup(cofindOptions);
      getUserTags();
    };
    
    var performLoggedOutSetup = function() {
      $("#login-status").html("Hello Guest");
      $("#button-login-settings").find('a:first').text('Login');
      //Clearing tags
      $("#query-field").tokenInput("clear");
      $(".tags").html('');
      cofind.remove();
    };
    
    var handleSettingsSave = function() {
      console.log('save setting');
      var mr = parseInt(panels.settings.find("#max-num-results").val());
      var ts = parseInt(panels.settings.find("#icon-size option:selected").val());
      var vm = panels.settings.find("#visualization-method option:selected").val();
      console.log(constants.maxNumResults + ' - ' + mr);
      console.log(constants.visOptions.thumbSize + ' - ' + ts);
      console.log(constants.visOptions.method + ' - ' + vm);
      if(constants.maxNumResults == mr &&
         constants.visOptions.thumbSize == ts &&
         constants.visOptions.method === vm) 
      {
        return;
      }  
      console.log('its not the same');
      set('maxNumResults', mr);
      set('visOptions.thumbSize', ts);
      set('visOptions.method', vm);
      
      var postData = {
          data : '{"maxResults" : ' + mr + ', "thumbSize" : ' + ts + ', "method" : "' + vm + '"}'
      };
      
      //Send it to the server
      $.ajax({
        type: "POST",
        url: "profile/Settings",
        data: JSON.stringify(postData),
        success: function(data) {
          //parse the result
          try {
            data = JSON.parse(data);
          } catch(e) {
            data = {error: "The server gave me an invalid result."};  
          }
          
          if(data.error) {
            console.log("Error during save settings: " + data.error);
          } else {
            console.log("User settings saved: " + (data.success ? data.success : data.info));
            sendNotifyMessage('Settings saved!', (data.success ? 'success' : 'info'));
          }
        },
        dataType: "text",
        contentType : "application/json; charset=utf-8"
      });

      //Notify the user that their action has been successful -- close the panel
      panels.hide(constants.slideDownAnimationTime);
    };
    
    var handleLogin = function() {
      
      var serverURL = "login";        
      var postData = {email: panels.login.find("#email").val() || '',
                         pw: panels.login.find("#pw").val()    || ''};
      
      //Send it to the server
      $.ajax({
        type: "POST",
        url: serverURL,
        data: JSON.stringify(postData),
        success: function(data) {
          //parse the result
          try {
            data = JSON.parse(data);
          } catch(e) {
            data = {error: "The server gave me an invalid result."};  
          }
          
          if(data.error) {
            console.log("Error during login: " + data.error); 
            sendNotifyMessage("Sorry: " + data.error,'error');
          } else {
            console.log("User logged in: " + data);
            sendNotifyMessage("You're logged in.",'success');
            performLoggedInSetup(data);
          }
        },
        dataType: "text",
        contentType : "application/json; charset=utf-8"
      });
      
      //Notify the user that their action has been successful -- close the panel
      panels.hide(constants.slideDownAnimationTime);
    };
    
    var handleLogout = function() {
      var serverURL = "login";    
      
      //Send it to the server
      $.ajax({
        type: "DELETE",
        url: serverURL,
        success: function(data) {
            if(!data.error) { 
              console.log("User logged out");
              //inform the User that he is logged out
              sendNotifyMessage('You\'re logged out.', 'success');
              performLoggedOutSetup();
            } else {
              alert("Something went wrong: " + data.error);
            }
        },
        dataType: "text",
        contentType : "application/json; charset=utf-8"
      });
    };

    var initPanel = function() {
      
      initSettings();
      
      panels.messages = $("#messages");
      
      panels.settings = $("#global-settings");
      panels.settings.hide();
      $("#button-global-settings").click(function(){
        if($("#button-global-settings").hasClass('active')) {
          handleSettingsSave();
          panels.settings.hide(constants.slideDownAnimationTime);
          $("#button-global-settings").removeClass('active');
        } else {
          panels.hide(constants.slideDownAnimationTime);
          panels.settings.show(constants.slideUpAnimationTime);
          $("#button-global-settings").addClass('active');
          $("body").one("click", function() {
            panels.settings.hide(constants.slideDownAnimationTime);
          });
        }
      });
      
      panels.login = $("#login-settings");
      panels.login.hide();
      $("#button-login-settings").click(function(){
        if($("#button-login-settings").find('a:first').text() == 'Login') {
          if($("#button-login-settings").hasClass('active')) {
            if(panels.login.find("#email").val().length > 0 || panels.login.find("#pw").val().length > 0) {
              handleLogin();
            } else {
              panels.login.hide(constants.slideDownAnimationTime);
            }
            $("#button-login-settings").removeClass('active');
          } else {
            panels.hide(constants.slideDownAnimationTime);
            panels.login.show(constants.slideUpAnimationTime);
            $("#button-login-settings").addClass('active');
            $("body").one("click", function() {
              panels.login.hide(constants.slideDownAnimationTime);
            });
          }
        } else {
          handleLogout();
          $("#button-login-settings").removeClass('active');
        }
      });

      //Listen to keypress click to change settings
      $("#global-settings form").keypress(function(event) {
        if ( event.which == 13 ) {
          event.preventDefault();
          handleSettingsSave();
          return false;
        }
      });
      
      $("#login-settings form").keypress(function(event) {
        if ( event.which == 13 ) {
          event.preventDefault();
          if($("#button-login-settings").hasClass('active')) {
            if(panels.login.find("#email").val().length > 0 || panels.login.find("#pw").val().length > 0) {
              handleLogin();
            } else {
              panels.login.hide(constants.slideDownAnimationTime);
            }
            $("#button-login-settings").removeClass('active');
          }
          return false;
        }
      });
      
      //Get the user name if available
      $.ajax({
    	  type: "GET",
    	  url: "profile/Email",
    	  success: function(data) {
      		data = JSON.parse(data);

      		if(!data.error) {
      		  performLoggedInSetup(data);
      		}
    	  },
    	  dataType: "text",
    	  contentType : "application/json; charset=utf-8"
      });

    }; //End of initPanel()   
    
    
    //Public variables and functions
    return {
      constants: constants,
      panels : panels,
      set: set,
      sendNotifyMessage : sendNotifyMessage,
      initPanel: initPanel
    };
    
  }
);
  

