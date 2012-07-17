require(["jquery", "mylibs/visualization/ThumbRendererFactory", "libs/timeline_2.3.0/timeline_js/timeline-api", "!js/libs/jquery.mousewheel.min.js"
	],
    function($, rf) {
ThumbContainer = function(containerDiv, data, options, ctx) {	
  
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
		else if ( options.iconArrange == "list" ) this.mode = ThumbContainer.LIST_MODE ;
	}
	
	if (options.thumbRenderer )
		this.thumbRenderer = rf.create(options.thumbRenderer) ;
	else
		this.thumbRenderer = rf.create("default") ;
		
		
	if ( options.tagManager )
		this.tagManager = options.tagManager ;
		
	if ( options.navMode )
		this.navMode = options.navMode ;
		
	if ( options.feedback )
		this.feedback = options.feedback ;
		
	this.containerDiv = containerDiv ;	

	this.ctx = ctx ;
		
	this.createCanvas() ;	

	this.thumbs = data ;	
	
};	

var p = ThumbContainer.prototype;	

ThumbContainer.GRID_MODE = 0 ;	
ThumbContainer.TRANS_MODE = 1 ;	
ThumbContainer.TRANS_GRID_MODE = 2 ;	
ThumbContainer.LIST_MODE = 3 ;	

ThumbContainer.NAVBAR_FIXED = 0 ;	
ThumbContainer.NAVBAR_HOVER = 1 ;	
ThumbContainer.NAVBAR_HIDDEN = 2 ;	

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
p.navBarMode = ThumbContainer.NAVBAR_FIXED ;	
p.navBar = null ;	
p.menuBar = null ;
p.thumbRenderer = null ;
p.navMode = null ;


ThumbContainer.zoomScales = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0] ;	
  	
