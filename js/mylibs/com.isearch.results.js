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
  com.isearch.results.init();
  com.isearch.results.fetch(query);
  com.isearch.results.attachEvents();
}

com.isearch.results.init = function() {
  
  function redraw() {
  	vis.draw(res, "#hpanel", visOptions) ;
  }

	$("#results-page").bind("pageshow", function(e) {
		redraw() ;
	}) ;

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
      //Let's save the data in a safer place
      com.isearch.jsonData = data;
      
      //...and visualize it
      com.isearch.results.visualize();
    }
  }); 
}

com.isearch.results.visualize = function() {
  
  var res = new SearchResults(com.isearch.jsonData) ;
  var vis = new ResultsVisualiser ;
  
  //Create the container for visualization
  var visualizationContainer = $('<div />')
      .attr('id', 'visualization-container')
      .appendTo('#main');
      //.css('width','900px')
      //.css('height','600px');
  var loader = $('<img />')
      .attr('src', 'img/ajax-loader.gif')
      .appendTo('#visualization-container');
  
  var visOptions = { 
    method: com.isearch.config.visualizationMethod, 
    onItemClick: com.isearch.results.showItem, 
    thumbSize: com.isearch.config.iconSize 
  };
  console.log('Will draw in 1 line');
  vis.draw(res, "#visualization-container", visOptions) ;

}
com.isearch.results.showItem = function(item) {
  
	var container = $("#preview-page #image-container") ;
	container.empty() ;

	$("<img/>", { "width": "90%" }).appendTo(container).attr("src", item.contentUrl) ;
	$("<div/>").appendTo(container).html("<p>" + item.tooltip + "</p>") ;

}