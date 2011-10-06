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
    

    //Global set function
    var set = function(key, value) {
      if(constants.hasOwnProperty(key)) {
        constants[key] = value;
        return true;
      } else {
        return false;
      }
    };


    var initPanel = function() {

      $settingsPanel = $("#settings-panel");
      $settingsPanel.hide();
      $("#settings a").click(function(){
        $settingsPanel.toggle(constants.slideDownAnimationTime);
      });

      //Initialize the form with the default values
      $settingsPanel.find("#max-num-results")
          .val(constants.maxNumResults);
      $settingsPanel.find("#icon-size option[value=" + constants.visOptions.thumbSize + "]")
          .attr('selected','selected');
      $settingsPanel.find("#icon-size option[value=" + constants.visOptions.method + "]")
          .attr('selected','selected');

      //Listen to button click to change settings
      $settingsPanel.find('#update-settings').click(function(){
        set('maxNumResults', 
          $settingsPanel.find("#max-num-results").val()
        );
        set('visOptions.thumbSize', 
          $settingsPanel.find("#icon-size option:selected").val()
        );
        set('visOptions.method', 
          $settingsPanel.find("#visualization-method option:selected").val()
        );

        //Notify the user that their action has been successful -- close the panel
        $settingsPanel.hide(constants.slideUpAnimationTime);

        //Prevents the form submit to trigger a page reload
        return false;
      });
      
      var getUserTags = function() {
    	  $.ajax({
        	  type: "GET",
        	  url: "http://isearch.ai.fh-erfurt.de/profile/ID",
        	  success: function(data) {
          		data = JSON.parse(data);

          		if(!data.error) {
          			
          			//Ask for tag recommendations
          			$.ajax({
                  	  type: "GET",
                  	  url: "http://isearch.ai.fh-erfurt.de/ptag/tagRecommendations?userID=" + data.ID,
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
                            //Get tokens and load them as autosuggestion for the user
                            var tokens = tags.getTokens();
                            $("#query-field").tokenInput("clear");
                            $("#query-field").tokenInput("add", tokens);
                  	  },
                  	  dataType: "text",
                  	  contentType : "application/json; charset=utf-8"
                    });
          			
          		}
        	  },
        	  dataType: "text",
        	  contentType : "application/json; charset=utf-8"
          });
      };
      
      //Get the user name if available
	  $.ajax({
    	  type: "GET",
    	  url: "http://isearch.ai.fh-erfurt.de/profile/Email",
    	  success: function(data) {
      		data = JSON.parse(data);

      		if(!data.error) {
      			$("#login-status").html("Hello " + data.Email + " <a id=\"logout-user\" href=\"\">[logout]</a>");
      			getUserTags();
      		}
    	  },
    	  dataType: "text",
    	  contentType : "application/json; charset=utf-8"
      });
      
      //Listen to button click to login
      $('#login-user').click(function(event){
    	  
    	  event.preventDefault();
    	  
    	  var serverURL = "http://isearch.ai.fh-erfurt.de/login/";
    	  
    	  var postData = {email: $settingsPanel.find("#email").val() || '',
    			          pw: $settingsPanel.find("#pw").val() || ''};
    	  
    	  //Send it to the server
    	  $.ajax({
	    	  type: "POST",
	    	  url: serverURL,
	    	  data: JSON.stringify(postData),
	    	  success: function(data) {
	      		console.log("User logged in: " + data);
	      		data = JSON.parse(data);
	      		$("#login-status").html("Hello " + data.Email + " <a id=\"logout-user\" href=\"\">[logout]</a>");
	      		getUserTags();
	    	  },
	    	  dataType: "text",
	    	  contentType : "application/json; charset=utf-8"
	      });
    	  
    	  //Notify the user that their action has been successful -- close the panel
          $settingsPanel.hide(constants.slideUpAnimationTime);
    	  
    	  //Prevents the form submit to trigger a page reload
          return false;
      });
	  
	  //Listen to logout link click
      $('#logout-user').live('click', function(event){
    	  
    	  event.preventDefault();
    	  
    	  var serverURL = "http://isearch.ai.fh-erfurt.de/login/"; 	  
    	  
    	  console.log("Logging out...");
    	  
    	  //Send it to the server
    	  $.ajax({
	    	  type: "DELETE",
	    	  url: serverURL,
	    	  success: function(data) {
	      		  if(!data.error) {	
	      			  console.log("User logged out");
	      			  $("#login-status").html("Hello Guest");
	      			  $(".tags").html('');
	      		  } else {
	      			  alert("Something went wrong: " + data.error);
	      		  }
	    	  },
	    	  dataType: "text",
	    	  contentType : "application/json; charset=utf-8"
	      });
    	  
    	  //Prevents the form submit to trigger a page reload
    	  event.stopPropagation();
          return false;
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
  

