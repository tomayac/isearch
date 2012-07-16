//  define("mylibs/config", ["mylibs/tags", "mylibs/profile", "!js/mylibs/visualization/DefaultThumbRenderer.js", "libs/jquery.select-to-autocomplete"],
//  function(tags, profile, cofind) {
    
define("mylibs/config", 
  [
    "mylibs/tags", 
    "mylibs/cofind",
    "mylibs/profile", 
    "libs/jquery.select-to-autocomplete"
  ],
  function(tags, cofind, profile) {

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
    		trans: "rand",
			  smatrix: true //Can be "lle" or "rand" 
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
  		      thumbRenderer: "audio"
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
        profile : null,
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
    
    //Get user specific search history
    var getUserHistory = function() {
      var userId = profile.get('userId');     
      
      var historyServerUrl = (constants.userProfileServerUrl || "profile/" ) + "history"
      
      if(userId) {
        //Ask for user search history
        $.ajax({
          type: "GET",
          url: historyServerUrl,
          success: function(data) {
            
            console.log(data);
            try {
              data = JSON.parse(data);
              
              //Create history table
              var historyTable = '<table><tr><th>Query</th><th>Tags</th>Items<th></th></tr>';
              
              historyTable += '</table>';
              
            } catch(e) {
              console.error(e);
            }  
          },
          dataType: "text",
          contentType : "application/json; charset=utf-8"
        });
      }     
    };
    
    //Get tag recommendations for the user which is logged in
    var getUserTags = function() {
      
      var userId = profile.get('userId');
      
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
      
     
      
  	  //Apply settings stored in current profile to general settings form
  	  var settings = profile.get('settings');

  	  if(settings) {
  	    var data = JSON.parse(settings);
  	    if(data.maxResults) {
          set('queryOptions.maxNumResults', data.maxResults);
        }
        if(data.clusterType) {
          set('queryOptions.clusterType', data.clusterType);
        }
        if ( data.numClusters ) {
			set('queryOptions.clusters0', data.numClusters);
		}

		if ( data.transMethod ) {
			set('queryOptions.trans', data.transMethod);
		}
  	  }
     
  	  //Initialize the form with the default values
      $("#max-num-results").val(constants.queryOptions.maxNumResults);
      if(constants.queryOptions.clusterType === '3D') {
        $("#audio-cluster-type").parent().removeClass('checked');
        $("#audio-cluster-type").attr('checked', false);
      } else {
        $("#audio-cluster-type").parent().addClass('checked');
        $("#audio-cluster-type").attr('checked', true);
      }
      
      $("#num-clusters").val(constants.queryOptions.clusters0);
      $("#trans-method option[value=" + constants.queryOptions.trans + "]").attr('selected','selected');
    };
    
    var performLoggedInSetup = function() {
      
      if(arguments.length == 1) {
        //Set profile
        profile.set(arguments[0]);
      } 
      
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
      if ( cofind ) cofind.setup(cofindOptions);

      //get user tags from pTag component
      getUserTags();
      //get user search history
      getUserHistory();
      //init settings form based on user profile data
      initSettings();
      
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
      
      var mr = parseInt(panels.settings.find("#max-num-results").val());
  	  var ct = $("#audio-cluster-type").attr('checked') ? 'Audio' : '3D';
  	  
	  var nc = parseInt(panels.settings.find("#num-clusters").val()) ;
	  var tm = panels.settings.find("#trans-method option:selected").val() ;
      
      if(constants.queryOptions.maxNumResults === mr &&
   	     constants.queryOptions.clusterType   === ct &&
   	     constants.queryOptions.cluster0      === nc &&
   	     constants.queryOptions.trans         === tm ){
        return;
      }  
	          
      set('queryOptions.maxNumResults', mr);
  	  set('queryOptions.clusterType', ct);
  	  set('queryOptions.cluster0', nc);
  	  set('queryOptions.trans', tm) ;
      
      var settings = {"maxResults" :  mr , "clusterType" : ct, 
	      "numClusters" : nc ,  "transMethod" : tm 
	  };
	  
      profile.set('settings',settings,sendNotifyMessage);
  	  
      //Notify the user that their action has been successful -- close the panel
      panels.hide(constants.slideDownAnimationTime);
    };
    
    var handleLogin = function(token) {
      
      var serverURL = constants.userLoginServerUrl || "login";        
	    
	  var postData ;
	  
	  if ( constants.useOldAuthentication )
	  {
      	 postData = {email: panels.login.find("#email").val() || '',
                         pw: panels.login.find("#pw").val()    || ''};
      }
      else
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
      
      panels.settings = $("#global-settings");
      panels.settings.hide();
  	  
  	  panels.profile = $("#profile-settings");
  	  panels.profile.hide();
  	  
  	  panels.messages = $("#messages");
  	  panels.messages.hide();
  	 
		  //initialize settings from local configuration if any 
      if(localConfig) {
        if(typeof(localConfig) === "function") {
          localConfig(constants);
        }
      }	 
  	  //Setup profile basically pass the url of the profile server 
  	  profile.setServerUrl(constants.userProfileServerUrl) ;
  	  //Init the user profile to identify if user is logged in
      if(profile.init()) {
        performLoggedInSetup();
      } else {
        initSettings();
      }
     
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
          panels.settings.hide(constants.slideUpAnimationTime);
          $("#button-global-settings").removeClass('active');
        } else {
          panels.hide(constants.slideDownAnimationTime);
          panels.settings.show(constants.slideDownAnimationTime);
    	  $("#button-global-settings").addClass('active');
          $("body").one("click", function() {
            panels.hide(constants.slideDownAnimationTime);
          });
        }
        event.stopPropagation();
        return false ;
      });

      panels.settings.click(function(event) {
        event.stopPropagation();
      });
      
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
          panels.login.hide(constants.slideDownAnimationTime);
        });
        
        janrain.events.onProviderLoginToken.addHandler(function(tokenResponse) {
          //console.log(tokenResponse);
          handleLogin(tokenResponse.token);
        });
      };
      //----------------------------------------------------------      
      
      panels.login = $("#login-settings");
      panels.login.hide();
      
      $("#button-login-settings").on('click touchstart',function(event){

        if($("#button-login-settings").find('a:first').text() == 'Login') {
          
          if($("#button-login-settings").hasClass('active')) {
            /* 
            if(panels.login.find("#email").val().length > 0 || panels.login.find("#pw").val().length > 0) {
              handleLogin();
            } else { 
              panels.login.hide(constants.slideDownAnimationTime);
            } 
            */
            panels.login.hide(constants.slideUpAnimationTime);
            $("#button-login-settings").removeClass('active');
          } else {
            panels.hide(constants.slideDownAnimationTime);
            panels.login.show(constants.slideDownAnimationTime);
            $("#button-login-settings").addClass('active');
            $("body").one("click", function() {
              panels.hide(constants.slideDownAnimationTime);
            });
          }
        } else {http://localhost/isearch/register.php
          
          if($("#button-login-settings").hasClass('active')) {
            profile.setFromForm(sendNotifyMessage);
            panels.profile.hide(constants.slideDownAnimationTime);
            $("#button-login-settings").removeClass('active');
          } else {
            panels.hide(constants.slideDownAnimationTime);
            panels.profile.show(constants.slideUpAnimationTime);
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
        panels.hide(constants.slideDownAnimationTime);
        handleLogout();
        event.preventDefault();
        event.stopPropagation();
      });
      
      panels.login.click(function(event) {
        event.preventDefault();
        event.stopPropagation();
      });

	  $('#user-registration').click(function(event) {
	    	$.ajax({
	    		type: "POST",
    			url: constants.userRegisterServerUrl,
    			success: function(data) {
    			
    				var frm = $('<div>').html(data) ;
    				
    				var onSumbit = function() {
    					var fields = $(this).serialize();
	    					
    					$.ajax({
    							type: 'POST',
				    			url: constants.userRegisterServerUrl,
				    			data: fields,
   								success: function(data) {
    								frm.html(data) ;
    							
    								$('form', frm).submit(onSumbit) ; 
    							}
    						}) ;			
	    					
						return false;
	    			} ;
    				    			
	     			frm.dialog(
	     					{ 	modal: true, 
	     						title: "Registration", 
	     						width: 800, 
	     						height: 400,
	     						autoOpen: false,
                                maxHeight: 400,
	     					}).dialog('open');
	     					
	     				$('form', frm).submit(onSumbit) ; 
			    }
			   
		  });
	  
	  }) ;
	  
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
          	if ( constants.useOldAuthentication )
          	{
          		if(panels.login.find("#email").val().length > 0 || panels.login.find("#pw").val().length > 0) {
            	  handleLogin();
            	} 
          	}	

            panels.login.hide(constants.slideDownAnimationTime);
           
            $("#button-login-settings").removeClass('active');
          }
          return false;
        }
      });
      
      $("#profile-settings form").keypress(function(event) {
        if ( event.which == 13 ) {
          event.preventDefault();
          if($("#button-login-settings").hasClass('active')) {
            profile.setFromForm(sendNotifyMessage);
            panels.profile.hide(constants.slideDownAnimationTime);
            $("#button-login-settings").removeClass('active');
          }
          return false;
        }
      });

    }; //End of initPanel()   
    
    
    //Public variables and functions
    return {
      constants : constants,
      set: set,
      initPanel: initPanel
    };
    
  }
);
  

