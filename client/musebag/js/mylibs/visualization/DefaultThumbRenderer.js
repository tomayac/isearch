define("mylibs/visualization/DefaultThumbRenderer",   function() {

DummyThumbRenderer = function() {	
	
};	

var p = DummyThumbRenderer.prototype;	

DummyThumbRenderer.thumbMargin = 4 ;

p.render = function(item, container, options)
{
	var tm = DummyThumbRenderer.thumbMargin ;
	var w = $(container).width() ;
	var h = $(container).height() ;
	if ( options.hover ) this.hover = options.hover ;
	else this.hover = false ;
	
	var img = $('<div/>', { css: { border: "1px solid black", position: "absolute", left: tm, top: tm, width: w - tm - tm, height: h - tm - tm }  }).appendTo(container);	
} ;


/////////////////////////////////////////////////

DefaultThumbRenderer = function() {	
	this.hoverItem = null ;	
	
};	

var p = DefaultThumbRenderer.prototype;	
p.tooltipPending = true ;	
p.hoverItem = null ;


DefaultThumbRenderer.thumbMargin = 4 ;

p.render = function(item, container, options)
{
	this.modalities = options.modalities ;
	this.selected = options.selected ;

	var mediaTypes  = this.getMediaTypes(item) ;
	
	var tm = DefaultThumbRenderer.thumbMargin ;
	var w = $(container).width() ;
	var h = $(container).height() ;
	
	if ( options.square ) h = w ;
		
	var visBox = options.viewport ;
	if ( options.hover ) this.hover = options.hover ;
	else this.hover = false ;
	
	this.onSimilar = options.onSimilar ;
	this.docPreviewMode = options.docPreview ;
	
	this.onClick = options.onClick ;
		
	var docid = ( item.doc.coid ) ? item.doc.coid : item.doc.id ;
	
	if ( mediaTypes.count == 1 )
	{
		var img = $('<div/>', { "docid": docid, css: {  position: "absolute", left: tm, top: tm, width: w - tm - tm, height: h - tm - tm }  }).appendTo(container) ;
		img.thumb(ThumbContainer.selectThumbUrl(item.doc, options.selected)) ;
		
		this.img = img ;
	}
	else // stack metaphor
	{
		
		var div1 = $('<div/>', 
			{ css: { position: "absolute", left: 2*tm, right: 0, top: 2*tm, bottom: 0, 
				"border-style": "solid", "border-width": "0px " + tm + "px " + tm + "px 0px", "border-color": "#dfdfdf" }}).appendTo(container) ;
		var div2 = $('<div/>', 
			{ css: { position: "absolute", left: tm, right: tm, top: tm, bottom: tm, 
			"border-style": "solid", "border-width": "0px " + tm + "px " + tm + "px 0px", "border-color": "#afafaf" }}).appendTo(container) ;
		var img = $('<div/>', { "docid": docid, css: { position: "absolute", left: 0,  top: 0, width: w - tm - tm, height: h - tm - tm,
"border": "1px solid black"		}  }).appendTo(container) ;
		if(img.thumb) {
		  img.thumb(ThumbContainer.selectThumbUrl(item.doc, options.selected)) ;
		}
		this.img = img ;
	}
	
		
	$(img).draggable({opacity: '0.7', cursor: 'move', helper: function(e) {
		
	  if(!$('#draghelper').length) {
	    $('<div/>', { css: { position : 'absolute', width: w , height: h, "z-index": 1000  }, id : 'draghelper'  }).appendTo('body');
	  }
	  
	  var helper = $('#draghelper');
		helper.thumb(ThumbContainer.selectThumbUrl(item.doc, options.modalities)) ;
		return helper ;
	
	}}) ;
	
	// setup tooltip mode
	
	var obj = this ;
	
	if ( options.hover )
	{
		img.mouseover( 	function(e) {
					obj.showTooltip(item, container, visBox, false) ;
				}
		) ;
		
		img.mouseout( 	function(e) {
					if ( !$('.tooltip').is(':visible') ) obj.hoverItem = null ;
			}
		) ;
	}
	else
	{
	
					
		img.click(function(e) {
			if ( e.shiftKey || e.ctrlKey ) return ;
			else	obj.showTooltip(item, container, visBox, true) ;
		});
		
		img.mouseout( 	function(e) {
					if ( !$('.tooltip').is(':visible') ) obj.hoverItem = null ;
			}
		) ;
	}  
		
	
	/*		
	img.click( function(e) {
		if ( obj.onClick ) obj.onClick(item) ;
	}) ;
*/

} ;

p.renderDocument = function(doc, mediaType)
{
	var url = '' ;
	for( var i=0 ; i<doc.media.length ; i++ )
	{
		var media = doc.media[i] ;
		
		if ( media.type != mediaType ) continue ;
		else {
			url = media.url ;
			break ;
		}
	}
	
	if ( this.docPreviewMode == "popup")
	{
		var sw = $(window).width() ;	
		var sh = $(window).height() ;
	
		var docPreview = $('<div/>', { title: "Document Preview"}).appendTo('body') ;
	
	
		var ytRx = new RegExp("https:\/\/www.youtube.com\/watch\\?v=(.*)") ;
		var match = ytRx.exec(url) ;
	
		var contents ;

		if ( mediaType == "VideoType"  &&	match.length > 1 )
			contents = $('<iframe/>', { width: "640", height: "385", marginWidth: "0",  marginHeight:"0",  frameBorder:"0",  	scrolling:"auto", 
				src: "http://www.youtube.com/embed/" + match[1]}).appendTo(docPreview) ;

		else
			contents = $('<iframe/>', { width: "100%", height: "100%", marginWidth: "0",  marginHeight:"0",  frameBorder:"0",  scrolling:"auto", src: url}).appendTo(docPreview) ;
	
		docPreview.dialog({
			width: 0.9*sw,
			height: 0.9*sh,
			modal: true,
			close: function() {
				docPreview.empty() ;
			}
		});
	}
	else if ( this.docPreviewMode == "url")
	{
	
		window.open(url, '_blank');
  		window.focus();

	
	}
	
}

p.renderContents = function(tooltip, thumb, mediaType)
{
	var mediaTypes  = this.getMediaTypes(thumb) ;
		
	// if multi-media display toolbar
		
	$('.tooltip-toolbar', tooltip).remove() ;
	
	var that = this;
	if ( mediaTypes.count > 1 )
	{
		
		var tb = $('<div/>', { "class": "tooltip-toolbar" }).appendTo(tooltip) ;
			
		for ( var i=0 ; i<mediaTypes.types.length ; i++ )
		{
			mtype = mediaTypes.types[i] ;
			
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
				//	$('a#' + currentId, tooltip).toggleClass('selected') ;
				}
				
				return false ;
			}) ;
		}
	}
		
	$('.tooltip-header', tooltip).remove() ;
	var header = $('<div/>', { "class": "tooltip-header" }).appendTo(tooltip);
	
	if ( this.onSimilar ) {
	
		var findSimilar = $('<a/>', {text: "Find similar", href: "javascript:void(0);"}).appendTo(header) ;
	
		findSimilar.click(
	
		function(){
			that.onSimilar(thumb.doc.id) ;
			return false ;
		}) ;
	}
	
	$('.media-preview', tooltip).remove() ;
	var tooltipContents = $('<div/>', { "class": "media-preview", "id": mediaType  }).appendTo(tooltip) ;
	
	var desc = ThumbContainer.selectTooltipText(thumb.doc) ;
			
		//	mediaType = "Object3D" ;
	// currently for the following media types I do a slide show of preview images
	if ( mediaType == "ImageType" ||  mediaType == "Object3D" || mediaType == "VideoType" )
	{
		var imageUrls = [] ;
		
		var slideShow = $('<div/>', { "id": "slides"} ).appendTo(tooltipContents) ;
		var slideContainer = $('<a/>', { "class": "slides-container", css: { width: tooltip.width() }, "href": "javascript:void(0)"})
		.appendTo(slideShow)
		.click(function() {
				if ( that.onClick ) {
					that.onClick(thumb.doc, mediaType) ;
				
				}
				else
					that.renderDocument(thumb.doc, mediaType) ;
				return false ;
		}) ;		
		
				
		for( var i=0 ; i<thumb.doc.media.length ; i++ )
		{
			var media = thumb.doc.media[i] ;
			
			if ( mediaType != media.type ) continue ;
		
			if ( media.type  == "ImageType" || media.type == "Object3D" || media.type == "VideoType")
			{
				for(var j=0 ; j<media.previews.length ; j++ )
				{
					var preview = media.previews[j] ;
				
				/*	if ( ! /^image\//.test(preview.format) ) continue ; */
				
					imageUrls.push(preview.url) ;
					
					var cntSlide = $('<div/>', { "class": "slide", 
						css: { width: tooltip.width() + 'px', height: tooltip.width() + 'px', 'line-height': tooltip.width() + 'px', 'text-align': 'center' }
					}).appendTo(slideContainer) ;
					
					var slide = $("<img/>", { load: function() {
						if ( this.width < this.height )
							$(this).attr('height', '100%') ;
						else
							$(this).attr('width', '100%') ;
						},
					src: preview.url,
					css: { 'vertical-align' : 'middle'}}).appendTo(cntSlide) ;
					
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
				else if ( preview.format == "image/jpg" ||  preview.format == "image/jpeg" ) urlJpg = preview.url ;
				else if ( preview.format == "image/svg+xml" ) urlSvg = preview.url ;
				else if ( preview.format == "audio/mpeg" ) urlMp3 = preview.url ;
				else if ( preview.format == "audio/ogg" ) urlOgg = preview.url ;
				else if ( preview.format == "" ) urlUnknown = preview.url ;
			}
			
			if ( urlSvg && Modernizr.svg ) urlImg = urlSvg ;
			else if ( urlPng ) urlImg = urlPng ;
			else if ( urlJpg ) urlImg = urlJpg ;
			else if ( urlUnknown ) urlImg = urlUnknown ;
			
			
			var anim = $('<div/>', { css: { width: tooltip.width() }}).appendTo(tooltipContents) ;
			var audioRdr = new AudioRenderer(anim, urlMp3, urlOgg, urlImg, media.url, "flower", thumb.doc.startTime) ;
			
			$("#audiovis", anim).click(function() {
				if ( that.onClick ) {
					that.onClick(thumb.doc, mediaType) ;
				
				}
				else
					that.renderDocument(thumb.doc, mediaType) ;
					
				return false ;
			}) ;
			
			
			tooltip.bind('thide', function() { 
				audioRdr.terminate() ; 
			}) ;
		
			break ;
		}
		
	}
	
	if(desc) {
	  $('<p/>', { css: { "float": "left", "max-height": "60px", "overflow": "hidden", "text-overflow": "ellipsis"}, text: desc}).appendTo(tooltipContents);
	}
	
	/**
	 * Triantafillos:
	 * reverse geocode location of object and display it in the tooltip
	 * if location is given as query, compute distance with object and display it in the tooltip
	 */
	if (thumb.doc.rw && thumb.doc.rw.pos) {
	  var location =  new google.maps.LatLng(thumb.doc.rw.pos.coords.lat, thumb.doc.rw.pos.coords.lon);
	  var geocoder = new google.maps.Geocoder();
	  geocoder.geocode({'latLng': location}, function(results, status) {
	  
	    if (status == google.maps.GeocoderStatus.OK) {
	      tooltipContents.append("<br><p>Location: "+results[0].formatted_address+"</p>");
		}
		else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
	      tooltipContents.append("<br><p>Location: no address for the coordinates: ("+thumbLatitude+","+thumbLongitude+")</p>");
	    }
		
		if($("#queryContainer .Location").length) {
		  var currentLatitude = $("#queryContainer .Location").attr('title').split(" ")[0];
		  var currentLongitude = $("#queryContainer .Location").attr('title').split(" ")[1];
		  var R = 6371;
		  var dLat = (currentLatitude-thumbLatitude) *  Math.PI / 180;
		  var dLon = (currentLongitude-thumbLongitude) *  Math.PI / 180;
		  var lat1 = thumbLatitude *  Math.PI / 180;
		  var lat2 = currentLatitude *  Math.PI / 180;
		  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
		  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		  var distance = R * c;
		  tooltipContents.append("<p>Distance: "+distance.toFixed(3)+" km</p>");
		}
	  });
	}
	else tooltipContents.append("<br><p>Location: unavailable</p>");
	
	

	
}

