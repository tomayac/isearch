ThumbContainer = function(containerDiv, data, options) {
	
	$(containerDiv).empty() ;
	
	if ( options.thumbSize )
		this.thumbSize = options.thumbSize ;
		
	if ( options.onClick )
		this.onClick = options.onClick ;
		
	if ( options.mode )
		this.mode = options.mode ;
	
	this.containerDiv = containerDiv ;
	
	this.createCanvas() ;
	
	this.onMouseOver = this.showTooltip ;
	this.onMouseOut = this.hideTooltip ;
	
	this.thumbs = [] ;
	this.populate(data);
	
	
	
}

var p = ThumbContainer.prototype;

ThumbContainer.GRID_MODE = 0 ;
ThumbContainer.TRANS_MODE = 1 ;

ThumbContainer.NAV_FIXED = 0 ;
ThumbContainer.NAV_HOVER = 1 ;
ThumbContainer.NAV_HIDDEN = 2 ;

ThumbContainer.margin = 4 ;
ThumbContainer.navBarSize = 32 ;


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
p.mode = ThumbContainer.GRID_MODE ;
p.offset = 0 ;
p.pageCount = 0 ;
p.navMode = ThumbContainer.NAV_FIXED ;
p.navBar = null ;


ThumbContainer.zoomScales = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0] ;
  
