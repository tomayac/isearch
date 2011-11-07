DummyThumbRenderer = function() {	
	
};	

var p = DummyThumbRenderer.prototype;	

DummyThumbRenderer.thumbMargin = 4 ;

p.render = function(item, container, visBox)
{
	var tm = DummyThumbRenderer.thumbMargin ;
	var w = $(container).width() ;
	var h = $(container).height() ;
	
	var img = $('<div/>', { css: { border: "1px solid black", position: "absolute", left: tm, top: tm, width: w - tm - tm, height: h - tm - tm }  }).appendTo(container) ;
	
} ;


/////////////////////////////////////////////////

DefaultThumbRenderer = function() {	
	this.hoverItem = null ;	
	
};	

var p = DefaultThumbRenderer.prototype;	
p.tooltipPending = true ;	
p.hoverItem = null ;


DefaultThumbRenderer.thumbMargin = 4 ;

p.render = function(item, container, visBox)
{

	var mediaTypes  = this.getMediaTypes(item) ;
	
	var tm = DefaultThumbRenderer.thumbMargin ;
	var w = $(container).width() ;
	var h = $(container).height() ;
	
	
	if ( mediaTypes.count == 1 )
	{
		var img = $('<div/>', { css: { position: "absolute", left: tm, top: tm, width: w - tm - tm, height: h - tm - tm }  }).appendTo(container) ;
		img.thumb(ThumbContainer.selectThumbUrl(item.doc)) ;
	}
	else // stack metaphor
	{
		
		var div1 = $('<div/>', 
			{ css: { position: "absolute", left: 2*tm, right: 0, top: 2*tm, bottom: 0, 
				"border-style": "solid", "border-width": "0px " + tm + "px " + tm + "px 0px", "border-color": "#dfdfdf" }}).appendTo(container) ;
		var div2 = $('<div/>', 
			{ css: { position: "absolute", left: tm, right: tm, top: tm, bottom: tm, 
			"border-style": "solid", "border-width": "0px " + tm + "px " + tm + "px 0px", "border-color": "#afafaf" }}).appendTo(container) ;
		var img = $('<div/>', { css: { position: "absolute", left: 0,  top: 0, width: w - tm - tm, height: h - tm - tm,
"border": "1px solid black"		}  }).appendTo(container) ;
		img.thumb(ThumbContainer.selectThumbUrl(item.doc)) ;
	}
	
	// setup tooltip
	var obj = this ;
	img.mouseover( 	function(e) {
					obj.showTooltip(item, container, visBox) ;
				}
	) ;
		
	img.mouseout( 	function(e) {
					if ( !$('.tooltip').is(':visible') ) obj.hoverItem = null ;
			}
	) ;
		
	
	/*		
	img.click( function(e) {
		if ( obj.onClick ) obj.onClick(item) ;
	}) ;
*/

} ;

