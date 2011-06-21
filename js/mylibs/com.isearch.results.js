//That JS will take care of the results interactions & visualizations

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
if (com.isearch.results) {
  throw new Error("com.isearch.results already exists");
}
com.isearch.results = {};

com.isearch.results.display = function(query){
  com.isearch.results.injectFlashObject();
  com.isearch.results.fetch(query);
  com.isearch.results.attachEvents();
}

com.isearch.results.injectFlashObject = function() {
  //Inject the Flash object for the results visualization in the DOMElement
  
  var flashContainer = $( document.createElement('div') )
                       .attr('id','flash-results')
                       .html('Here goes the visualization')
                       .appendTo('#main');

  var swfLoaded = false ;
  var swfObj = null ;
  var lastResult = null ;
  var searchForm ;

  function outputStatus(e) {
    if (e.success) {
      com.isearch.flashResults = e.ref;
      console.log(com.isearch.flashResults);
    }
  }

  var flashVars = { testVar: "value" };
  var params = {
    allowFullScreen: "true",
    allowScriptAccess: "always",
    wmode: "transparent"
  };
        
  var attrs = {} ;
  swfobject.embedSWF( "demo.swf", 
                      "flash-results", 
                      "100%", "600", 
                      "10.2.0", "playerProductInstall.swf", 
                      flashVars, params, attrs, outputStatus );
}

com.isearch.results.attachEvents = function() {
  
  //Loading AJAX gif display/hiding
  var loadingDiv = $( document.createElement('div') )
                       .attr('id','loadingDiv')
                       .html('loading...')
                       .appendTo('body');

  loadingDiv.hide()  // hide it initially
      .ajaxStart(function() {
        $(this).show();
      })
      .ajaxStop(function() {
        $(this).hide();
      }); 

  //Controls for the display of the results
  $('#visualization-method').change(function() {
    if (com.isearch.flashResults && lastResult) {
      com.isearch.flashResults.visualiseResults(
          lastResult, 
          $("#visualization-method").val(), 
          { "iconSize": $("#icon-size").val() }
      );
    }
  });
  
  //Control for the icons size
  $('#icon-size').change(function() {
    if (com.isearch.flashResults && lastResult) {
      com.isearch.flashResults.visualiseResults(
          lastResult, 
          $("#visualization-method").val(), 
          {"iconSize": $("#icon-size").val()}
      );
    }
  });
 
}

com.isearch.results.fetch = function(query) {
  
  //var urlToFetch = com.isearch.results.createQueryUrl(query);
  var urlToFetch = "http://vision.iti.gr:8080/fcgi-bin/indexer.exe";

  $.ajax({
    //recovering of the XML via YQL to go over the same-origin policy
    url: urlToFetch ,
    type: "GET",
    dataType: "jsonp",
    data: {
      "q": query, 
      "total": 100, 
      "cls": "5,3", 
      "tr": "lle", 
      "out": "json"
    },
    success: function(data) {
      console.log(data)
      com.isearch.jsonData = data;

      //IMPORTANT: setTimeout is a dirty hack I put here. 
      //It's just to wait till the Flash obj is really loaded.      
      //More on this here: http://stackoverflow.com/questions/1436722/problem-accessing-externalinterface-exposed-method-in-google-chrome
      if (com.isearch.flashResults) {
        window.setTimeout(com.isearch.results.visualize, com.isearch.config.flashLoadedTimeout);
      } else {
        alert('Flash object is not loaded');
      }
    }
  }); 
}

com.isearch.results.visualize = function() {
  com.isearch.flashResults.visualiseResults(
      com.isearch.jsonData, 
      com.isearch.config.visualizationMethod, 
      {"iconSize": com.isearch.config.iconSize}
  );
}

