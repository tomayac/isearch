ThumbContainer = function(containerDiv, data, options) {
	
	$(containerDiv).empty() ;
	
	if ( options.thumbSize )
		this.thumbSize = options.thumbSize ;
		
	if ( options.onClick )
		this.onClick = options.onClick ;
	
	this.containerDiv = containerDiv ;
	
	this.createCanvas() ;
	
	this.onMouseOver = this.showTooltip ;
	this.onMouseOut = this.hideTooltip ;
	
	this.thumbs = [] ;
	this.populate(data);
	
	
	
}

var p = ThumbContainer.prototype;

p.containerDiv = null ;
p.thumbs = null ;
p.canvas = null ;
p.ctx = null ;
p.onClick = null ;
p.onMouseOver = null  ;
p.onMouseOut = null ;
p.hoverItem = null ;
p.currentZoomScale = 2 ;
p.origWidth = 0;
p.origHeight = 0 ;
p.offsetX = 0 ;
p.offsetY = 0 ;
p.tooltipPending = false ;
p.thumbSize = Thumbnail.size ;

ThumbContainer.zoomScales = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0] ;
  
p.createCanvas = function()
{
	var obj = this ;
	
	$(this.containerDiv).empty() ;
	
	this.canvas = $("<canvas/>").appendTo(this.containerDiv).get(0) ;
		
	this.ctx = this.canvas.getContext("2d");
	
	this.canvas.addEventListener("mousedown", function(e) { obj.handleMouseClick(e) ; }, true);
	this.canvas.addEventListener("mousemove", function(e) { obj.handleMouseMove(e) ; }, true);
}

p.populate = function(data) {
	
	var thumbs = this.thumbs ;

	for( var i=0 ; i<data.length ; i++ )
	{
		var x = data[i].x ;
		var y = data[i].y ;
		var url = data[i].doc.thumbUrl ;
		var desc = data[i].doc.desc ;
		var docid = data[i].doc.id ;
		var thumb = new Thumbnail(url, this.thumbSize) ;
		thumb.qx = x ;
		thumb.qy = y ;
		thumb.id = docid ;
		thumb.tooltip = desc ;
		thumb.contentUrl = data[i].doc.contentUrl ;
		thumb.lat = data[i].doc.lat ;
		thumb.lon = data[i].doc.lon ;
		thumbs.push(thumb) ;
	} ;
	
}

p.resize = function(e) {
	console.log(e) ;
}

p.draw = function() {

	var cw = $(this.containerDiv).width() - 10 ;
	var ch = $(this.containerDiv).height() - 10;
	
	this.origWidth = this.canvas.width = cw ;
	this.origHeight = this.canvas.height = ch ;
		
	this.redraw(cw, ch) ;
}

p.redraw = function(contentWidth, contentHeight)
{
	this.ctx.clearRect(0, 0, contentWidth, contentHeight);
	
	var lmanager = new LabelManager(contentWidth, contentHeight) ;	
		 
	var sz = this.thumbSize  ;
	
	for( var i=0 ; i<this.thumbs.length ; i++ )
	{
		var item = this.thumbs[i] ;
		
		lmanager.addLabelGraphic(i, item.qx * contentWidth, item.qy * contentHeight, sz, sz) ;
	}
		 		
	var res = lmanager.solve() ;
	
	for( i = 0 ; i<this.thumbs.length ; i++ )
	{
		var item = this.thumbs[i] ;
		item.hide() ;
	}	 
				
	for( i = 0 ; i<res.length ; i++ )
	{
		var q = res[i] ;
		var index = q.index ;
		
		var item = this.thumbs[index] ;
		
			
		item.show(this.ctx, q.x, q.y) ;
	}
	
	delete lmanager ;
}

