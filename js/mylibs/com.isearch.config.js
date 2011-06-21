//Namespace
var com;
if (!com) {
  com = {};
} else if (typeof com != "object") {
  throw new Error("com already exists and is not an object");
}
if (!com.isearch) {
  com.isearch = {}
} else if (typeof com.isearch != "object") {
  throw new Error("com.isearch already exists and is not an object");
}
if (com.isearch.config) {
  throw new Error("com.isearch.config already exists");
}
com.isearch.config = {
 
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
  visualizationMethod: "tmap", //tmap, htree or hpan
  iconSize: 64, //16, 32, 48, 64

  //Misc
  flashLoadedTimeout: 1500, //wait until flash obj is loaded
  
  //Global set function
  set: function(key, value) {
    if(com.isearch.config.hasOwnProperty(key)) {
      com.isearch.config[key] = value;
      return true;
    } else {
      return false;
    }
  }
};

com.isearch.config.initUI = function() {
  
  $settingsPanel = $("#settings-panel");
  $settingsPanel.hide();
  $("#settings a").click(function(){
    $settingsPanel.toggle();
  });

  //Initialize the form with the default values
  $settingsPanel.find("#max-num-results")
      .val(com.isearch.config.maxNumResults);
  $settingsPanel.find("#icon-size option[value=" + com.isearch.config.iconSize + "]")
      .attr('selected','selected');

  //Listen to button click to change settings
  $settingsPanel.find('#update-settings').click(function(){
    com.isearch.config.set('maxNumResults', 
      $settingsPanel.find("#max-num-results").val()
    );
    com.isearch.config.set('iconSize', 
      $settingsPanel.find("#icon-size option:selected").val()
    );
    return false;
  });
  

}