p.renderContents = function(tooltip, thumb, mediaType)
{
	var mediaTypes  = this.getMediaTypes(thumb) ;
		
	
			
	// if multi-media display toolbar
		
	var that = this;
	if ( mediaTypes.count > 1 )
	{
		$('.tooltip-toolbar', tooltip).remove() ;
		var tb = $('<div/>', { "class": "tooltip-toolbar" }).appendTo(tooltip) ;
			
		for ( mtype in mediaTypes.types )
		{
			var btn = $('<a/>', { href: "javascript:void(0)", "id": mtype, "class": (( mtype == mediaType ) ? ' selected': '') }).appendTo(tb) ;
			
			btn.click(function() {
				var thisMediaType = this.id ;
										
				var current = $('.media-preview', tooltip) ;
					
				var currentId = current.attr('id') ;
					
				if ( currentId != thisMediaType )
				{
					current.remove() ;
					that.renderContents(tooltip, thumb, thisMediaType) ;
					$(this).toggleClass('selected') ;
					$('a#' + currentId, tooltip).toggleClass('selected') ;
				}
				
			}) ;
		}
	}
	$('.media-preview', tooltip).remove() ;
	var tooltipContents = $('<div/>', { "class": "media-preview", "id": mediaType }).appendTo(tooltip) ;
	
	var desc = ThumbContainer.selectTooltipText(thumb.doc) ;
			
		//	mediaType = "Object3D" ;
	// currently for the following media types I do a slide show of preview images
	if ( mediaType == "ImageType" ||  mediaType == "Object3D" || mediaType == "VideoType" )
	{
		var imageUrls = [] ;
		
		var slideShow = $('<div/>', { "id": "slides"} ).appendTo(tooltipContents) ;
		var slideContainer = $('<div/>', { "class": "slides-container", css: { width: tooltip.width() }}).appendTo(slideShow) ;
					
		
		for( var i=0 ; i<thumb.doc.media.length ; i++ )
		{
			var media = thumb.doc.media[i] ;
			
			if ( mediaType != media.type ) continue ;
		
			if ( media.type  == "ImageType" || media.type == "Object3D" || media.type == "VideoType")
			{
				for(var j=0 ; j<media.previews.length ; j++ )
				{
					var preview = media.previews[j] ;
				
					if ( ! /^image\//.test(preview.format) ) continue ;
				
					imageUrls.push(preview.url) ;
					
					var cntSlide = $('<div/>', { "class": "slide", css: { width: tooltip.width(), height: tooltip.width() }}).appendTo(slideContainer) ;
					var slide = $("<img/>", { src: preview.url }).appendTo(cntSlide) ;
					
				}
			}
		}
		

		slideShow.slides({
				preload: true,
				container: 'slides-container',
				pagination: true,
				effect: 'fade, slide',
				crossfade: 'true',
				preloadImage: '',
				play: 500,
				pause: 2500
				}) ;
		
		
	
	if ( desc ) {
		contents = "<br/><p style='max-height: 60px; overflow: hidden; text-overflow: ellipsis'>" + desc + "</p>" ;
		tooltipContents.append(contents) ;
		}
	
	//	tooltip.html(contents) ;
		
	}
	else if ( mediaType == "SoundType" )
	{
		for( var i=0 ; i<thumb.doc.media.length ; i++ )
		{
			var media = thumb.doc.media[i] ;
			
			if ( mediaType != media.type ) continue ;
			
			var urlOgg, urlMp3, urlPng, urlSvg, urlJpg, urlImg ;
			
			for(var j=0 ; j<media.previews.length ; j++ )
			{
				var  preview = media.previews[j] ;
				
				if ( preview.format == "image/png" ) urlPng = preview.url ;
				if ( preview.format == "image/jpg" ) urlJpg = preview.url ;
				else if ( preview.format == "image/svg+xml" ) urlSvg = preview.url ;
				else if ( preview.format == "audio/mpeg" ) urlMp3 = preview.url ;
				else if ( preview.format == "audio/ogg" ) urlOgg = preview.url ;
			}
			
			if ( urlSvg && Modernizr.svg ) urlImg = urlSvg ;
			else if ( urlPng ) urlImg = urlPng ;
			else if ( urlJpg ) urlImg = urlJpg ;
			
			var anim = $('<div/>', { css: { width: tooltip.width() } }).appendTo(tooltipContents) ;
			var audioRdr = new AudioRenderer(anim, urlMp3, urlOgg, urlImg, "flower") ;
			
			tooltip.bind('thide', function() { 
				audioRdr.terminate() ; 
			}) ; 
			
			if ( desc ) 
				$('<p/>', { css: { "max-height": "60px", "overflow": "hidden", "text-overflow": "ellipsis"}, text: desc}).appendTo(tooltipContents) ;
		
			break ;
		}
		
	}
}

p.getMediaTypes = function(thumb)
{
	var mediaTypes  = {} ;
	var mcount = 0 ;
	for( var i=0 ; i  < thumb.doc.media.length ; i++ )
	{
		var media = thumb.doc.media[i] ;
			
		if ( media.type == "Text" ) continue ;
		if ( !mediaTypes.hasOwnProperty(media.type) ) { mediaTypes[media.type] = 1 ; mcount ++ ; }
		else {
			mediaTypes[media.type] ++ ;
		}
	}
	
	return { 'count': mcount, 'types': mediaTypes } ;
};	

// popups medium detail view

p.doShowTooltip = function(thumb, container, visBox) 	
{	
	// find the upper left corner of the thumbnail in window coordinates	

	var ele = container ;
	
	var offset = $(visBox).offset() ;	
	var posx = ele.position().left + offset.left ;	
	var posy = ele.position().top  + offset.top ;	
	var ts = ele.width() ;	
	
	var ele = $(".tooltip") ;	
	var tooltip, that = this ;	
		
	if ( ele.length == 0 )	
	{	
		var tooltip = $('<div/>')	
					.addClass("tooltip")	
					.appendTo('body');	
					
		tooltip.mouseleave( function(e) {
			$(this).hide() ;
			that.hoverItem = null ;
			$(this).trigger('thide') ;
			
		}) ;

	}	
	else tooltip = ele ;	

	tooltip.css("width", ts + ts) ;	
	
	// see what type of media we have
		
	// select default media to show
	var mediaType = null ;
	if ( thumb.defaultMedia )
		mediaType = thumb.defaultMedia ;
	else if ( thumb.doc.media.length > 0 )
		mediaType = thumb.doc.media[0].type ;
		
	// now render the contents
		
	this.renderContents(tooltip, thumb, mediaType) ;
		
	var ttw = tooltip.outerWidth() ;	
	var tth = tooltip.outerHeight() ;	
		
	var ww = $(window).width() + $(window).scrollLeft();	
	var wh = $(window).height() + $(window).scrollTop() ;	
	
	// center	
	posx -= (ttw - ts)/2 ;
	posy -= (tth - ts)/2 ;
	
	if ( posx + ttw < ww )	
		tooltip.css("left", posx)	;
	else 	
		tooltip.css("left", ww-ttw-2)	

	if ( posy + tth < wh  )	
		tooltip.css("top", posy)	;
	else 	
		tooltip.css("top", wh-tth-2)	

		console.log(posx + ' ' + posy) ;
	tooltip.fadeIn('fast') ;	

};	

p.showTooltip = function(item, container, visBox)	
{	
	
	var obj = this ;	
	this.tooltipPending = true ;	
	this.hoverItem = item ;
	
	
	
	setTimeout( function() { 	
		if ( obj.hoverItem === item ) obj.doShowTooltip(item, container, visBox) ;
	}, 500) ;	

};	

p.hideTooltip = function(item) 	
{	
	this.hoverItem = null ;
	$(".tooltip").hide().css("left", -1000).css("top", -1000) ;	
	

};	