p.getPosition = function(event)
{
    var x = new Number();
    var y = new Number();
    var canvas = this.canvas ;

    if (event.x != undefined && event.y != undefined)
    {
        x = event.x;
        y = event.y;
    }
    else // Firefox method to get the position
    {
		x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

   x -= $(canvas).offset().left;
   y -= $(canvas).offset().top;
    
	return {"x": x, "y": y} ;
}

function inBBox(x, y, item)
{
	return ( x >= item.x && x < item.x + item.size && y >= item.y && y < item.y + item.size )
	
}

p.hitTest = function(x, y)
{
	for( var i=0 ; i<this.thumbs.length ; i++ )
	{
		var item = this.thumbs[i] ;
		
		if ( item.visible == false ) continue ;
		 			
		if ( inBBox(x, y, item) ) return item ;
				
	}

	return null ;

}

p.handleMouseClick = function(event)
{
	var pos = this.getPosition(event) ;
	
	var item = this.hitTest(pos.x, pos.y) ;
	
	if ( item && this.onClick ) {
		this.hideTooltip() ;
		this.onClick(item) ;
	}
}

p.handleMouseMove = function(event)
{
	var pos = this.getPosition(event) ;
	
	// if inside current hover item there is nothing to do
	
	if ( this.hoverItem && inBBox( pos.x, pos.y, this.hoverItem ) ) return ;
	
	var item = this.hitTest(pos.x, pos.y) ;
		
	if ( item && this.hoverItem == null && this.onMouseOver )
	{
		this.hoverItem = item ;
		this.onMouseOver(item) ;
		return ;
	}
	
	if ( this.hoverItem && this.onMouseOut )
	{
		this.onMouseOut(this.hoverItem) ;
		this.hoverItem = null ;
		return ;
	}
	
	
}

p.doShowTooltip = function(item) 
{
	var offset = $(this.canvas).offset() ;
	var posx = item.x + offset.left + this.thumbSize ;
	var posy = item.y + offset.top + this.thumbSize ;
	
	var ele = $(".tooltip") ;
	
	if ( ele.length == 0 )
	{
		var tooltip = jQuery(document.createElement('div'))
					 .addClass("tooltip")
					 .css("left", posx)
					 .css("top", posy)
                     .html("<p>" + item.tooltip + "</p>")
					 .fadeIn('fast') 
					 .appendTo('body') ;
	}
	else
		ele.css("left", posx)
					 .css("top", posy)
                     .html("<p>" + item.tooltip + "</p>")
					 .fadeIn('fast')  ;
					 
	
	//console.log(item.id) ;
}

p.showTooltip = function(item)
{
					 
	var obj = this ;
	this.tooltipPending = true ;
	setTimeout( function() { 
		if ( obj.hoverItem == item && obj.tooltipPending ) obj.doShowTooltip(item) ;
	}, 500) ;

}

p.hideTooltip = function(item) 
{
	this.tooltipPending = false ;
	$(".tooltip").hide() ;

}

p.doResize = function()
{
        	
   	var oldWidth = this.canvas.width ;
   	var oldHeight = this.canvas.height ;
        
	this.createCanvas() ;
	
    this.canvas.width = this.origWidth * ThumbContainer.zoomScales[this.currentZoomScale]  ;
    this.canvas.height = this.origHeight * ThumbContainer.zoomScales[this.currentZoomScale];
	
	this.redraw(this.canvas.width, this.canvas.height) ;
        	
 //   var scaleFactor = (this.canvas.width - this.origWidth)/(oldWidth - this.origWidth);
                	
  //  var cx = (this.canvas.width - this.origWidth)/2 ;
   // var cy = (this.canvas.height - this.origHeight)/2 ;
    
/*	
    if ( isNaN(offsetX) && isNaN(offsetY) )
        	{
        		offsetX = cx ;
        		offsetY = cy ;
        	}
        	else
        	{
        	   	offsetX = csx * scaleFactor ;
        		offsetY = csy * scaleFactor ;
        	}
        	
        	obj.invalidateSize() ;
        	
        	if ( cx > 0 && cy > 0 )
        	{
        		obj.move(0, 0) ;
        		this.horizontalScrollPolicy = "on" ;
        		this.verticalScrollPolicy = "on" ;
        		
        		this.horizontalScrollPosition =  offsetX ;
        		this.verticalScrollPosition =  offsetY ;
        	}
        	else if ( cx < 0 && cy < 0 )
        	{
        		obj.move(-cx, -cy) ;
        		this.horizontalScrollPolicy = "off" ;
        		this.verticalScrollPolicy = "off" ;
        		offsetX = offsetY = NaN ;
        		
        	}
        	else 
        	{
        		obj.move(0, 0) ;
        		this.horizontalScrollPolicy = "off" ;
        		this.verticalScrollPolicy = "off" ;
        		offsetX = offsetY = NaN ;
        	}
        		
        	this.autoLayout = false ;
        		
  */
	
        	
}
        
p.zoomIn  = function()
{
    if ( this.currentZoomScale == ThumbContainer.zoomScales.length - 1 ) return ;
    this.currentZoomScale ++ ;
      	
        	
    this.doResize() ;	
}
        
p.zoomOut = function()
{
   	if ( this.currentZoomScale == 0 ) return ;
    this.currentZoomScale --  ;
 
 	this.doResize() ;
}

p.resize = function()
{
	this.createCanvas() ;
		
	this.draw() ;
}


p.showMap = function()
{
	var markerImages = [];
	
	for( var i=0 ; i<this.thumbs.length ; i++ )
	{
		var data = this.thumbs[i] ;
		
		var lat = data.lat ;
		var lon = data.lon ;
		var thumb = data.url ;
		var desc = data.desc ;
		var docid = data.id ;
		var tooltip = data.tooltip ;
		var contentUrl = data.contentUrl ;
		
		markerImages.push({ "lat": lat, "lon": lon, "icon": thumb, "desc": tooltip }) ;
	}
	
	var mainMap = new GoogleMap("map-view", [ 
				{ type: 'markers', data: markerImages, name: 'Images',
						minzoom: 4}
				]) ;
}
