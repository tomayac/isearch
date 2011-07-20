GroupBox = function( container, items ) {
	this.init(container, items) ;
};

GroupBox.thumbSize = 128 ;
GroupBox.thumbSpacing = 10 ;
GroupBox.navFixed = true ;
   
var p = GroupBox.prototype;   

p.thumbs = null ;
p.offset = 0 ;

p.init = function( container, items ) {

	$(container).empty() ;
	
	this.offset = 0 ;

	var h = GroupBox.thumbSize + 2*GroupBox.thumbSpacing ;
	var scrollWidth = (GroupBox.thumbSize + GroupBox.thumbSpacing)*items.length + GroupBox.thumbSpacing + 100;
	
	
	var outer = $('<div/>', { 
		css: { "overflow": "hidden", 
				"position": "absolute", 
				left: "32px", right: "32px",	
				height: h
			} }).appendTo(container) ;
	

	var thumbBox = $('<div/>', 
		{ 
			css: { 
				width: scrollWidth, 
				position: "absolute", 
				height: "100%", 
				left: "0px"
			}
	}).appendTo(outer) ;
	
	
	var leftArrow = $('<div/>', { css: { "position": "absolute", width: "32px", left: "0px", 
			height: h,
	}}).appendTo( container ) ;
	
	var rightArrow = $('<div/>', { css: { "position": "absolute", width: "32px", right: "0px", 
			height: h,
	}}).appendTo( container ) ;
		
	var that = this ;
	/*	
	$(leftArrow).hover(	function() { 
		if ( scrollWidth + that.offset > outer.width() ) {
			$(this).addClass("left_nav_arrow") ; 
		}
	},	function() {
			$(this).removeClass("left_nav_arrow") ; 
	}) ;
			
	$(rightArrow).hover(	function() { 
		if ( that.offset < 0 ) {
			$(this).addClass("right_nav_arrow") ; 
		}
	},	function() {
		$(this).removeClass("right_nav_arrow") ; 
	}) ;
		*/
		
	$(outer).mousemove(function(e) {
		var position = $(this).offset().left;
 
		var local = e.pageX - position ;
		
		if ( local < outer.width()/2 )
		{
			rightArrow.removeClass("right_nav_arrow") ;
			
			if ( scrollWidth + that.offset > outer.width() ) {
				leftArrow.addClass("left_nav_arrow") ; 
			}
		}
		else
		{
			leftArrow.removeClass("left_nav_arrow") ;
			
			if ( that.offset < 0 ) {
				rightArrow.addClass("right_nav_arrow") ; 
			}
		}	
	}) ;
	$(leftArrow).click( function() { 	
		if ( scrollWidth + that.offset > outer.width() )
		{
			that.offset -= GroupBox.thumbSize ;
			thumbBox.animate({"left": that.offset}, 500) ;
		}
	}) ;
	
	$(rightArrow).click( function() { 	
		if ( that.offset < 0 )
		{
			that.offset += GroupBox.thumbSize ;
			thumbBox.animate({"left": that.offset}, 500) ;
		}
	}) ;
	
	this.thumbs = [] ;
	
	for(var i=0 ; i<items.length ; i++ )
	{
		var item = items[i] ;
		var thumb_ = new Thumbnail(item.url, GroupBox.thumbSize) ;
		
		
		var link = $("<a/>", {
			href: "javascript:void(0)",
			click: item.clicked,
			css: { "float": "left", margin: GroupBox.thumbSpacing}
			}
		).appendTo(thumbBox) ;
		
		
		var thumb = $("<div/>", { width: GroupBox.thumbSize, height: GroupBox.thumbSize} ) ;
		$(thumb).appendTo(link) ;
		
		var pic = $("<canvas/>").appendTo(thumb) ;
		
		pic.width = pic.height = GroupBox.thumbSize ;
		
		var ctx = $(pic).get(0).getContext("2d");
		
		thumb_.show(ctx, 0, 0) ;
		
		this.thumbs.push(thumb_) ;
		
	}

};