p.getMediaTypes = function(thumb)
{
	var mediaTypes  = [] ;
	var mcount = 0 ;
	
	for(var i=0 ; i<this.modalities.length ; i++ )
	{
		var mod = this.modalities[i] ;
		for( var j=0 ; j < thumb.doc.media.length ; j++ )
		{
			var media = thumb.doc.media[j] ;
			
			if ( media.type == "Text" ) continue ;
		
	
			if ( ( mod == "image" && media.type == "ImageType" ) ||
				 ( mod == "3d" && media.type == "Object3D" ) ||
				 ( mod == "audio" && media.type == "SoundType" ) ||
				 ( mod == "video" && media.type == "VideoType" ) )
			{
				if ( $.inArray(media.type, mediaTypes) == -1 ) { 
					mcount ++ ;
					mediaTypes.push(media.type) ;
				}
				
			}
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
	var mediaTypes = this.getMediaTypes(thumb) ;
	
	if ( thumb.defaultMedia )
		mediaType = thumb.defaultMedia ;
	else if ( mediaTypes.count > 0 )
	{
		var sel = this.selected[0] ;
		
		if ( sel == "image" && $.inArray("ImageType", mediaTypes.types) != -1 ) mediaType = "ImageType" ; 
		else if ( sel == "3d" && $.inArray("Object3D", mediaTypes.types) != -1 ) mediaType = "Object3D" ; 
		else if ( sel == "audio" && $.inArray("SoundType", mediaTypes.types) != -1 ) mediaType = "SoundType" ; 
		else if ( sel == "video" && $.inArray("VideoType", mediaTypes.types) != -1 ) mediaType = "VideoType" ; 
	}
		
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
		tooltip.css("left", ww-ttw-2);	

	if ( posy + tth < wh  )	
		tooltip.css("top", posy)	;
	else 	
		tooltip.css("top", wh-tth-2);	

		//console.log(posx + ' ' + posy) ;
	tooltip.fadeIn('fast') ;	

};	

p.showTooltip = function(item, container, visBox, showNow)	
{	
	
	var obj = this ;	
	this.tooltipPending = true ;	
	this.hoverItem = item ;
	
	
	if ( showNow == true )
		obj.doShowTooltip(item, container, visBox) ;
	else
		setTimeout( function() { 	
			if ( obj.hoverItem === item ) obj.doShowTooltip(item, container, visBox) ;
		}, 500) ;	

};	

p.hideTooltip = function(item) 	
{	
	this.hoverItem = null ;
	$(".tooltip").hide().css("left", -1000).css("top", -1000) ;	
	

};	

return new DefaultThumbRenderer ;

}) ;
