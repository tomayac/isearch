define("mylibs/headerMenu", [
    "mylibs/config",
    "mylibs/profile",
    "mylibs/cofind",
    "mylibs/tags",
    "mylibs/loader",
    "libs/jquery.select-to-autocomplete"
  ],
  function(config, profile, cofind, tags, loader) {
    
    //Defines all header menu panels and generic functions to control them
    var panels = {
        messages : $("#messages"),
        settings : $("#global-settings"),
        profile  : $("#profile-settings"),
        login    : $("#login-settings"),
        hide     : function(speed) {
          speed = speed ? speed : 200;
          $('.settings-panel').hide(speed);
          $("#settings ul li").removeClass('active');
        }
    };
    
    //Global message function
    //actionButton is used to add action buttons to messages,
    //where a user should react to a message instead of just noticing it 
    var sendNotifyMessage = function(msg,type,actionButton) {
      //Set defaults
      type = type || 'info';
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
    
    var initSettingsPanel = function() {
     
      //Apply settings stored in current profile to general settings form
      var settings = profile.get('settings');
  
      if(settings) {
        var data = JSON.parse(settings);

        if(data.maxNumResults) {
          config.set('queryOptions.maxNumResults', data.maxNumResults);
        }
        if(data.clusterType) {
          config.set('queryOptions.clusterType', data.clusterType);
        }
        if(data.numClusters) {
          config.set('queryOptions.clusters0', data.numClusters);
        }
        if(data.transMethod) {
          config.set('queryOptions.trans', data.transMethod);
        }
        if(data.useCase) {
          config.set('queryOptions.useCase', data.useCase);
        }
      }
     
      //Initialize the form with the default values
      $("#max-num-results").val(config.constants.queryOptions.maxNumResults);
      
      $("#num-clusters").val(config.constants.queryOptions.clusters0);
      $("#trans-method option[value=" + config.constants.queryOptions.trans + "]").attr('selected','selected');
    };
    
    var performLoggedInSetup = function() {
      
      $("#login-status").html("Hello " + profile.get('email'));
      $("#button-login-settings").find('a:first').text('Profile');
      
      //Embed CoFind to GUI
      var cofindOptions = {
         user            : profile.get('email'), 
         addButtonTo     : '#settings ul li',
         addSettingsTo   : '.settings-panel',
         addWorkspaceTo  : '#container',
         panels          : panels,
         messageCallback : sendNotifyMessage  
      };      
      if (cofind) cofind.setup(cofindOptions);
  
      //get user tags from pTag component
      tags.getUserTags(profile.get('userId'));
      //get user search history
      profile.getHistory(function(history){
        //Create history table
        var historyTable = '<table><tr><th>Query</th><th>Tags</th>Items<th></th></tr>';
        console.dir(history);
        historyTable += '</table>';
      });
      
      //init settings form based on user profile data
      initSettingsPanel();
      
      //Inform the user if he is new to I-SEARCH
      if(profile.get('state') === 'new') {
        console.log("User is new and logged in, ask him/her to provide additional information.");
        var actionHtml = '<button id="profile-new-add">Ok</button>' + 
                         '<button id="profile-new-decline">Not now</button>';
        sendNotifyMessage("Hi " + profile.get('name') + "! You're new here, would you like to complete your profile? ",'info', actionHtml);
        
        $(document).one('click', '#profile-new-add', function(event) {
          $("#messages").stop().hide(200);
          panels.profile.show(200);
          $("#button-login-settings").addClass('active');
          event.stopPropagation();
        });
        $(document).one('click', '#profile-new-decline', function(event) {
          $("#messages").hide(200);
          event.stopPropagation();
        });
      }
      
      loader.stop();
    };
    
    var performLoggedOutSetup = function() {
      
      $("#login-status").html("Hello Guest");
      $("#button-login-settings").find('a:first').text('Login');
      //Clearing query (quite silly to do that - turned off)
      //$("#query-field").tokenInput("clear");
      $(".tags").html('');
      //Remove CoFind from GUI
      if ( cofind ) cofind.remove(profile.get('email'));
      
      profile.reset();
    };
    
    var handleSettingsSave = function() {
      console.log('handleSettingSave...');
      
      var mr = parseInt(panels.settings.find("#max-num-results").val() || config.constants.queryOptions.maxNumResults);
      //var ct = $("#audio-cluster-type").attr('checked') ? 'Audio' : '3D';
      //Not displayed in GUI
      var nc = parseInt(panels.settings.find("#num-clusters").val() || config.constants.queryOptions.clusters0) ;
      var tm = panels.settings.find("#trans-method option:selected").val() || config.constants.queryOptions.trans ;
      
      //config.constants.queryOptions.clusterType   === ct &&
      if(config.constants.queryOptions.maxNumResults === mr &&
         config.constants.queryOptions.clusters0     === nc &&
         config.constants.queryOptions.trans         === tm ){
        return;
      }  
            
      config.set('queryOptions.maxNumResults', mr);
      //config.set('queryOptions.clusterType', ct);
      config.set('queryOptions.cluster0', nc);
      config.set('queryOptions.trans', tm) ;
      
      var settings = {
        "maxNumResults" : mr, 
        //"clusterType" : ct, 
        "numClusters" : nc,
        "transMethod" : tm
      };
    
      profile.set('settings',settings,sendNotifyMessage);
      
      //Notify the user that their action has been successful -- close the panel
      panels.hide();
    };
    
    var handleLogin = function(token) {
      
      var serverURL = config.constants.userLoginServerUrl || "login";        
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
            //console.log(data);
            sendNotifyMessage("You're logged in.",'success',false);
            profile.init(data);
            performLoggedInSetup();
          }
        },
        dataType: "text",
        contentType : "application/json; charset=utf-8"
      });
      
      //Notify the user that their action has been successful -- close the panel
      panels.hide();
    };
    
    var handleLogout = function() {
      var serverURL = config.constants.userLoginServerUrl || "login";       
     
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
  
    var init = function() {
      
      panels.hide();
   
      //Setup profile basically pass the url of the profile server 
      profile.setServerUrl(config.constants.userProfileServerUrl);
      
      //Init the user profile to identify if user is logged in
      if(profile.init()) {
        performLoggedInSetup();
      } else {
        initSettingsPanel();
      }
      
      //Initialize the authentication widget
      //----------------------------------------------------------
      // WARNING - very ugly code - janrain is baaad!
      
      var beautifyJanrain = function() {
        $('#janrainEngageEmbed .janrainContent').attr('style','min-height: 40px');
        $('#janrainEngageEmbed #janrainView').attr('style','');
        $('#janrainEngageEmbed #janrainView .janrainHeader').attr('style','display: none;');
        $('#janrainEngageEmbed #janrainView #janrain-blank').remove();
        $('#janrainEngageEmbed #janrainView #janrainProviderPages').attr('style','margin: 0; padding: 0;');
        $('#janrainEngageEmbed #janrainView #attribution_footer').remove();
        $('#janrainEngageEmbed .janrainContent > div:last:not(#janrainView)').remove();
      };
      
      window.janrainWidgetOnload = function() {
        //Force to format the stupid authentication widget
        beautifyJanrain();
        
        $(document).on('DOMNodeInserted','#janrainEngageEmbed .janrainContent',function() {
          //sendNotifyMessage($('#janrainEngageEmbed .janrainContent > div:last').text(),'info',false);
          beautifyJanrain();
        });
        
        $('#janrainEngageEmbed #janrain-google,#janrainEngageEmbed .providers').on('click', function(event) {
          panels.login.hide(config.constants.slideDownAnimationTime);
        });
        
        janrain.events.onProviderLoginToken.addHandler(function(tokenResponse) {
          //console.log(tokenResponse);
          handleLogin(tokenResponse.token);
        });
      };
      
      //------------------------------------------------------------
      // Header Menu Events
      // for buttons and panels
      //-------------------------------------------------------------
     
      //init profile form modification stuff
      $('#profile-accordion').accordion({ autoHeight: false });
      $('#dateOfBirth').datepicker({ dateFormat: "yy-mm-dd" });
      $('#country').selectToAutocomplete();
      
      //init custom checkbox events
      $('.checkbox').toggle(function() {
        $(this).addClass('checked');
        $(this).find(':checkbox').attr('checked', true);
      }, function() {
        $(this).removeClass('checked');
        $(this).find(':checkbox').attr('checked', false);
      });
    
      $("#button-global-settings").on('click touchstart',function(event){
        if($("#button-global-settings").hasClass('active')) {
          handleSettingsSave();
          panels.settings.hide(config.constants.slideUpAnimationTime);
          $("#button-global-settings").removeClass('active');
        } else {
          panels.hide(config.constants.slideDownAnimationTime);
          panels.settings.show(config.constants.slideDownAnimationTime);
        $("#button-global-settings").addClass('active');
          $("body").one("click", function() {
            panels.hide(config.constants.slideDownAnimationTime);
          });
        }
        event.stopPropagation();
        return false ;
      });
  
      panels.settings.click(function(event) {
        event.stopPropagation();
      });
      
      $("#button-login-settings").on('click touchstart',function(event){
  
        if($("#button-login-settings").find('a:first').text() == 'Login') {
          
          if($("#button-login-settings").hasClass('active')) {
            panels.login.hide(config.constants.slideUpAnimationTime);
            $("#button-login-settings").removeClass('active');
          } else {
            panels.hide(config.constants.slideDownAnimationTime);
            panels.login.show(config.constants.slideDownAnimationTime);
            $("#button-login-settings").addClass('active');
            $("body").one("click", function() {
              panels.hide(config.constants.slideDownAnimationTime);
            });
          }
        } else {
          
          if($("#button-login-settings").hasClass('active')) {
            profile.setFromForm(sendNotifyMessage);
            panels.profile.hide(config.constants.slideDownAnimationTime);
            $("#button-login-settings").removeClass('active');
          } else {
            panels.hide(config.constants.slideDownAnimationTime);
            panels.profile.show(config.constants.slideUpAnimationTime);
            $("#button-login-settings").addClass('active');
            /*$("body").one("click", function() {
              panels.hide(constants.slideDownAnimationTime);
            });*/
          }
        }
        
        event.stopPropagation();
        
        return false ;
      });
      
      //Logout button
      $("#logout").click(function(event) {
        panels.hide(config.constants.slideDownAnimationTime);
        handleLogout();
        event.preventDefault();
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
      
      //login on enter key
      $("#login-settings form").keypress(function(event) {
        if ( event.which == 13 ) {
          event.preventDefault();
          if($("#button-login-settings").hasClass('active')) {
            if (config.constants.useOldAuthentication )
            {
              if(panels.login.find("#email").val().length > 0 || panels.login.find("#pw").val().length > 0) {
                handleLogin();
              } 
            } 
  
            panels.login.hide(config.constants.slideDownAnimationTime);
           
            $("#button-login-settings").removeClass('active');
          }
          return false;
        }
      });
      
      //profile save on enter key
      $("#profile-settings form").keypress(function(event) {
        if ( event.which == 13 ) {
          event.preventDefault();
          if($("#button-login-settings").hasClass('active')) {
            profile.setFromForm(sendNotifyMessage);
            panels.profile.hide(config.constants.slideDownAnimationTime);
            $("#button-login-settings").removeClass('active');
          }
          return false;
        }
      });
  
    }; //End of init()
    
    //Public functions and fields
    return {
      init : init
    };
  
  } //End main function
);