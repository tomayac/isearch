//That JS will take care of the results interactions & visualizations

define("mylibs/results", 
  [
    "mylibs/config",
    "mylibs/visualization/dataParser", 
    "mylibs/visualization/visualizer",
	"mylibs/visualization/mstVisualizer/mstVisualizer",
	"mylibs/visualization/FilterBar"
  ],
  function(config, dataParser, visualizer, mstVisualizer, filterBar){
  
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
		
	  if($('#visualization-container').length > 0) {
	    $('#visualization-container').remove() ;
	  }
    
	  //Create the container for visualization
		var visualizationContainer = $('<div />').attr('id', 'visualization-container').appendTo('#main');
	  
		//console.log("Config visOptions: ", config.constants.visOptions);
    		
		if (config.constants.visOptions.method == "mst") {
			mstVisualizer.draw(results, "#visualization-container", config.constants.visOptions);
		}
		else {
			visualizer.draw(results, "#visualization-container", config.constants.visOptions) ;
		}
	};
  
	var store = function(data) {
		results = dataParser.parse(data) ;
	};
  
	var get = function(id,filterSelectedModalities) {
	  if(!id) {
	    return results;
	  } else {
      for(var i=0; i < results.docs.length; i++) {
       if(results.docs[i].coid === id) {
         if(filterSelectedModalities) {
           var media = _getSelectedModality(results.docs[i],filterBar.modalities());
           results.docs[i].media = media;
         } 
         return results.docs[i];
       } 
      }
      return false;
	  }
	};
	
	var _getSelectedModality = function(doc, modalities)
	{
	  for(var m=0 ; m<modalities.length ; m++ )
	  {
	    var mod = modalities[m] ;
	    for(var i=0 ; i<doc.media.length ; i++ )
	    {
	      var mediaType = doc.media[i] ;
	      if ( mod === "image" && mediaType.type === "ImageType" )
	      {
	        if ( mediaType.previews && mediaType.previews.length > 0 )
	        {
	          var frmt = mediaType.previews[0].format ;
	          if ( frmt === "image/svg+xml" || frmt === "image/jpeg" || frmt === "image/png") {
	            mediaType.preview = mediaType.previews[0];
	            return mediaType;
	          }
	        }
	      }
	      else if ( mod === "3d" && mediaType.type === "Object3D" )
	      {
	        if ( mediaType.previews && mediaType.previews.length > 0 )
	          mediaType.preview = mediaType.previews[0];
	          return mediaType;
	      }
	      else if ( mod === "audio" && mediaType.type === "SoundType"  )
	      {
	        if ( mediaType.previews && mediaType.previews.length > 0 )
	        {
	          for( var j=0 ; j<mediaType.previews.length ; j++ )
	          {
	            var frmt = mediaType.previews[j].format ;
	            if ( frmt === "image/svg+xml" || frmt === "image/jpeg" || frmt === "image/png" ) {
	              mediaType.preview = mediaType.previews[j];
	              return mediaType;
	            }
	          }
	        }
	      }
	      else if ( mod === "video" && mediaType.type === "VideoType" )
	      {
	        if ( mediaType.previews && mediaType.previews.length > 0 ) {
	          mediaType.preview = mediaType.previews[0];
	          return mediaType;
	        }  
	      }
	    }
	  }
	  return null;
	};
  
	return {
		display: display,
		get: get
	};
});