define("mylibs/config", ["mylibs/tags", "!js/mylibs/visualization/DefaultThumbRenderer.js"],
  function(tags) {
    
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
    		method: "tmap", //tmap, htree, hpan or classic
    		thumbSize: 64, //16, 32, 48, 64
    		iconArrange: "grid",
    		thumbRenderer: new DefaultThumbRenderer
    	}
    };
    
    var panels = {
        settings : null,
        login : null,
        hide : function(speed) {
          if(this.settings) {
            this.settings.hide(speed);
            $("#button-global-settings").removeClass('active');
          }
          if(this.login) {
            this.login.hide(speed);
            $("#button-login-settings").removeClass('active');
          }
        }
    };

    //Global set function
    var set = function(key, value) {
      if(constants.hasOwnProperty(key)) {
        constants[key] = value;
        return true;
      } else {
        return false;
      }
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
    
    var handleSettingsSave = function() {
      set('maxNumResults', 
        panels.settings.find("#max-num-results").val()
      );
      set('visOptions.thumbSize', 
        panels.settings.find("#icon-size option:selected").val()
      );
      set('visOptions.method', 
        panels.settings.find("#visualization-method option:selected").val()
      );

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
          alert("Sorry: " + data.error);
          } else {
            console.log("User logged in: " + data);
            $("#login-status").html("Hello " + data.Email + " <a id=\"logout-user\" href=\"\">[logout]</a>");
            $("#button-login-settings").find('a:first').text('Logout');
            getUserTags();
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
      
      console.log("Logging out...");
      
      //Send it to the server
      $.ajax({
        type: "DELETE",
        url: serverURL,
        success: function(data) {
            if(!data.error) { 
              console.log("User logged out");
              $("#login-status").html("Hello Guest");
              $("#button-login-settings").find('a:first').text('Login');
              //Clearing tags
              $("#query-field").tokenInput("clear");
              $(".tags").html('');
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
      $("#button-global-settings").click(function(){
        if($("#button-global-settings").hasClass('active')) {
          handleSettingsSave();
          panels.settings.hide(constants.slideDownAnimationTime);
          $("#button-global-settings").removeClass('active');
        } else {
          panels.hide(constants.slideDownAnimationTime);
          panels.settings.show(constants.slideUpAnimationTime);
          $("#button-global-settings").addClass('active');
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
          }
        } else {
          handleLogout();
          $("#button-login-settings").removeClass('active');
        }
      });

      //Initialize the form with the default values
      panels.settings.find("#max-num-results")
          .val(constants.maxNumResults);
      panels.settings.find("#icon-size option[value=" + constants.visOptions.thumbSize + "]")
          .attr('selected','selected');
      panels.settings.find("#icon-size option[value=" + constants.visOptions.method + "]")
          .attr('selected','selected');

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
      			$("#login-status").html("Hello " + data.Email);
      			getUserTags();
      		}
    	  },
    	  dataType: "text",
    	  contentType : "application/json; charset=utf-8"
      });

    }; //End of initPanel()
    
    
    
    //Public variables and functions
    return {
      constants: constants,
      set: set,
      initPanel: initPanel
    };
    
  }
);
  

