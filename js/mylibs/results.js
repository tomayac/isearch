//That JS will take care of the results interactions & visualizations

define("mylibs/results", 
    ["mylibs/config","mylibs/visualization/dataParser", "mylibs/visualization/visualizer"],
    function(config, dataParser, visualizer){
  
  //Private variable to hold the results
  var jsonData = null;
  
  var display = function(query){
    init();
    fetch(query);
    attachEvents();
  };

  var init = function() {
    //Is this function useful?!
    
    function redraw() {
    	vis.draw(res, "#hpanel", config.constants.visOptions) ;
    }

  	$("#results-page").bind("pageshow", function(e) {
  		redraw() ;
  	}) ;

  };

  var attachEvents = function() {

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
  };
  
  /*
    var fetch = function(query) {

	var urlToFetch = "http://www.osmoz2009.com/isearch/";

     $.ajax({
		crossDomain: true,
        url: urlToFetch ,
        type: "GET",
        dataType: "jsonp",
        data: {
		"format": "json"
      },
 */

  var fetch = function(query) {
	var urlToFetch = "http://vision.iti.gr/sotiris/isearch/fetch.php";

	if ( query ) __queryParams.q = query ;
	
    $.ajax({
      crossDomain: true,
      url: urlToFetch ,
      type: "GET",
      dataType: "jsonp",
      data: __queryParams,
      success: function(data) {

        console.log(data)
        //Let's save the data in a safer place
        store(data);

        //...and visualize it
        visualize();
      }
    }); 
  };

  var visualize = function() {
    
    var results = dataParser.parse(jsonData) ;

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
      //method: config.contants.visualizationMethod, 
      method: config.constants.visualizationMethod,
      onItemClick: showItem, 
      thumbSize: config.constants.iconSize,
		thumbRenderer: new DefaultThumbRenderer
    };
    console.log('Will draw in 1 line');
    visualizer.draw(results, "#visualization-container", config.constants.visOptions) ;
  };
  
  var showItem = function(item) {

  	var container = $("#preview-page #image-container") ;
  	container.empty() ;

  	$("<img/>", { "width": "90%" }).appendTo(container).attr("src", item.contentUrl) ;
  	$("<div/>").appendTo(container).html("<p>" + item.tooltip + "</p>") ;

  };
  
  var store = function(data) {
    jsonData = data;
  };
  
  var get = function() {
    return jsonData;
  };
  
  return {
    display: display,
    store: store,
    get: get
  };
});