p.createCanvas = function()	{	
	
	var obj = this ;	

	$(this.containerDiv).empty() ;	

	// add navigation bar	
	
	if ( ( this.mode == ThumbContainer.GRID_MODE || this.mode == ThumbContainer.LIST_MODE ) 
			&& this.navBarMode != ThumbContainer.NAV_HIDDEN ) {	
		this.navBar = $("<div/>", { "class": "thumb-container-nav-bar", 	
					  css: { 	"position": "absolute", 	
								"z-index": 1,
								"width": "100%", 	
								"height": ThumbContainer.navBarSize,	
								"display": ( this.navBarMode == ThumbContainer.NAV_HOVER ) ? "none" : "block",	
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
	this.thumbViewport = $('<div/>', { css: { overflow: "auto" , width: $(this.containerDiv).width(), height: $(this.containerDiv).height() } }).appendTo(this.containerDiv) ;
	
	$(this.thumbViewport).droppable({
		drop: function(e, ui) {
		var draggable = ui.draggable;
			alert( 'The square with ID "' + draggable.attr('docid') + '" was dropped onto me!' );
		}
	} );
	// add thumbnail view that may be larger than viewport when zoomed
	this.thumbView = $('<div/>', { css: { position: "relative", "overflow": "hidden" }}).appendTo(this.thumbViewport) ; 
	
	
	// on shift-click start selection rubberband
	
	if ( this.navMode == 'feedback' )
	{
		$(this.thumbViewport).unbind("mousedown") ;
		
		$(this.thumbViewport).bind("mousedown", function(e) {
            if ( e.shiftKey ) 
				obj.handleSelection(e) ;
		});
	}
	
	// setup zoom functionality using the mousewheel
	
	if ( ThumbContainer.wheelZoom )
	{
	    $(this.thumbViewport).bind('mousewheel', function(event, delta) {
			if ( obj.mode != ThumbContainer.GRID_MODE && obj.mode != ThumbContainer.LIST_MODE )
			{
				if ( delta > 0 ) obj.zoomIn() ;
				else if ( delta < 0 ) obj.zoomOut() ;
				
				event.preventDefault();
				return false; 
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
	
		if ( that.startDrag && e.shiftKey  )
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
			
			e.preventDefault() ;
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
		first = '<li class="pager-first first"><a title="First page" id="page-1' + '" href="#">&lt;&lt;</a></li>';	
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
		return false ;
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

ThumbContainer.selectThumbUrl = function(doc, modalities)
{
	//var modOptions = this.ctx.modalities ;
	
	for(var m=0 ; m<modalities.length ; m++ )
	{
		var mod = modalities[m] ;
		for(var i=0 ; i<doc.media.length ; i++ )
		{
			var mediaType = doc.media[i] ;
			if ( mod == "image" && mediaType.type == "ImageType" )
			{
				if ( mediaType.previews && mediaType.previews.length > 0 )
				{
					var frmt = mediaType.previews[0].format ;
					if ( frmt == "image/svg+xml" )
						return mediaType.previews[0].url ;
					else if ( frmt == "image/jpeg" || frmt == "image/png" )
						return mediaType.previews[0].url ;
					else
						return mediaType.previews[0].url ;
						
				}
			}
			else if ( mod == "3d" && mediaType.type == "Object3D" )
			{
				if ( mediaType.previews && mediaType.previews.length > 0 )
					return mediaType.previews[0].url ;
			}
			else if ( mod == "audio" && mediaType.type == "SoundType"  )
			{
				if ( mediaType.previews && mediaType.previews.length > 0 )
				{
					for( var j=0 ; j<mediaType.previews.length ; j++ )
					{
						var frmt = mediaType.previews[j].format ;
						if ( frmt == "image/svg+xml" )
							return mediaType.previews[j].url ;
						else if ( frmt == "image/jpeg" || frmt == "image/png" )
							return mediaType.previews[j].url ;
					}
				}
			}
			else if ( mod == "video" && mediaType.type == "VideoType" )
			{
				if ( mediaType.previews && mediaType.previews.length > 0 )
					return mediaType.previews[0].url ;
			
			}
		}
	}
	return null ;
} ;

ThumbContainer.selectDefaultMediaType = function(doc, modalities)
{
	for( var i=0 ; i<modalities.length ; i++ )
	{
		var mod = modalities[i] ;
		
		for( var j=0 ; j<doc.media.length ; j++ )
		{
			var mediaType = doc.media[j].type ;
			if ( mod == "image" && mediaType == "ImageType" ) return mediaType ;
			else if ( mod == "3d" && mediaType == "Object3D" ) return mediaType ;
			else if ( mod == "audio" && mediaType == "SoundType" ) return mediaType ;
			else if ( mod == "video" && mediaType == "VideoType" ) return mediaType ;
		}
	}

	return "" ;
}

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

ThumbContainer.modalFilter = function(doc, modalities)
{
	var filtered = true ;
	
	for( var i=0 ; i<doc.media.length ; i++ )
	{
		var mediaType = doc.media[i] ;
		if ( mediaType.type == "ImageType" && ( $.inArray("image", modalities) != -1 ) )
		{
			filtered = false ;
			break ;
	
		}
		else if ( mediaType.type == "Object3D" && ( $.inArray("3d", modalities) != -1 ) )
		{
			filtered = false ;
			break ;
		}
		else if ( mediaType.type == "SoundType" && ( $.inArray("audio", modalities) != -1 ) )
		{	
			filtered = false ;
			break ;
		}
		else if ( mediaType.type == "VideoType" && ( $.inArray("video", modalities) != -1 ) )
		{	
			filtered = false ;
			break ;
		}
	}
	
	return filtered ;
};



// This creates each thumbnail div and handles thumbnail interaction
p.createThumbnail = function(i, x, y, sw, tclass)
{
	var item = this.thumbs[i] ;
	
	var tm = ThumbContainer.thumbMargin ;
	
	var that = this ;
		// create the main thumbnail box
	var imgOut = $('<div/>', { "class": tclass || "thumbnail", "id": "thumb-" + i, css: {  /*overflow: "hidden",*/ position: "absolute", width: sw || this.thumbSize, height: this.thumbSize, left: x, top: y } }).appendTo(this.thumbView) ;
	
	if ( this.navMode == 'feedback' )
	{
		var trans = $('<div/>', { "class": "thumbnail-overlay" }).appendTo(imgOut) ;
	
				
		if ( $.inArray("likes", this.feedback) >= 0 )
		{
			var relBtn = $('<a/>', { href: "javascript:void(0)", "id": "Relevance", "title": "Toggle relevance", css: { "float": "right" }} ).appendTo(trans) ;
	
			if ( !item.doc.relevant ) relBtn.addClass("inactive") ;
	
			relBtn.click(function(e) {
				item.doc.relevant = !item.doc.relevant ;
				$(this).toggleClass("inactive") ;
				
				that.ctx.tagManager.toggleRelevance(item.doc) ;
				e.stopImmediatePropagation() ;
				
				return false ;
			}) ;
		}
		
		if ( $.inArray("tags", this.feedback) >= 0)
		{
			var tagBtn = $('<a/>', { href: "javascript:void(0)", "id": "TagEdit", "title": "Edit tags", css: { "float": "right" }} ).appendTo(trans) ;
		
			tagBtn.click( 
			( 
				function(item) 	{ 
					return function() {
						// open the tag editor
			
						var popupDiv = $('<div/>', { id: "tags-popup", "class": "tag-editor", title: "Add/Edit Tags"} ) ;
			
						var tags = item.doc.tags ;
						var allTags = {} ;
			
						var count = 1 ;
			
						if ( tags ) 
						{
							for( var i=0 ; i<tags.length ; i++ )
							{
								var tag = tags[i] ;
								allTags[tag] = 2 ;
							}
						}
									
						var tagEditor = new TagEditor(popupDiv, allTags, that.ctx.tagManager.tags) ;
						
						$(popupDiv).dialog( { 
							close: 	function(event, ui) {
								var tags = item.doc.tags ;
					
								if ( !tags ) tags = [] ;
				
								// get user provided tags ;
								var _tags = tagEditor.tags ;
						
								// update tags of selected items based on the user provided tags
								for( tag in _tags )
								{	
									var idx = $.inArray(tag, tags) ;
									if ( _tags[tag] == 1 && idx >= 0 ) delete tags.splice(idx,1) ;
									else if ( _tags[tag] == 2  && idx == -1 ) tags.push(tag) ;
								}
					
								item.doc.tags = tags ;
								// save tags into permanent storage
					
								that.ctx.tagManager.store(item.doc) ;
							}
						}) ; 
						
						return false ;
					};
					
					
				}
				
			)(item)
			
			);
		}
	}
			
	var that = this ;
	
	// if shift-click start selection rubber-band.
	imgOut.bind("mousedown", function(e) {
		if ( e.ctrlKey )
		{
			var id = $(this).attr('id').substr(6) ;
			that.thumbs[id].selected = !that.thumbs[id].selected ;
			$(this).toggleClass("selected") ;
			e.stopPropagation() ;
			return true ;
			
		}
	}) ;

	// setup context menu handler
	
	imgOut.contextMenu("vis-context-menu", {
	  bindings: {
        'relevant': function(t) {
			$(".thumbnail.selected", that.containerDiv).each( function(item) {
				var id = $(this).attr('id').substr(6) ;
				that.thumbs[id].doc.relevant = !that.thumbs[id].doc.relevant ;
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
			
			var popupDiv = $('<div/>', { id: "tags-popup", "class": "tag-editor", title: "Add/Edit Tags"} ) ;
			
			var tagEditor = new TagEditor(popupDiv, allTags, that.ctx.tagManager.tags) ;
						
			$(popupDiv).dialog( { 
				close: function(event, ui) 	{ // we will be here when the user closes the tag editor				
					$(".thumbnail.selected", that.containerDiv).each( function(item) {
						var id = $(this).attr('id').substr(6) ;
						var tags = that.thumbs[id].doc.tags ;
					
						if ( !tags ) tags = [] ;
				
						// get user provided tags ;
						var _tags = tagEditor.tags ;
						
						// update tags of selected items based on the user provided tags
						for( tag in _tags )
						{	
							var idx = $.inArray(tag, tags) ;
							if ( _tags[tag] == 1 && idx >= 0 ) delete tags.splice(idx,1) ;
							else if ( _tags[tag] == 2  && idx == -1 ) tags.push(tag) ;
						}
					
						that.thumbs[id].doc.tags = tags ;
						// save tags into permanent storage
					
						that.ctx.tagManager.store(that.thumbs[id].doc) ;
					}) ;
				
					
				}
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
	
	// use the thumbRenderer to actually render the item in the box
	this.thumbRenderer.render(item, imgOut, { viewport: this.thumbViewport, selected: this.ctx.filterBar.modalities(), modalities: this.ctx.modalities, hover: (this.navMode=='browse')?true:false }) ;
	
	
	
	
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

		var sh = ( this.navBarMode != ThumbContainer.NAVBAR_HIDDEN ) ? (contentHeight - ThumbContainer.navBarSize - m ) : contentHeight - m ;	
		var sw = contentWidth - m ;	

		var nc = Math.floor(sw/of) ;	
		var nr = Math.floor(sh/of) ;	
		this.pageCount = nr * nc ;	
		this.offset = this.pageCount * Math.floor(this.offset / this.pageCount) ;	

		if ( this.pageCount == 0 ) return ;	

		var x = m, y = m ;	
		var r = 0, c = 0 ;	
		
		var itemCount = 0 ;
		for(var i=0 ; i< this.thumbs.length; i++)
		{
			var item = this.thumbs[i] ;	
			if ( item.doc.filtered === true ) continue ;
			if ( ThumbContainer.modalFilter(item.doc, this.ctx.filterBar.modalities()) == true ) continue ;
			itemCount++ ;
		}
			

		for( var i=this.offset ; i<Math.min(this.offset + this.pageCount, this.thumbs.length) ; i++ )	
		{	
			var item = this.thumbs[i] ;	
			
			if ( item.doc.filtered === true ) continue ;
			if ( ThumbContainer.modalFilter(item.doc, this.ctx.filterBar.modalities()) == true ) continue ;
			
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

		if ( this.navBarMode != ThumbContainer.NAV_HIDDEN )	
		{	
			var page = Math.floor(this.offset/this.pageCount) ;	
			var maxPage = Math.ceil(itemCount/this.pageCount) ;	
			this.redrawNavBar(page+1, maxPage, contentWidth) ;	
		}	

	}	
	else if ( this.mode == ThumbContainer.LIST_MODE )	
	{	
		// compute layout	
		
		var m = ThumbContainer.margin ;	
		var of = this.thumbSize + m ;	

		var sh = ( this.navBarMode != ThumbContainer.NAVBAR_HIDDEN ) ? (contentHeight - ThumbContainer.navBarSize - m ) : contentHeight - m ;	
		var sw = contentWidth - m ;	

		var nr = Math.floor(sh/of) ;	
		this.pageCount = Math.floor(sh/of) ;
		this.offset = this.pageCount * Math.floor(this.offset / this.pageCount) ;	

		if ( this.pageCount == 0 ) return ;	

		var x = m, y = m ;	
		var r = 0, c = 0 ;	
		
		var itemCount = 0 ;
		for(var i=0 ; i< this.thumbs.length; i++)
		{
			var item = this.thumbs[i] ;	
			if ( item.doc.filtered === true ) continue ;
			if ( ThumbContainer.modalFilter(item.doc, this.ctx.filterBar.modalities()) == true ) continue ;
			itemCount++ ;
		}
			

		for( var i=this.offset ; i<Math.min(this.offset + this.pageCount, this.thumbs.length) ; i++ )	
		{	
			var item = this.thumbs[i] ;	
			
			if ( item.doc.filtered === true ) continue ;
			if ( ThumbContainer.modalFilter(item.doc, this.ctx.filterBar.modalities()) == true ) continue ;
			
			this.createThumbnail(i, x, y, sw, ( i % 2 ) ? "list-thumbnail list-thumbnail-odd" : "list-thumbnail list-thumbnail-even") ;
			
			c++ ;	
			y += of ;	
		}	

		if ( this.navBarMode != ThumbContainer.NAV_HIDDEN )	
		{	
			var page = Math.floor(this.offset/this.pageCount) ;	
			var maxPage = Math.ceil(itemCount/this.pageCount) ;	
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
			if ( ThumbContainer.modalFilter(item.doc, this.ctx.filterBar.modalities()) == true ) continue ;

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

	for( var i=this.thumbs.length-1 ; i>=0 ; i-- )	
	{	
		var data = this.thumbs[i] ;	

		if ( data.doc.hasOwnProperty("rw") && data.doc.rw )
		{
			if ( data.doc.rw.hasOwnProperty("pos") )
			{
				var lat = data.doc.rw.pos.coords.lat ;
				var lon = data.doc.rw.pos.coords.lon ;
				var thumb = ThumbContainer.selectThumbUrl(data.doc, this.ctx.filterBar.modalities()) ;
				var tooltip = ThumbContainer.selectTooltipText(data.doc) ;
				
				
				markerImages.push({ "lat": lat, "lon": lon, "icon": thumb, "tooltip": tooltip, data: data }) ;	
				markerImages2.push({ "lat": lat, "lon": lon, "tooltip": tooltip, "score": i/this.thumbs.length, data: data }) ;	
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
				var mainMap = new GoogleMap($(this).get(0), that.thumbRenderer, that.ctx.filterBar.modalities(), [ 	
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
	theme.autoWidth = false ;
	
	var event_data = { "dateTimeFormat": "iso8601", events: [] } ;
	
	var mindate = new Date(), maxdate = new Date() ;
	
	for( var i=0 ; i<this.thumbs.length ; i++ )	
	{	
		var data = this.thumbs[i] ;	

		if ( data.doc.hasOwnProperty("rw") && data.doc.rw )
		{
			if ( data.doc.rw.hasOwnProperty("time") )
			{
				// title ?
				var d = new Date(data.doc.rw.time.dateTime) ;
				
				if ( d < mindate ) mindate = d ;
				if ( d > maxdate ) maxdate = d ;
				
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
					icon:  ThumbContainer.selectThumbUrl(data.doc, this.ctx.filterBar.modalities()),
					data: data
				//	title: ThumbContainer.selectTooltipText(data.doc)
				} ;
				
				event_data.events.push(event) ;
			}
		}
		
	}
	
	//theme.timeline_start = mindate ;
	//theme.timeline_stop = maxdate ;
	
	var obj = this ;
	
	Timeline.CompactEventPainter.prototype._paintEventIcon = function(commonData, iconData, top, left, metrics, theme) {
	//	var img = SimileAjax.Graphics.createTranslucentImage(iconData.url);
		var iconDiv = this._timeline.getDocument().createElement("div");
		iconDiv.className = 'timeline-event-icon' + ("className" in iconData ? (" " + iconData.className) : "");
		iconDiv.style.left = left + "px";
		iconDiv.style.top = top + "px";
		iconDiv.style.width = iconData.width + "px" ;
		iconDiv.style.height = iconData.height + "px" ;
		
		obj.thumbRenderer.render(iconData.data, $(iconDiv), { viewport: $(this._eventLayer), selected: obj.ctx.filterBar.modalities(), modalities: obj.ctx.modalities }) ;
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
	
	
	Timeline.CompactEventPainter.prototype.paintStackedPreciseInstantEvents = function(events, metrics, theme, highlightIndex) {
    var limit = "limit" in this._params.stackConcurrentPreciseInstantEvents ? 
        this._params.stackConcurrentPreciseInstantEvents.limit : 10;
    var moreMessageTemplate = "moreMessageTemplate" in this._params.stackConcurrentPreciseInstantEvents ? 
        this._params.stackConcurrentPreciseInstantEvents.moreMessageTemplate : "%0 More Events";
    var showMoreMessage = limit <= events.length - 2; // We want at least 2 more events above the limit.
                                                      // Otherwise we'd need the singular case of "1 More Event"

    var band = this._band;
    var getPixelOffset = function(date) {
        return Math.round(band.dateToPixelOffset(date));
    };
    var getIconData = function(evt) {
        var iconData = {
            url: evt.getIcon(),
			data: evt._obj.data
        };
        if (iconData.url == null) {
            iconData.url = metrics.defaultStackIcon;
            iconData.width = metrics.defaultStackIconWidth;
            iconData.height = metrics.defaultStackIconHeight;
            iconData.className = "timeline-event-icon-stack timeline-event-icon-default";
        } else {
            iconData.width = evt.getProperty("iconWidth") || metrics.customIconWidth;
            iconData.height = evt.getProperty("iconHeight") || metrics.customIconHeight;
            iconData.className = "timeline-event-icon-stack";
        }
        return iconData;
    };
    
    var firstIconData = getIconData(events[0]);
    var horizontalIncrement = 5;
    var leftIconEdge = 0;
    var totalLabelWidth = 0;
    var totalLabelHeight = 0;
    var totalIconHeight = 0;
    
    var records = [];
    for (var i = 0; i < events.length && (!showMoreMessage || i < limit); i++) {
        var evt = events[i];
        var text = evt.getText();
        var iconData = getIconData(evt);
        var labelSize = this._frc.computeSize(text);
        var record = {
            text:       text,
            iconData:   iconData,
            labelSize:  labelSize,
            iconLeft:   firstIconData.width + i * horizontalIncrement - iconData.width
        };
        record.labelLeft = firstIconData.width + i * horizontalIncrement + metrics.iconLabelGap;
        record.top = totalLabelHeight;
        records.push(record);
        
        leftIconEdge = Math.min(leftIconEdge, record.iconLeft);
        totalLabelHeight += labelSize.height;
        totalLabelWidth = Math.max(totalLabelWidth, record.labelLeft + labelSize.width);
        totalIconHeight = Math.max(totalIconHeight, record.top + iconData.height);
    }
    if (showMoreMessage) {
        var moreMessage = String.substitute(moreMessageTemplate, [ events.length - limit ]);
    
        var moreMessageLabelSize = this._frc.computeSize(moreMessage);
        var moreMessageLabelLeft = firstIconData.width + (limit - 1) * horizontalIncrement + metrics.iconLabelGap;
        var moreMessageLabelTop = totalLabelHeight;
        
        totalLabelHeight += moreMessageLabelSize.height;
        totalLabelWidth = Math.max(totalLabelWidth, moreMessageLabelLeft + moreMessageLabelSize.width);
    }
    totalLabelWidth += metrics.labelRightMargin;
    totalLabelHeight += metrics.labelBottomMargin;
    totalIconHeight += metrics.iconBottomMargin;
    
    var anchorPixel = getPixelOffset(events[0].getStart());
    var newTracks = [];
    
    var trackCount = Math.ceil(Math.max(totalIconHeight, totalLabelHeight) / metrics.trackHeight);
    var rightIconEdge = firstIconData.width + (events.length - 1) * horizontalIncrement;
    for (var i = 0; i < trackCount; i++) {
        newTracks.push({ start: leftIconEdge, end: rightIconEdge });
    }
    var labelTrackCount = Math.ceil(totalLabelHeight / metrics.trackHeight);
    for (var i = 0; i < labelTrackCount; i++) {
        var track = newTracks[i];
        track.end = Math.max(track.end, totalLabelWidth);
    }

    var firstTrack = this._fitTracks(anchorPixel, newTracks);
    var verticalPixelOffset = firstTrack * metrics.trackHeight + metrics.trackOffset;
    
    var iconStackDiv = this._timeline.getDocument().createElement("div");
    iconStackDiv.className = 'timeline-event-icon-stack';
    iconStackDiv.style.position = "absolute";
    iconStackDiv.style.overflow = "visible";
    iconStackDiv.style.left = anchorPixel + "px";
    iconStackDiv.style.top = verticalPixelOffset + "px";
    iconStackDiv.style.width = rightIconEdge + "px";
    iconStackDiv.style.height = totalIconHeight + "px";
	
	//iconDiv.style.width = iconData.width + "px" ;
	//	iconDiv.style.height = iconData.height + "px" ;
		
	obj.thumbRenderer.render(iconData.data, $(iconStackDiv), { viewport: $(this._eventLayer), selected: obj.ctx.filterBar.modalities(), modalities: obj.ctx.modalities, square: true }) ;
		
   // iconStackDiv.innerHTML = "<div style='position: relative'></div>";
    this._eventLayer.appendChild(iconStackDiv);
    
    var self = this;
    var onMouseOver = function(domEvt) {
        try {
            var n = parseInt(this.getAttribute("index"));
            var childNodes = iconStackDiv.firstChild.childNodes;
            for (var i = 0; i < childNodes.length; i++) {
                var child = childNodes[i];
                if (i == n) {
                    child.style.zIndex = childNodes.length;
                } else {
                    child.style.zIndex = childNodes.length - i;
                }
            }
        } catch (e) {
        }
    };
    var paintEvent = function(index) {
        var record = records[index];
        var evt = events[index];
        var tooltip = evt.getProperty("tooltip") || evt.getText();
		var iconData = getIconData(evt) ;
        
        var labelElmtData = self._paintEventLabel(
            { tooltip: tooltip },
            { text: record.text },
            anchorPixel + record.labelLeft,
            verticalPixelOffset + record.top,
            record.labelSize.width, 
            record.labelSize.height, 
            theme
        );
        labelElmtData.elmt.setAttribute("index", index);
        labelElmtData.elmt.onmouseover = onMouseOver;
        
        var img = SimileAjax.Graphics.createTranslucentImage(record.iconData.url);
        var iconDiv = self._timeline.getDocument().createElement("div");
        iconDiv.className = 'timeline-event-icon' + ("className" in record.iconData ? (" " + record.iconData.className) : "");
        iconDiv.style.left = record.iconLeft + "px";
        iconDiv.style.top = record.top + "px";
        iconDiv.style.zIndex = (records.length - index);
		var imgDiv = self._timeline.getDocument().createElement("div");
        iconDiv.appendChild(imgDiv);
	  
       // iconDiv.setAttribute("index", index);
     //   iconDiv.onmouseover = onMouseOver;
		obj.thumbRenderer.render(iconData.data, $(imgDiv), { viewport: $(self._eventLayer), selected: obj.ctx.filterBar.modalities(), modalities: obj.ctx.modalities }) ;
		//obj.thumbRenderer.render(iconData.data, $(imgDiv), $(self._eventLayer), { modalities: obj.ctx.filterBar.modalities() }) ;
        
        iconStackDiv.firstChild.appendChild(iconDiv);
        
     //   var clickHandler = function(elmt, domEvt, target) {
     //       return self._onClickInstantEvent(labelElmtData.elmt, domEvt, evt);
    //    };
        
     //   SimileAjax.DOM.registerEvent(iconDiv, "mousedown", clickHandler);
      //  SimileAjax.DOM.registerEvent(labelElmtData.elmt, "mousedown", clickHandler);
        
        self._eventIdToElmt[evt.getID()] = iconDiv;
    };
    for (var i = 0; i < records.length; i++) {
        paintEvent(i);
    }
    
    if (showMoreMessage) {
        var moreEvents = events.slice(limit);
        var moreMessageLabelElmtData = this._paintEventLabel(
            { tooltip: moreMessage },
            { text: moreMessage },
            anchorPixel + moreMessageLabelLeft,
            verticalPixelOffset + moreMessageLabelTop,
            moreMessageLabelSize.width, 
            moreMessageLabelSize.height, 
            theme
        );
        
        var moreMessageClickHandler = function(elmt, domEvt, target) {
            return self._onClickMultiplePreciseInstantEvent(moreMessageLabelElmtData.elmt, domEvt, moreEvents);
        };
        SimileAjax.DOM.registerEvent(moreMessageLabelElmtData.elmt, "mousedown", moreMessageClickHandler);
        
        for (var i = 0; i < moreEvents.length; i++) {
            this._eventIdToElmt[moreEvents[i].getID()] = moreMessageLabelElmtData.elmt;
        }
    }
    //this._createHighlightDiv(highlightIndex, iconElmtData, theme);
};

var cDate = new Date(parseInt((mindate.getTime() + maxdate.getTime())/2)) ;
  
	var bandInfos = [
		Timeline.createBandInfo({
			date:           mindate,
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
                    limit: 5,
                    iconWidth:              64,
                    iconHeight:             64
                }
			
            },
	
			zoomIndex:      0,
			zoomSteps:      new Array(
			//	{pixelsPerInterval: 280,  unit: Timeline.DateTime.HOUR},
			//	{pixelsPerInterval: 140,  unit: Timeline.DateTime.HOUR},
			//	{pixelsPerInterval:  70,  unit: Timeline.DateTime.HOUR},
			//	{pixelsPerInterval:  35,  unit: Timeline.DateTime.HOUR},
			//	{pixelsPerInterval: 400,  unit: Timeline.DateTime.DAY},
			//	{pixelsPerInterval: 200,  unit: Timeline.DateTime.DAY},
			//	{pixelsPerInterval: 100,  unit: Timeline.DateTime.DAY},
			//	{pixelsPerInterval:  50,  unit: Timeline.DateTime.DAY},
				{pixelsPerInterval: 400,  unit: Timeline.DateTime.MONTH},
				{pixelsPerInterval: 200,  unit: Timeline.DateTime.MONTH},
				{pixelsPerInterval: 100,  unit: Timeline.DateTime.MONTH}
				,
				{pixelsPerInterval: 400,  unit: Timeline.DateTime.YEAR},
				{pixelsPerInterval: 200,  unit: Timeline.DateTime.YEAR},
				{pixelsPerInterval: 100,  unit: Timeline.DateTime.YEAR}				// DEFAULT zoomIndex
			)
		})
		,
		Timeline.createBandInfo({
			date:           mindate,
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
	
	
	
	eventSource.loadJSON(event_data, document.location.href); 
	
	

	timelineDialog.dialog({
		width: sw*2/3,
		height: sh*3/4,
		modal: true,
		resizable: false,
		zIndex: 500
	}) ;	

};

}); //end require
	
