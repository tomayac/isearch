// jQuery plugin for showing image thumbnails aligned within a div
// Uses the canvas element.

(function( $ ){
	$.fn.thumb = function(methodOrUrl, options) {
		
		var defaults = {
			'autoLoad': true,
			'maintainAspectRatio': true,
			'decorator': null
		};
		options = $.extend( {}, defaults, options );
		
		var loadImage = function(obj)
		{
			var data = obj.data('data') ;
				
			data.image.onload = function() {
					drawImage(obj) ;
			}
			data.image.src = data.url ;
			
			return obj ;
		}
					
		var drawImage = function(obj)	
		{	
			var dstw2 = obj.width() ;
			var dsth2 = obj.height() ;	
		
			var data = obj.data('data') ;
			
			if ( !data ) return ;
			
			var origw = data.image.width ;	
			var origh = data.image.height ;	
			var ctx = data.ctx ;
		
			var thumbw, thumbh, offx, offy ;	
		
			if ( options.maintainAspectRatio )
			{
				if ( origw > origh )	
				{	
					thumbw = dstw2 ;  	
					thumbh = dsth2*(origh/origw);  	
				}  	
				else if ( origw <= origh )   	
				{  	
					thumbh = dsth2 ;  	
					thumbw = dstw2*(origw/origh);  	
				}  	
				
				offx = (dstw2 - thumbw)/2 ;
				offy = (dsth2 - thumbh)/2 ;
			}
			else
			{
				thumbw = dstw2 ;
				thumbh = dsth2 ;
				offx = 0 ;
				offy = 0 ;
			}
					
			ctx.drawImage(data.image, offx, offy, thumbw, thumbh) ;	
			
			if ( options.decorator )
				options.decorator(ctx, dstw2, dsth2, offx, offy, thumbw, thumbh) ;
		};	
		
		return this.each( function() {
        
			var $this = $(this) ;
			
			if ( methodOrUrl == 'load' )
				loadImage($this) ;
			else
			{
				var w = $this.width() ;
				var h = $this.height() ;
			
				var canvas = $("<canvas/>").appendTo($this).get(0) ;	
				canvas.width = w ;
				canvas.height = h ;
				var ctx = canvas.getContext("2d");	
			
				var image = new Image ;
				$this.data('data', { "image": image, "ctx": ctx, "url": methodOrUrl }) ;
			
				if ( options.autoLoad )
					loadImage($this) ;
					
			}  
        }) ; 

	};
})( jQuery );
