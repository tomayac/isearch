define("mylibs/config", ["!js/mylibs/visualization/DefaultThumbRenderer.js"],
  function() {
    
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
      
      //Listen to button click to login
      $settingsPanel.find('#login-user').click(function(){
    	  
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
	    	  },
	    	  dataType: "text",
	    	  contentType : "application/json; charset=utf-8"
	      });
    	  
      });

    }; //End of initPanel()


    //Public variables and functions
    return {
      constants: constants,
      set: set,
      initPanel: initPanel,
    }
    
  }
);
  

