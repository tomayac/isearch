UI = function(  )
{
	
}
   
var p = UI.prototype;   

// Create accordion element 
// takes a list of pane objects where each object has the following attributes
// id: is the element id of div elements to hold the data for each pane
// name: is the text that will appear in the header
// collapsed: (true/false) set the initial state to collapsed or expanded
// onExpand: callback to call when an element is expanded
// returns the outer dom element. 


UI.accordionCreate = function(items)
{	
	var outerDiv = $("<div/>", { "data-role": "collapsible-set" }) ;
	
	for ( var i=0 ; i<items.length ; i++ )
	{ 
		var eleDiv = $("<div/>", { id: items[i].id + "-container", "data-theme":"c", "data-role": "collapsible", "data-collapsed": (items[i].collapsed) ? "true" : "false" }).appendTo(outerDiv) ;
		$("<h3/>", { text: items[i].name } ).appendTo(eleDiv) ;
		var innerDiv = $("<div/>", {id: items[i].id, css: { "overflow": "auto" }}).appendTo(eleDiv) ;
	
		eleDiv.collapsible({refresh:true});
		
		if ( items[i].onExpand ) eleDiv.bind("expand", items[i].onExpand) ;
	}
	
	return outerDiv ;
}

UI.accordionToggle = function(itemId)
{
	var ele = $("#" + itemId + "-container") ;
	

	if ( $(ele).attr("data-collapsed") == "true" )
		$(ele).trigger("expand") ;
	else
		$(ele).trigger("collapse") ;
}		

UI.showPage = function(title, callBack)
{
	$('#popup-page h1').text(title) ;
	
	$('#popup-page').bind("pageshow", function(e) { 
		callBack($('#popup-view', this)) ;
	}).dialog() ;
	
	$.mobile.changePage("#popup-page") ;

}

	