

IconContainer = function(data, canvasDiv) {
   this.parseXML(data);
   
   this.canvas = document.getElementById(canvasDiv);
   this.ctx = this.canvas.getContext("2d");
}

var p = IconContainer.prototype;

p.icons = [] ;
p.images = [] ;
p.canvas = null ;
p.ctx = null ;
p.iconSize = 32 ;
  
p.parseXML = function(data) {
	var xmlDoc = jQuery.parseXML( data ), xml = $( xmlDoc );
	var icons = this.icons ;
	
	xml.find("document").each(function(index){
		var url = $(this).find("thumb").attr("url") ;
		icons.push(url) ;
	}) ;
}

p.draw = function() {

	




}