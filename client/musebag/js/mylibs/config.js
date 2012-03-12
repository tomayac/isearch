//  define("mylibs/config", ["mylibs/tags", "mylibs/cofind", "mylibs/profile", "!js/mylibs/visualization/DefaultThumbRenderer.js"],
//  function(tags, cofind, profile) {
    
define("mylibs/config", ["mylibs/tags", "mylibs/profile", "!js/mylibs/visualization/DefaultThumbRenderer.js"],
  function(tags, profile) {

    var constants = {
      //Menu parameters
      slideUpAnimationTime: 200,
      slideDownAnimationTime: 200,
      menuWidth: 470, //cf style.css for more explanations

      //Query parameters
  	  queryOptions: {
    		maxNumResults: 100,
    		clusters0: 5,
    		clusters1: 3, 
    		trans: "rand" //Can be "lle" or "rand" 
      },

      //Visualization parameters  
  	  visOptions: {
  	    method: "classic", //tmap, htree, hpan, classic or cubes
  	    thumbOptions: {
  	      thumbSize: 64, //16, 32, 48, 64
  	      iconArrange: "grid",
  	      navMode: "browse",
  	      thumbRenderer: new DefaultThumbRenderer()
  			},
  			showFilterPane: true,
  			filterBar: {
  			  modalities: { "image": { label: "Images"}, "3d": { label: "3D models" }  } // this is the modalities that the user can switch between, depending on use case.
  			}
  	  }
    };
    
    var panels = {
        messages : null,
        settings : null,
        login : null,
        hide : function(speed) {
          $('.settings-panel').hide(speed);
          $("#settings ul li").removeClass('active');
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
    //actionButton is used to add action buttons to messages,
    //where a user should react to a message instead of just noticing it 
    var sendNotifyMessage = function(msg,type,actionButton) {
      //Set defaults
      var type = type || 'info';
      var time = msg.length > 45 ? 3000 : 2000;
      var modal = false;
      var msgHtml = '<p class="' + type + '">' + msg + '</p>';
      //Check for customizations
      if(actionButton) {
        modal = true;
        msgHtml += actionButton;
      }
      //Make message visible
      $("#messages").html(msgHtml);
      //Set its appearance time
      if(!modal) {
        $("#messages").show(200).delay(time).hide(200);
      } else {
        $("#messages").show(200);
      }
    }; 
    
    //Get tag recommendations for the user which is logged in
    var getUserTags = function() {
      
      var userId = profile.get('ID');
      
      if(userId) {
        //Ask for tag recommendations
        $.ajax({
          type: "GET",
          url: "ptag/tagRecommendations?userId=" + userId,
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
            $("#query-field").tokenInput('init',tokens, {theme: "isearch", preventDuplicates: true} );
            
          },
          dataType: "text",
          contentType : "application/json; charset=utf-8"
        });
      }
    };
    
    var initSettings = function() {
      
      // initialize settings from local configuration if any 
      if(localConfig) {
        if(typeof(localConfig) === "function") {
          localConfig(constants);
        }
      }
        
    	// This should be updated. Visualisation options do not need to be in the setup menu. Only serialize/desierialize the constants.visOptions object
    	// to the user profile. The settings menu should contain query specific options such as the number of results, the type of clustering algorithm to 
    	// apply, the transformation algorithm, the number of clusters ...
  	
      var setForm = function() {
        //Initialize the form with the default values
        panels.settings.find("#max-num-results")
            .val(constants.queryOptions.maxNumResults);
  /*			
          panels.settings.find("#icon-size option[value=" + constants.visOptions.thumbOptions.thumbSize + "]")
              .attr('selected','selected');
          panels.settings.find("#visualization-method option[value=" + constants.visOptions.method + "]")
              .attr('selected','selected');
  */			
      };
      
	  var profileSettingsUrl = constants.userProfileServerUrl || "profile/" ;
	  profileSettingsUrl += "Settings" ;
	  
      $.ajax({
        type: "GET",
        url: profileSettingsUrl,
        success: function(data) {
          data = JSON.parse(data);
          if(data.Settings) {
            data = JSON.parse(data.Settings);
  
            if(data.maxResults) {
              set('maxNumResults', data.maxResults);
              panels.settings.find("#max-num-results").val(data.maxResults);
            }
			
			/*
            if(data.thumbSize) {
              set('visOptions.thumbOptions.thumbSize', data.thumbSize);
              panels.settings.find("#icon-size option[value=" + data.thumbSize + "]").attr('selected','selected');
            }
            if(data.method) {
              set('visOptions.method', data.method);
              panels.settings.find("#visualization-method option[value=" + data.method + "]").attr('selected','selected');
            }
			*/
          } else {
            //store the basic settings in the session initially if there is no setting data
            handleSettingsSave(true);
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
    
    var performLoggedInSetup = function() {
      
      if(arguments.length == 1) {
        //Set profile
        profile.set(arguments[0]);
      } 
      
      $("#login-status").html("Hello " + profile.get('Name'));
      $("#button-login-settings").find('a:first').text('Logout');
      var cofindOptions = {
         user            : profile.get('Email'), 
         addButtonTo     : '#settings ul li',
         addSettingsTo   : '.settings-panel',
         addWorkspaceTo  : '#container',
         panels          : panels,
         messageCallback : sendNotifyMessage  
      };      
      cofind.setup(cofindOptions);
      
      getUserTags();
    };
    
    var performLoggedOutSetup = function() {
      
      $("#login-status").html("Hello Guest");
      $("#button-login-settings").find('a:first').text('Login');
      //Clearing query (quite silly to do that - turned off)
      //$("#query-field").tokenInput("clear");
      $(".tags").html('');
      cofind.remove(profile.get('Email'));
      
      profile.reset();
    };
    
    var handleSettingsSave = function(overwrite) {
      
      var ow = overwrite || false;
      
      var mr = parseInt(panels.settings.find("#max-num-results").val());
    
      /*
	    var ts = parseInt(panels.settings.find("#icon-size option:selected").val());
      var vm = panels.settings.find("#visualization-method option:selected").val();
      var ct = panels.settings.find("#audio-cluster-type").val() !== undefined ? 'audio' : '3D';

      if(constants.maxNumResults == mr &&
         constants.visOptions.thumbOptions.thumbSize == ts &&
         constants.visOptions.method === vm &&
         constants.clusterType === ct &&
         !ow) 
      {
        return;
      }  
	    */
      if ( constants.queryOptions.maxNumResults == mr ) return ;
	  
      set('queryOptions.maxNumResults', mr);
      //set('visOptions.thumbOptions.thumbSize', ts);
      //set('visOptions.method', vm);
      //set('clusterType', ct);
      
      var postData = {
          data : {"maxResults" :  mr /*, "clusterType" : ct , "thumbSize" : ts , "method" : vm */ }
      };
      
  	  var profileSettingsUrl = constants.userProfileServerUrl || "profile/" ;
  	  profileSettingsUrl += "Settings" ;
	  
      //Send it to the server
      $.ajax({
        type: "POST",
        url: profileSettingsUrl,
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
            sendNotifyMessage('Settings saved!', (data.success ? 'success' : 'info'), false);
          }
        },
        dataType: "text",
        contentType : "application/json; charset=utf-8"
      });

      //Notify the user that their action has been successful -- close the panel
      panels.hide(constants.slideDownAnimationTime);
    };
    
    var handleLogin = function(token) {
      
      var serverURL = constants.userLoginServerUrl || "login";        
	    
      /*
      var postData = {email: panels.login.find("#email").val() || '',
                         pw: panels.login.find("#pw").val()    || ''};
      */
      var postData = {token: token};
      
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
            sendNotifyMessage("Sorry: " + data.error,'error',false);
          } else {
            sendNotifyMessage("You're logged in.",'success',false);
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
       var serverURL = constants.userLoginServerUrl || "login";       
	   
      //Send it to the server
      $.ajax({
        type: "DELETE",
        url: serverURL,
        data: '{}',
        success: function(data) {
            if(!data.error) { 
              console.log("User logged out");
              //inform the User that he is logged out
              sendNotifyMessage('You\'re logged out.', 'success', false);
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
  	  
  	  // basically pass the url of the profile server 
  	  profile.init(constants) ;
  	  
  	  //init custom checkbox events
  	  $('.checkbox').toggle(function() {
  	    $(this).addClass('checked');
  	    $(this).find(':checkbox').attr('checked', true);
  	  }, function() {
  	    $(this).removeClass('checked');
  	    $(this).find(':checkbox').attr('checked', false);
  	  });
  	  
      panels.messages = $("#messages");
      
      panels.settings = $("#global-settings");
      panels.settings.hide();
      $("#button-global-settings").click(function(event){
        if($("#button-global-settings").hasClass('active')) {
          handleSettingsSave();
          panels.settings.hide(constants.slideDownAnimationTime);
          $("#button-global-settings").removeClass('active');
        } else {
          panels.hide(constants.slideDownAnimationTime);
          panels.settings.show(constants.slideUpAnimationTime);
          $("#button-global-settings").addClass('active');
          $("body").one("click", function() {
            panels.hide(constants.slideDownAnimationTime);
          });
        }
        event.stopPropagation();
      });
      panels.settings.click(function(event) {
        event.stopPropagation();
      });
      
      //Initialize the authentication widget
      //----------------------------------------------------------
      // WARNING - very ugly code - janrain is baaad!
      window.janrainWidgetOnload = function() {
        //Force to format the stupid authentication widget
        $('#janrainEngageEmbed .janrainContent').attr('style','min-height: 40px');
        $('#janrainEngageEmbed #janrainView').attr('style','position: absolute; top: 15px; left: 0px; width: 100%; z-index: 103; text-align: center; padding: 5px; background-color: #666; min-height: 50px;');
        $('#janrainEngageEmbed #janrainView .janrainHeader').text('Use your account with:');
        $('#janrainEngageEmbed #janrainView .janrainHeader').attr('style','display: inline-block; height: 15px; margin: 0 0.5em 0 0; padding: 1.0em 0.8em; vertical-align: top; background-color: #999; border-top-left-radius: 4px; border-bottom-left-radius: 4px;');
        $('#janrainEngageEmbed #janrainView #janrainProviderPages').attr('style','display:inline-block; vertical-align: middle');
        $('#janrainEngageEmbed #janrainView #janrainProviderPages ul').attr('style','margin: 0; padding: 0;');
        $('#janrainEngageEmbed #janrainView #janrainProviderPages ul li').attr('style','list-style-type: none;position: relative; height: 34px; padding-top: 0.5em; margin-bottom: 4px; left: 0px; border: 1px solid rgb(204, 204, 204); color: rgb(28, 105, 245); border-top-right-radius: 5px; border-bottom-right-radius: 5px; cursor: pointer; display: inline-block; width: 200px; vertical-align: top; background-color: rgb(227, 227, 227); background-image: -webkit-linear-gradient(bottom, rgb(238, 238, 238), rgb(255, 255, 255));');
        $('#janrainEngageEmbed #janrainView div:nth-child(3)').remove();
        $('#janrainEngageEmbed #janrainView div:nth-child(4)').remove();
        
        if($('#janrainEngageEmbed .janrainContent > div:last').attr('id') !== 'janrainView' ) {
          $('#janrainEngageEmbed .janrainContent > div:last').attr('style','position: absolute; top: 15px; left: 0px; width: 100%; z-index: 102; text-align: center; padding: 5px; background-color: transparent; min-height: 40px;');
          $('#janrainEngageEmbed .janrainContent > div:last img').attr('style','width:100px; height:35px; margin: 0 0.5em 0 0; padding: 0.3em 0.5em; background-color: #999; border-top-left-radius: 4px; border-bottom-left-radius: 4px;');
          $('#janrainEngageEmbed .janrainContent > div:last').children('div:first').attr('style','position: relative; height: 39px; margin-bottom: 4px; left: 0px; border: 1px solid rgb(204, 204, 204); color: rgb(28, 105, 245); border-top-right-radius: 5px; border-bottom-right-radius: 5px; cursor: pointer; display: inline-block; width: 200px; vertical-align: top; background-color: rgb(227, 227, 227); background-image: -webkit-linear-gradient(bottom, rgb(238, 238, 238), rgb(255, 255, 255));');
          $('#janrainEngageEmbed .janrainContent > div:last').children('div:first').children(':first').attr('style','position: relative; top: 12px; font-size: 110%; float: none;');
          $('#janrainEngageEmbed .janrainContent > div:last a').attr('style','font-size: 12px; color: #fff; display: inline-block; margin-left: 15px; vertical-align: 100%');
        }
        
        $(document).on('DOMNodeInserted','#janrainEngageEmbed .janrainContent',function() {
          sendNotifyMessage($('#janrainEngageEmbed .janrainContent > div:last').text(),'info',false);
          $('#janrainEngageEmbed .janrainContent > div:last').remove();
        });
        
        $('#janrainEngageEmbed #janrain-google,#janrainEngageEmbed .providers').on('click', function(event) {
          panels.login.hide(constants.slideDownAnimationTime);
        });
        
        janrain.events.onProviderLoginToken.addHandler(function(tokenResponse) {
          console.log(tokenResponse);
          handleLogin(tokenResponse.token);
        });
      };
      //----------------------------------------------------------
      
      
      panels.login = $("#login-settings");
      panels.login.hide();
      $("#button-login-settings").click(function(event){
        if($("#button-login-settings").find('a:first').text() == 'Login') {
          if($("#button-login-settings").hasClass('active')) {
            /*if(panels.login.find("#email").val().length > 0 || panels.login.find("#pw").val().length > 0) {
              handleLogin();
            } else {
              panels.login.hide(constants.slideDownAnimationTime);
            }*/
            panels.login.hide(constants.slideDownAnimationTime);
            $("#button-login-settings").removeClass('active');
          } else {
            panels.hide(constants.slideDownAnimationTime);
            panels.login.show(constants.slideUpAnimationTime);
            $("#button-login-settings").addClass('active');
            $("body").one("click", function() {
              panels.hide(constants.slideDownAnimationTime);
            });
          }
        } else {
          handleLogout();
          $("#button-login-settings").removeClass('active');
        }
        event.stopPropagation();
      });
      panels.login.click(function(event) {
        event.preventDefault();
        event.stopPropagation();
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
      
      //Get the user email to identify if user is logged in
      if(profile.get('Email')) {
        performLoggedInSetup();
      };

    }; //End of initPanel()   
    
    
    //Public variables and functions
    return {
      constants : constants,
      set: set,
      initPanel: initPanel
    };
    
  }
);
  

