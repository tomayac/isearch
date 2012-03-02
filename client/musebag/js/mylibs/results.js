//That JS will take care of the results interactions & visualizations

define("mylibs/results", 
  [
    "mylibs/config",
    "mylibs/visualization/dataParser", 
    "mylibs/visualization/visualizer"
  ],
  function(config, dataParser, visualizer){
  
	//Private variable to hold the results
	var jsonData = null;
	var results = null ;
	var loader = null ;
  
	var display = function(results) 
	{
		store(results) ;
		visualize() ;
	};

	var visualize = function() 
	{
		$('#visualization-container').remove() ;
    
		//Create the container for visualization
		var visualizationContainer = $('<div />').attr('id', 'visualization-container').appendTo('#main');
    visualizer.draw(results, "#visualization-container", config.constants.visOptions) ;
	};
  
	var store = function(data) {
		results = dataParser.parse(data) ;
	};
  
	var get = function() {
		return results;
	};
  
	return {
		display: display,
		get: get
	};
});