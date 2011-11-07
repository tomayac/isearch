UI = function(  )	
{	
		
};	
   	
var p = UI.prototype;   	

UI.showPage = function(container, title_, callBack)	
{	
	var width = $(container).width() ;
	var height = $(container).height() ;
	
	var box = $('<div/>', { "class": "page-container", css: { "width": width, "height": height } }).appendTo(container) ;
	var titleBar = $('<div/>', { "class": "page-titlebar" }).appendTo(box) ;
	var title = $('<span/>', { "class": "page-title", text: title_ }).appendTo(titleBar) ;
	var closeButton = $('<a/>', { "class": "page-titlebar-close", href: "javascript:void(0)" }).appendTo(titleBar) ;
	//var closeIcon = $('<span/>').appendTo(closeButton) ;
	var pageContent = $('<div/>', { "class": "page-content" } ).appendTo(box) ;
			
	closeButton.click(function(){
		box.remove() ;
	}) ;
	
	if ( callBack ) callBack(pageContent) ;

};	
