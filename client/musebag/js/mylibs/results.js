//That JS will take care of the results interactions & visualizations

define("mylibs/results", 
    ["mylibs/config","mylibs/visualization/dataParser", "mylibs/visualization/visualizer"],
    function(config, dataParser, visualizer){
  
	//Private variable to hold the results
	var jsonData = null;
	var results = null ;
	var loader = null ;
  
	var display = function(queryOrResults) 
	{
		if ( typeof(queryOrResults) == 'string' ) fetch(queryOrResults);
		else {
			store(queryOrResults) ;
			visualize() ;
		}
	};

	var fetch = function(query) 
	{
		var urlToFetch = "http://vision.iti.gr/sotiris/isearch/client/musebag/fetch.php";

		if ( query ) __queryParams.q = query ;
	
		$.ajax({
			crossDomain: true,
			url: urlToFetch ,
			type: "GET",
			dataType: "jsonp",
			data: __queryParams,
			success: function(data) {
		
				//Let's save the data in a safer place
				store(data);
				//...and visualize it
				visualize();
			}
		}); 
	};

	var visualize = function() 
	{
		$('#visualization-container').remove() ;
	
		//Create the container for visualization
		var visualizationContainer = $('<div />').attr('id', 'visualization-container').appendTo('#main');
		
    	visualizer.draw(results, "#visualization-container", config.constants.visOptions) ;
		
	};
  
	var store = function(data) {
		jsonData = data;
		results = dataParser.parse(jsonData) ;
	};
  
	var get = function() {
		return results;
	};
  
	return {
		display: display,
		get: get
	};
});