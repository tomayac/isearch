require(["jquery","libs/timeline_2.3.0/timeline_js/timeline-api"],
    function($) {
ThumbContainer = function(containerDiv, data, options) {	
  
	$(containerDiv).empty() ;	

	if ( options.thumbSize )	
		this.thumbSize = +options.thumbSize ;	
	if ( options.onClick )	
		this.onClick = options.onClick ;	
	if ( options.iconArrange )	
	{
		if ( options.iconArrange == "grid" ) this.mode = ThumbContainer.GRID_MODE ;
		else if ( options.iconArrange == "smart" ) this.mode = ThumbContainer.TRANS_MODE ;	
		else if ( options.iconArrange == "smart-grid" ) this.mode = ThumbContainer.TRANS_GRID_MODE ;
	}
	if ( options.thumbRenderer )
		this.thumbRenderer = options.thumbRenderer ;
		
	if ( options.tagManager )
		this.tagManager = options.tagManager ;
		
	this.containerDiv = containerDiv ;	

	this.createCanvas() ;	

	this.thumbs = data ;	

	
	
};	

var p = ThumbContainer.prototype;	

ThumbContainer.GRID_MODE = 0 ;	
ThumbContainer.TRANS_MODE = 1 ;	
ThumbContainer.TRANS_GRID_MODE = 2 ;	

ThumbContainer.NAV_FIXED = 0 ;	
ThumbContainer.NAV_HOVER = 1 ;	
ThumbContainer.NAV_HIDDEN = 2 ;	

ThumbContainer.margin = 4 ;	
ThumbContainer.navBarSize = 32 ;	
ThumbContainer.thumbMargin = 4 ;

ThumbContainer.wheelZoom = true ;

ThumbContainer.menuItems = [ { text: "Google Map", icon: "world-icon-small", onClick: function(ctx) { ctx.showMap() ; }},
							 { text: "Time-Line", icon: "clock-icon-small", onClick: function(ctx) { ctx.showTimeline() ; }}
							 
						] ;

p.containerDiv = null ;	
p.thumbs = null ;	
p.canvas = null ;	
p.ctx = null ;	
p.onClick = null ;	
p.onMouseOver = null  ;	
p.onMouseOut = null ;	
p.hoverItem = null ;	
p.currentZoomScale = 2 ;	
p.canvasWidth = 0;	
p.canvasHeight = 0 ;	
p.offsetX = 0 ;	
p.offsetY = 0 ;	
p.tooltipPending = false ;	
p.thumbSize = 64 ;
p.mode = ThumbContainer.GRID_MODE ;	
p.offset = 0 ;	
p.pageCount = 0 ;	
p.navMode = ThumbContainer.NAV_FIXED ;	
p.navBar = null ;	
p.menuBar = null ;
p.thumbRenderer = null ;


ThumbContainer.zoomScales = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0] ;	
  	
p.createCanvas = function()	{	
	
	var obj = this ;	

	$(this.containerDiv).empty() ;	

	// add navigation bar	
	
	if ( this.mode == ThumbContainer.GRID_MODE && this.navMode != ThumbContainer.NAV_HIDDEN ) {	
		this.navBar = $("<div/>", { "class": "thumb-container-nav-bar", 	
					  css: { 	"position": "absolute", 	
								"z-index": 1,
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
	
	// add menu bar
	
	if ( ThumbContainer.menuItems.length > 0 ) 
	{
		var mb = $("<div/>", { 	
					  css: { 	"position": "absolute", 	
								"width": 20, 	
								"height": ThumbContainer.menuItems.length * 36,	
								"display": "none" ,	
								"overflow": "hidden",	
								"padding" : "4px",	
								"top": "10%",	
								"right" : 0,
								"z-index": 100
							} 	
					}).
			appendTo($(this.containerDiv)) ;
		
		
		
		for( var i=0 ; i<ThumbContainer.menuItems.length ; i++ )
		{
			var  btn = $("<button/>", { text: ThumbContainer.menuItems[i].text } ).appendTo(mb) ;
			btn.button( { icons: {	primary: ThumbContainer.menuItems[i].icon }, text: false } ) ;
			btn.click( (function(item) { 
							return function() { item.onClick(obj) ; }; 
						})( ThumbContainer.menuItems[i]) ) ;
		}
	
		
		$(this.containerDiv).hover(function() { mb.toggle() ; }) ;
		
		this.menuBar = mb ;
	
	}
	
	// add thumbnail viewport
	this.thumbViewport = $('<div/>', { css: { overflow: "auto", width: $(this.containerDiv).width(), height: $(this.containerDiv).height() } }).appendTo(this.containerDiv) ;
	
	// add thumbnail view that may be larger than viewport when zoomed
	this.thumbView = $('<div/>', { css: { position: "relative" }}).appendTo(this.thumbViewport) ; 
	
	
	// on shift-click start selection rubberband
	$(this.thumbViewport).bind("mousedown", function(e) {
            if ( e.shiftKey ) 
				obj.handleSelection(e) ;
	});
	
	// setup zoom functionality using the mousewheel
	
	if ( ThumbContainer.wheelZoom )
	{
	    $(this.thumbViewport).bind('mousewheel', function(event, delta) {
			if ( obj.mode != ThumbContainer.GRID_MODE )
			{
				if ( delta > 0 ) obj.zoomIn() ;
				else if ( delta < 0 ) obj.zoomOut() ;
			}
	    });
	}
};

// Handles rubber-banding and thumbnail selection

p.handleSelection = function(e)
{
		
	this.startDrag = true ;
		
	var sw = $(window).width() ;
	var sh = $(window).height() ;
	var cw = $(this.thumbViewport).width() ;
	var ch = $(this.thumbViewport).height() ;
	var ox = $(this.thumbViewport).offset().left ;
	var oy = $(this.thumbViewport).offset().top ;
	
	var relativeX = e.pageX - ox;
    var relativeY = e.pageY - oy;
	
	this.sel_ul_x = relativeX ;
	this.sel_ul_y = relativeY ;

	this.selectionMade = false ;
				
	this.selDiv = $('<div/>', { css: { "width": sw, "height": sh, "z-index": 1200, "background-color": "transparent", "position": "absolute", "left": 0, "top": 0 }}).appendTo('body') ;
	var selBox = $('<div/>', { css: { "width": cw, "height": ch, position: "absolute", "left": ox, "top": oy, "overflow": "hidden" }}).appendTo(this.selDiv) ;
	this.box = $('<div/>', { css: { border: "1px dotted black", position: "absolute", "background-color": "transparent",
		"left": relativeX , "top": relativeY,
		width: "10px", height: "10px"		} }).appendTo(selBox) ;
		
	var that = this ;		
	
	var captureMouseMove = function(e) 
	{
	
		if ( that.startDrag && e.shiftKey )
		{
			var relativeX = e.pageX - ox;
			var relativeY = e.pageY - oy;

			that.sel_lr_x = relativeX ;
			that.sel_lr_y = relativeY ;
			
			var rx, ry, rw, rh ;
		
			if ( relativeX < that.sel_ul_x )
			{
				rx = relativeX ;
				rw = that.sel_ul_x - relativeX ;
			}
			else
			{
				rx = that.sel_ul_x ;
				rw = relativeX - that.sel_ul_x  ;
			}
		
			if ( relativeY < that.sel_ul_y )
			{
				ry = relativeY ;
				rh = that.sel_ul_y - relativeY ;
			}
			else
			{
				ry = that.sel_ul_y ;
				rh = relativeY - that.sel_ul_y  ;
			}
		
		
			that.box.css("left", rx) ;
			that.box.css("top", ry) ;
			that.box.css("width", rw) ;
			that.box.css("height", rh) ;
			
			that.updateSelection(rx, ry, rw, rh) ;
			that.selectionMade = true ;
		
			//console.log( "(" + that.sel_ul_x + "," + that.sel_ul_y + ")" + "->" + "(" + that.sel_lr_x + "," + that.sel_lr_y + ")") ;
			
			
			
		}
	} ;
	
	$(this.selDiv).bind("mousemove", captureMouseMove) ;
	$(this.selDiv).bind("mouseup", function(e) {
		if ( that.startDrag )
		{
			that.startDrag = false ;
		
			that.selDiv.remove() ;
			
			if ( !that.selectionMade )
			{
				$('.thumbnail', that.containerDiv).each(function() {
					var id = $(this).attr('id').substr(6) ;
					that.thumbs[id].selected = false ;
					$(this).removeClass("selected") ;
				}) ;
			
			}
		}
	}) ;
	
	e.preventDefault() ;
} ;

// select items within the given bounding box

p.updateSelection = function(rx, ry, rw, rh)
{
    var that = this ;
	
	$('.thumbnail', this.containerDiv).each(function() {
		var cx = $(this).position().left ;
		var cy = $(this).position().top;
		var cw = $(this).width() ;
		var ch = $(this).height() ;
			
		if ( Math.max(cx, rx) < Math.min(cx + cw, rx + rw) &&
			Math.max(cy, ry) < Math.min(cy + ch, ry + rh) )
		{
			var id = $(this).attr('id').substr(6) ;
			that.thumbs[id].selected = true ;

			$(this).addClass("selected") ;
		}
		
	}) ;
};
/*
p.handleTranslate = function(e) {

	var that = this;
		
	this.startTransX = e.pageX ;
	this.startTransY = e.pageY ;
	
	this.currentTransX = e.pageX ;
	this.currentTransY = e.pageY ;
	
	var handleMouseMove = function(e) {
		var cx = e.pageX ;
		var cy = e.pageY ;
		
		var ox = cx - that.currentTransX ;
		var oy = cy - that.currentTransY ;
		
		that.currentTransX = e.pageX ;
	    that.currentTransY = e.pageY ;
		
		$('.thumbnail', that.containerDiv).each(function() {
			var _ox = $(this).position().left ;
			var _oy = $(this).position().top ;
			$(this).css("left", _ox + ox + "px") ;
			$(this).css("top", _oy + oy + "px") ;
		});
	};
	
	var handleMouseUp  = function(e) {
		$(that.containerDiv).unbind("mousemove", handleMouseMove) ;
		$(that.containerDiv).unbind("mouseup", handleMouseUp) ;
		that.offsetX += that.currentTransX - that.startTransX ;
		that.offsetY += that.currentTransY - that.startTransY ;
	};
	
	$(this.containerDiv).bind("mousemove", handleMouseMove) ;
	$(this.containerDiv).bind("mouseup", handleMouseUp) ;
	

} ;
*/

// navigation (paging) bar drawing
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
			nav += '<li class="pager-item"><a title="Go to page ' + p + '" id="page-' + p + '" href="#">' + p + '</a></li>';	
		}	
	}	

		
			
	if ( page > 1 ) 	
	{	
		p = page - 1 ;	
	
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
	
	var that = this ;	
	$('ul.pager a', this.navBar).bind( "click", function() {	
		var page = this.id.substr(5) ;	
		that.offset = that.pageCount * (page - 1) ;	
		that.draw() ;	
	}) ;	
};	

p.resize = function(e) {	
	console.log(e) ;	
};	

// The container has changed and we need to redraw
p.draw = function() {	

	var cw = $(this.containerDiv).width()  ;	
	var ch = $(this.containerDiv).height() ;	

	this.canvasWidth =  cw ;	
	this.canvasHeight =  ch ;	

	this.redraw(cw, ch) ;	
};	

// Select the appropriate preview url from the media items associated with this document.

ThumbContainer.selectThumbUrl = function(doc)
{
	for( var i=0 ; i<doc.media.length ; i++ )
	{
		var mediaType = doc.media[i] ;
		if ( mediaType.type == "ImageType" )
		{
			if ( mediaType.previews && mediaType.previews.length > 0 )
				return mediaType.previews[0].url ;
		}
		else if ( mediaType.type == "SoundType" )
		{
			if ( mediaType.previews && mediaType.previews.length > 0 )
			{
				for( var j=0 ; j<mediaType.previews.length ; j++ )
				{
					var frmt = mediaType.previews[j].format ;
					if ( frmt == "image/jpeg" || frmt == "image/png" )
						return mediaType.previews[j].url ;
				}
			}
		}
	}
	
	return null ;
} ;

ThumbContainer.selectTooltipText = function(doc)
{
	for( var i=0 ; i<doc.media.length ; i++ )
	{
		var mediaType = doc.media[i] ;
		if ( mediaType.type == "Text" )
		{
			if ( mediaType.text )
				return mediaType.text ;
		}
	}
	
	return null ;

} ;

// This creates each thumbnail div and handles thumbnail interaction
p.createThumbnail = function(i, x, y)
{
	var item = this.thumbs[i] ;
	
	var tm = ThumbContainer.thumbMargin ;
	
	// create the main thumbnail box
	var imgOut = $('<div/>', { "class": "thumbnail", id: "thumb-" + i, css: {  overflow: "hidden", position: "absolute", width: this.thumbSize, height: this.thumbSize, left: x, top: y } }).appendTo(this.thumbView) ;
	// create a place-holder for the "star" icon.
	var trans = $('<div/>', { "class": "thumbnail-overlay", css: {  display: (item.relevant) ? "block" : "none" } }).appendTo(imgOut) ;
	
	// use the thumbRenderer to actually render the item in the box
	this.thumbRenderer.render(item, imgOut, this.thumbViewport) ;
	
	var that = this ;
	
	// if shift-click start selection rubber-band.
	imgOut.bind("mousedown", function(e) {
		if ( e.ctrlKey )
		{
			var id = $(this).attr('id').substr(6) ;
			that.thumbs[id].selected = !that.thumbs[id].selected ;
			$(this).toggleClass("selected") ;
			
		}
	}) ;
	
	// if a click on the star remove relevance marker
	trans.bind("click", function(e) {
		var id = $(this).parent().attr('id').substr(6) ;
		that.thumbs[id].relevant = false ;
		$(this).hide() ;
	}) ;
		
	// setup context menu handler
	
	imgOut.contextMenu("vis-context-menu", {
	  bindings: {
        'relevant': function(t) {
			$(".thumbnail.selected", that.containerDiv).each( function(item) {
				var id = $(this).attr('id').substr(6) ;
				that.thumbs[id].relevant = !that.thumbs[id].relevant ;
				$(".thumbnail-overlay", this).toggle() ;
			}) ;
	    },
        'tags': function(t) {
			//collect all common tags from selected items
			
			var allTags = {} ;
						
			var count = 0 ;
			
			$(".thumbnail.selected", that.containerDiv).each( function(item) {
				var id = $(this).attr('id').substr(6) ;
				var tags = that.thumbs[id].doc.tags ;
			
				count ++ ;
				
				if ( tags ) 
				{
					for( var i=0 ; i<tags.length ; i++ )
					{
						var tag = tags[i] ;
						if ( allTags.hasOwnProperty(tag) )	allTags[tag] ++ ;
						else allTags[tag] = 1 ;
					}
				}
						
			}) ;
			
			for( var tag in allTags )
			{
				if ( allTags[tag] < count ) delete allTags[tag] ;
				else allTags[tag] = 0 ;
			}

			// open the tag editor
			var tagEditor = new TagEditor(allTags, function(_tags) {
				// we will be here when the user closes the tag editor				
				$(".thumbnail.selected", that.containerDiv).each( function(item) {
					var id = $(this).attr('id').substr(6) ;
					var tags = that.thumbs[id].doc.tags ;
					
					if ( !tags ) tags = [] ;
				
					// update tags of selected items based on the user provided tags
					for( tag in _tags )
					{	
						var idx = $.inArray(tag, tags) ;
						if ( _tags[tag] == 1 && idx >= 0 ) delete tags.splice(idx,1) ;
						else if ( _tags[tag] == 2  && idx == -1 ) tags.push(tag) ;
					}
					
					that.thumbs[id].doc.tags = tags ;
					// save tags into permanent storage
					
					that.tagManager.store(that.thumbs[id].doc) ;
				}) ;
				
				that.tagManager.update() ;
			}) ;
          

        },

        'remove': function(t) {

          alert('Trigger was '+t.id+'\nAction was Save');

        },

        'close': function(t) {

          alert('Trigger was '+t.id+'\nAction was Delete');

        }
	}
	  

    });
	
};

// main function for icon arrangement
p.redraw = function(contentWidth, contentHeight)	
{	
	$('.thumbnail', this.thumbViewport).remove() ;
	
	this.thumbView.width(contentWidth) ;
	this.thumbView.height(contentHeight) ;
		
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
			
			if ( item.doc.filtered === true ) continue ;
			
			this.createThumbnail(i, x, y) ;
			
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
		
		var sz = this.thumbSize  ;	

		var options = {} ;
			
		options.snapToGrid = (this.mode == ThumbContainer.TRANS_GRID_MODE) ;
		
		var lmanager = new LabelManager(contentWidth, contentHeight, options) ;		

		
		for( var i=0 ; i<this.thumbs.length ; i++ )	
		{	
			var item = this.thumbs[i] ;	
			
			if ( item.doc.filtered === true ) continue ;

			lmanager.addLabelGraphic(i, item.x * contentWidth, item.y * contentHeight, sz, sz) ;	
		}	

		var res = lmanager.solve() ;	

		for( i = 0 ; i<this.thumbs.length ; i++ )	
		{	
			var item = this.thumbs[i] ;	
			//item.hide() ;	
		}	 	

		for( i = 0 ; i<res.length ; i++ )	
		{	
			var q = res[i] ;	
			var index = q.index ;	

			this.createThumbnail(index, q.x , q.y) ;

		}	

		delete lmanager ;	
	}	
	
	

};	

p.doResize = function()	
{	
	var cw = $(this.thumbViewport).width() ;
	var ch = $(this.thumbViewport).height() ;
	var oldWidth = this.canvasWidth ;
	var oldHeight = this.canvasHeight ;
	
	this.canvasWidth = cw * ThumbContainer.zoomScales[this.currentZoomScale]  ;	
	this.canvasHeight = ch * ThumbContainer.zoomScales[this.currentZoomScale];	
				
    var scaleFactor = (this.canvasWidth - cw)/(oldWidth - cw);	
						
    this.offsetX -= (this.canvasWidth - oldWidth)/2 ;	
    this.offsetY -= (this.canvasHeight - oldHeight)/2 ;	
	
	this.redraw(this.canvasWidth, this.canvasHeight) ;	
};	
			
p.zoomIn  = function()	
{	
	if ( this.currentZoomScale == ThumbContainer.zoomScales.length - 1 ) return ;	
	this.currentZoomScale ++ ;	
			
				
	this.doResize() ;		
};	
			
p.zoomOut = function()	
{	
	if ( this.currentZoomScale == 0 ) return ;	
	this.currentZoomScale --  ;	
 	
	this.doResize() ;	
};	

p.resize = function()	
{	
	this.createCanvas() ;	

	this.draw() ;	
};	

// Show google map
p.showMap = function()	
{	
	var markerImages = [];	
	var markerImages2 = [];	

	for( var i=0 ; i<this.thumbs.length ; i++ )	
	{	
		var data = this.thumbs[i] ;	

		if ( data.doc.hasOwnProperty("rw") && data.doc.rw )
		{
			if ( data.doc.rw.hasOwnProperty("pos") )
			{
				var lat = data.doc.rw.pos.coords.lat ;
				var lon = data.doc.rw.pos.coords.lon ;
				var thumb = ThumbContainer.selectThumbUrl(data.doc) ;
				var tooltip = ThumbContainer.selectTooltipText(data.doc) ;
				
				markerImages.push({ "lat": lat, "lon": lon, "icon": thumb, "tooltip": tooltip, data: data }) ;	
				markerImages2.push({ "lat": lat, "lon": lon, "tooltip": tooltip, data: data }) ;	
			}
		}
	}	
	
	var mapDialog = $('<div/>', { title: "Geographic location of documents"}).appendTo('body') ;

	var that = this ;
	
	var sw = $(window).width() ;	
	var sh = $(window).height() ;
	
	mapDialog.dialog({
			width: sw*2/3,
			height: sh*3/4,
			modal: true,
			open: function(e, ui) {
				var mainMap = new GoogleMap($(this).get(0), that.thumbRenderer, [ 	
				{ type: 'markers', data: markerImages, name: 'Images',	
						minzoom: 12, maxzoom: 24},
				{ type: 'markers', data: markerImages2, name: 'Placemarks',	
						minzoom: 0, maxzoom: 11}						
				]) ;
			}
			
	});
	
};	
	
// Show timeline
p.showTimeline = function()
{
	var sw = $(window).width() ;	
	var sh = $(window).height() ;
	// hack to deal with initialisation
	Timeline.DateTime = SimileAjax.DateTime ;
		
	var timelineDialog = $('<div/>', { title: "Timeline of documents", css: { overflow: "hidden", height: sh*2/3 + "px"}}).appendTo('body');

	var eventSource = new Timeline.DefaultEventSource();
	
	var theme = Timeline.ClassicTheme.create();
	theme.mouseWheel = 'default' ;
	
	var obj = this ;
	
	Timeline.CompactEventPainter.prototype._paintEventIcon = function(commonData, iconData, top, left, metrics, theme) {
	//	var img = SimileAjax.Graphics.createTranslucentImage(iconData.url);
		var iconDiv = this._timeline.getDocument().createElement("div");
		iconDiv.className = 'timeline-event-icon' + ("className" in iconData ? (" " + iconData.className) : "");
		iconDiv.style.left = left + "px";
		iconDiv.style.top = top + "px";
		iconDiv.style.width = iconData.width + "px" ;
		iconDiv.style.height = iconData.height + "px" ;
		
		obj.thumbRenderer.render(iconData.data, $(iconDiv), $(this._eventLayer)) ;
		//iconDiv.appendChild(img);
    
		//if ("tooltip" in commonData && typeof commonData.tooltip == "string") {
		//	iconDiv.title = commonData.tooltip;
		//}
    
		this._eventLayer.appendChild(iconDiv);
   
		return {
			left:   left,
			top:    top,
			width:  metrics.iconWidth,
			height: metrics.iconHeight,
			elmt:   iconDiv
		};
	
	};
	
	Timeline.CompactEventPainter.prototype.paintPreciseInstantEvent = function(evt, metrics, theme, highlightIndex) {
		var commonData = {
			tooltip: evt.getProperty("tooltip") || evt.getText()
		
		};
    
		var iconData = {
			url: evt.getIcon(),
			data: evt._obj.data
		};
		if (iconData.url == null) {
			iconData.url = metrics.defaultIcon;
			iconData.width = metrics.defaultIconWidth;
			iconData.height = metrics.defaultIconHeight;
			iconData.className = "timeline-event-icon-default";
		} else {
			iconData.width = evt.getProperty("iconWidth") || metrics.customIconWidth;
			iconData.height = evt.getProperty("iconHeight") || metrics.customIconHeight;
		}
    
		var labelData = {
			text:       evt.getText(),
			color:      evt.getTextColor() || evt.getColor(),
			className:  evt.getClassName()
		};
    
		var result = this.paintTapeIconLabel(
			evt.getStart(),
			commonData,
			null, // no tape data
			iconData,
			labelData,
			metrics,
			theme,
			highlightIndex
		);

		this._eventIdToElmt[evt.getID()] = result.iconElmtData.elmt;
	};
	

		
	var bandInfos = [
		Timeline.createBandInfo({
			date:           "Jun 28 2009 00:00:00 GMT",
			width:          "90%", 
			intervalUnit:   Timeline.DateTime.MONTH, 
			intervalPixels: 100,
			eventSource:    eventSource,
			theme:          theme,
            eventPainter:   Timeline.CompactEventPainter,
            eventPainterParams: {
                iconLabelGap:     5,
                labelRightMargin: 20,
                        
                iconWidth:        64, // These are for per-event custom icons
                iconHeight:       64,
                       
                stackConcurrentPreciseInstantEvents: {
                    limit: 10,
                    iconWidth:              64,
                    iconHeight:             64
                }
			
            },
	
			zoomIndex:      10,
			zoomSteps:      new Array(
				{pixelsPerInterval: 280,  unit: Timeline.DateTime.HOUR},
				{pixelsPerInterval: 140,  unit: Timeline.DateTime.HOUR},
				{pixelsPerInterval:  70,  unit: Timeline.DateTime.HOUR},
				{pixelsPerInterval:  35,  unit: Timeline.DateTime.HOUR},
				{pixelsPerInterval: 400,  unit: Timeline.DateTime.DAY},
				{pixelsPerInterval: 200,  unit: Timeline.DateTime.DAY},
				{pixelsPerInterval: 100,  unit: Timeline.DateTime.DAY},
				{pixelsPerInterval:  50,  unit: Timeline.DateTime.DAY},
				{pixelsPerInterval: 400,  unit: Timeline.DateTime.MONTH},
				{pixelsPerInterval: 200,  unit: Timeline.DateTime.MONTH},
				{pixelsPerInterval: 100,  unit: Timeline.DateTime.MONTH},
				{pixelsPerInterval: 400,  unit: Timeline.DateTime.YEAR},
				{pixelsPerInterval: 200,  unit: Timeline.DateTime.YEAR},
				{pixelsPerInterval: 100,  unit: Timeline.DateTime.YEAR}				// DEFAULT zoomIndex
			)
		}),
		Timeline.createBandInfo({
			date:           "Jun 28 2009 00:00:00 GMT",
			width:          "10%", 
			intervalUnit:   Timeline.DateTime.YEAR, 
			intervalPixels: 200,
			showEventText:  false, 
			trackHeight:    0.5,
			trackGap:       0.2,
			eventSource:    eventSource,
			overview:       true
		})
	];
	bandInfos[1].syncWith = 0;
	bandInfos[1].highlight = true;
  
	var tl = Timeline.create(timelineDialog.get(0), bandInfos);
	
	var event_data = { "dateTimeFormat": "iso8601", events: [] } ;
	
	for( var i=0 ; i<this.thumbs.length ; i++ )	
	{	
		var data = this.thumbs[i] ;	

		if ( data.doc.hasOwnProperty("rw") && data.doc.rw )
		{
			if ( data.doc.rw.hasOwnProperty("time") )
			{
				// title ?
				var d = new Date(data.doc.rw.time.dateTime) ;
				
				function ISODateString(d) {
					function pad(n){
						return n<10 ? '0'+n : n;
					}
					return d.getUTCFullYear()+'-'
					+ pad(d.getUTCMonth()+1)+'-'
					+ pad(d.getUTCDate());
				}
				var dateStr = ISODateString(d) ;
				
				var event = { 
					id:  data.doc.id, 
					start: data.doc.rw.time.dateTime,
					icon:  ThumbContainer.selectThumbUrl(data.doc),
					data: data
				//	title: ThumbContainer.selectTooltipText(data.doc)
				} ;
				
				event_data.events.push(event) ;
			}
		}
		
	}
	
	eventSource.loadJSON(event_data, document.location.href); 
	
	

	timelineDialog.dialog({
		width: sw*2/3,
		height: sh*3/4,
		modal: true,
		resizable: false 
	}) ;	

};

}); //end require
	