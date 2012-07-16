define("mylibs/visualization/ThumbRendererFactory", 
	[
		"mylibs/visualization/DefaultThumbRenderer",
		"mylibs/visualization/AudioThumbRenderer"
	],
	
	function(defaultThumbRenderer, audioThumbRenderer) {
    
       	var create = function(name)
    	{
    		if ( name == "default" )
    			return defaultThumbRenderer ;			 	
			else if ( name == "audio" )
    			return audioThumbRenderer ;
    		    	
    	};
    	
    	return {
    		create: create
	   	};
    
    
	}
) ;