p.createCanvas = function()
{
	var obj = this ;
	
	$(this.containerDiv).empty() ;
	
	this.canvas = $("<canvas/>").appendTo(this.containerDiv).get(0) ;
		
	this.ctx = this.canvas.getContext("2d");
	
	this.canvas.addEventListener("mousedown", function(e) { obj.handleMouseClick(e) ; }, true);
	this.canvas.addEventListener("mousemove", function(e) { obj.handleMouseMove(e) ; }, true);
	
	// add navigation bar
	if ( this.mode == ThumbContainer.GRID_MODE && this.navMode != ThumbContainer.NAV_HIDDEN ) {
		this.navBar = $("<div/>", { "class": "thumb-container-nav-bar", 
					  css: { 	"position": "absolute", 
								"width": "100%", 
								"height": ThumbContainer.navBarSize,
								"display": ( this.navMode == ThumbContainer.NAV_HOVER ) ? "none" : "block",
								"overflow": "hidden",
								"padding" : "4px",
								"bottom": 0
							} 
					}).
		appendTo($(this.containerDiv)) ;
	}
	
/*	var that = this ;
	$(window).bind("orientationchange resize",function(e) {
		that.draw() ;
	}) ;
*/	
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

p.redrawNavBar = function(page, maxPage, width)
{
	if ( maxPage == 1 ) return ;
	// Show pager
	
	var nav = '', prev = '', next = '', first = '', last = '' ;
	var delta = 1 ;
	
	var min_surplus = (page <= delta) ? (delta - page + 1) : 0;
    var max_surplus = (page >= (maxPage - delta)) ?
                      (page - (maxPage - delta)) : 0;
    
    var start =  Math.max(page - delta - max_surplus, 1) ;
    var end = Math.min(page + delta + min_surplus, maxPage) ;
    	
	if ( start > 1 ) nav += '<li>...</li>' ;
	
	for( var p = start; p <= end; p++ )
	{
		if ( p == page ) nav += '<li class="pager-current first">' + page + '</li> '; // no need to create a link to current page
		else {
			//$url = str_replace('%%page%%', $p, $urlTemplate) ;
			nav += '<li class="pager-item"><a title="Go to page ' + p + '" id="page-' + p + '" href="#">' + p + '</a></li>';
		}
	}
	
		
	if ( page > 1 ) 
	{
		p = page - 1 ;
	//	$url_prev = str_replace('%%page%%', $p, $urlTemplate) ;
	//	$url_first = str_replace('%%page%%', '1', $urlTemplate) ;
		prev =  '<li class="pager-previous"><a title="Previous page" id="page-' + p + '" href="#">&lt;</a></li>';
		first = '<li class="pager-first first"><a title="First page" id="page-' + p + '" href="#">&lt;&lt;</a></li>';
	}
	else
	{
		prev  = '&nbsp;'; // we're on page one, don't print previous link
		first = '&nbsp;'; // nor the first page link
	}

	if ( page < maxPage )
	{
		p = page + 1 ;
		//$url_next = str_replace('%%page%%', $p, $urlTemplate) ;
		//$url_last = str_replace('%%page%%', $maxPage, $urlTemplate) ;
		next = '<li class="pager-next"><a title="Next page" id="page-' + p + '" href="#">&gt</a></li>';
		last = '<li class="pager-last last"><a title="Last page" id="page-' + maxPage +'" href="#">&gt;&gt;</a></li>';
	}
	else
	{
		next = '&nbsp;'; // we're on the last page, don't print next link
		last = '&nbsp;'; // nor the last page link
	}

	if ( end < maxPage ) nav += '<li>...</li>' ;
		
	if ( width < 200 ) { nav = first = last = '' ; }
	// print the navigation link
	$(this.navBar).html('<ul class="pager" >' + first + prev + nav + next + last + '</ul>') ;
	
//	$(this.navBar).css('top', top ) ;
	
	var that = this ;
	$('ul.pager a', this.navBar).bind( "click", function() {
		var page = this.id.substr(5) ;
		that.offset = that.pageCount * (page - 1) ;
		that.draw() ;
	}) ;
}

p.resize = function(e) {
	console.log(e) ;
}

p.draw = function() {

	var cw = $(this.containerDiv).width()  ;
	var ch = $(this.containerDiv).height() ;
	
	this.origWidth = this.canvas.width = cw ;
	this.origHeight = this.canvas.height = ch ;
		
	this.redraw(cw, ch) ;
}

p.redraw = function(contentWidth, contentHeight)
{
	this.ctx.clearRect(0, 0, contentWidth, contentHeight);
	
	if ( this.mode == ThumbContainer.GRID_MODE )
	{
		// compute layout
		
		var m = ThumbContainer.margin ;
		var of = this.thumbSize + m ;
		
		var sh = ( this.navMode != ThumbContainer.NAV_HIDDEN ) ? (contentHeight - ThumbContainer.navBarSize - m ) : contentHeight - m ;
		var sw = contentWidth - m ;
		
		var nc = Math.floor(sw/of) ;
		var nr = Math.floor(sh/of) ;
		this.pageCount = nr * nc ;
		this.offset = this.pageCount * Math.floor(this.offset / this.pageCount) ;
		
		if ( this.pageCount == 0 ) return ;
		
		var x = m, y = m ;
		var r = 0, c = 0 ;
		
		for( var i=this.offset ; i<Math.min(this.offset + this.pageCount, this.thumbs.length) ; i++ )
		{
			var item = this.thumbs[i] ;
					
			item.show(this.ctx, x, y) ;
			
			c++ ;
			if ( c == nc ) { 
				r++ ; 
				x = m ; 
				y += of ;
				c = 0 ;
			}
			else 
				x += of ;
				
			if ( r == nr ) break ;
		}
		
		if ( this.navMode != ThumbContainer.NAV_HIDDEN )
		{
			var page = Math.floor(this.offset/this.pageCount) ;
			var maxPage = Math.ceil(this.thumbs.length/this.pageCount) ;
			this.redrawNavBar(page+1, maxPage, contentWidth) ;
		}
	
	}
	else
	{
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
	
	if ( this.mode == ThumbContainer.GRID_MODE && this.navMode == ThumbContainer.NAV_HOVER )
	{
		if ( pos.y > this.canvas.height - ThumbContainer.navBarSize )
		{
			if ( this.hoverItem && this.onMouseOut )
			{
				this.onMouseOut(this.hoverItem) ;
				this.hoverItem = null ;
				return ;
			}
			$(this.navBar).show() ;
			return ;
		}
		
		$(this.navBar).hide() ;
	}
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
	// find the upper left corner of the thumbnail in window coordinates
	
	var offset = $(this.canvas).offset() ;
	var posx = item.x + offset.left ;
	var posy = item.y + offset.top  ;
	
	var ele = $(".tooltip") ;
	var tooltip ;
	
	if ( ele.length == 0 )
	{
		var tooltip = jQuery(document.createElement('div'))
					 .addClass("tooltip")
				     .html("<p>" + item.tooltip + "</p>").
					appendTo('body');
	
	}
	else
	{
		tooltip = ele ;
		ele.html("<p>" + item.tooltip + "</p>") ;
	}			

    var ttw = tooltip.outerWidth() ;
	var tth = tooltip.outerHeight() ;
	var ww = $(window).width() + $(window).scrollLeft();
	var wh = $(window).height() + $(window).scrollTop() ;
	var ts = this.thumbSize ;
		
	if ( posx + ts + ttw < ww )
	{
		tooltip.css("left", posx + ts)
	}
	else 
	{
		tooltip.css("left", ww-ttw-2)
	}
	
	if ( posy + ts + tth < wh  )
	{
		tooltip.css("top", posy + ts)
	}
	else 
	{
		tooltip.css("top", wh-tth-2)
		
	}
	
	tooltip.fadeIn('fast') ;
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
