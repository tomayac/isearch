define("mylibs/visualization/AudioThumbRenderer",   function() {

AudioThumbRenderer = function() {	
	
};	


var p = AudioThumbRenderer.prototype;	

AudioThumbRenderer.thumbMargin = 4 ;

p.render = function(item, container, options)
{

	this.selected = options.selected ;

	var tm = DefaultThumbRenderer.thumbMargin ;
	var w = $(container).width() ;
	var h = $(container).height() ;
	
	var tw = h, th = h ;
		;
	var visBox = options.viewport ;
		
	var docid = ( item.doc.coid ) ? item.doc.coid : item.doc.id ;
	
	var img = $('<div/>', { "docid": docid, css: {   width: tw, height: th }   }).appendTo(container) ;
	var thumbDiv = $('<div/>', { css: {  position: "absolute", left: tm, top: tm, width: tw - tm - tm, height: th - tm - tm }}).appendTo(img) ;
	thumbDiv.thumb(ThumbContainer.selectThumbUrl(item.doc, options.selected)) ;
	var thumbDivOverlay = $('<div/>', { "class": "play-hover", css: { position: "absolute", left: tm, top: tm, width: tw - tm - tm, height: th - tm - tm }}).appendTo(img) ;
	
	var textDiv = $('<div/>', { "class": "audio-description", css: { position: "absolute", left: tw + tm, top: tm, width: w - tw - tm, height: th - tm - tm }}).appendTo(img) ;

	var desc = item.doc.tableDesc ;
	
	if ( !desc ) desc = ThumbContainer.selectTooltipText(item.doc) ;
	var textSpan = $('<span/>', { text: desc  }).appendTo(textDiv) ;
		
	this.img = thumbDiv ;

	// setup tooltip mode
	
	var obj = this ;
	
	thumbDivOverlay.click(function(e) {
		obj.showTooltip(item, container, visBox, true) ;
		return false ;
	});
		
	img.mouseout( 	function(e) {
		if ( !$('.tooltip').is(':visible') ) obj.hoverItem = null ;
	}) ;
		

} ;

// popups medium detail view

p.doShowTooltip = function(thumb, container, visBox) 	
{	
	// find the upper left corner of the thumbnail in window coordinates	

	var ele = container ;
	
	var offset = $(visBox).offset() ;	
	var posx = ele.position().left + offset.left ;	
	var posy = ele.position().top  + offset.top ;	
	var ts = ele.height() ;	
	
	
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
	
			
	// now render the contents
		
	this.renderContents(tooltip, thumb) ;
		
	var ttw = tooltip.outerWidth() ;	
	var tth = tooltip.outerHeight() ;	
		
	var ww = $(window).width() + $(window).scrollLeft();	
	var wh = $(window).height() + $(window).scrollTop() ;	
	
	// center	
//	posx -= (ttw - ts)/2 ;
	posy -= (tth - ts)/2 ;
	
	if ( posx + ttw < ww )	
		tooltip.css("left", posx)	;
	else 	
		tooltip.css("left", ww-ttw-2);	

	if ( posy + tth < wh  )	
		tooltip.css("top", posy)	;
	else 	
		tooltip.css("top", wh-tth-2);	

		console.log(posx + ' ' + posy) ;
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

p.renderContents = function(tooltip, thumb)
{
		
	$('.media-preview', tooltip).remove() ;
	var tooltipContents = $('<div/>', { "class": "media-preview", "id": "SoundType"  }).appendTo(tooltip) ;
	
	var desc = ThumbContainer.selectTooltipText(thumb.doc) ;
		
	var that = this ;
	for( var i=0 ; i<thumb.doc.media.length ; i++ )
	{
		var media = thumb.doc.media[i] ;
							
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
		var audioRdr = new AudioRenderer(anim, urlMp3, urlOgg, urlImg, media.url, "waveform", thumb.doc.startTime, "sm2") ;
			
	/*	$("#audiovis", anim).click(function() {
			that.renderDocument(thumb.doc) ;
		}) ;
	*/		
			
		tooltip.bind('thide', function() { 
			audioRdr.terminate() ; 
		}) ;
		
		break ;
	}
		
	
	if(desc) {
	  $('<p/>', { css: { "float": "left", "max-height": "60px", "overflow": "hidden", "text-overflow": "ellipsis"}, text: desc}).appendTo(tooltipContents);
	}
	
	
}

return new AudioThumbRenderer ;

}) ;
