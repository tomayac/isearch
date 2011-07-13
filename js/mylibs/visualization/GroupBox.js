GroupBox = function( container, items )
{
	this.init(container, items) ;
	
}
   
var p = GroupBox.prototype;   


p.init = function( container, items )
{
	$(container).empty() ;
	

	for(var i=0 ; i<items.length ; i++ )
	{
		var item = items[i] ;
		var thumb = document.createElement("div") ;
		$(thumb).addClass("thumbnail").appendTo(container) ;
		
		var link = $("<a/>", {
			href: "javascript:void(0)",
			click: item.clicked
			}
		).appendTo(thumb) ;
		
		var pic = $("<div/>", {
			id: "picture",
			css: {
					"background-image": 'url("' + item.url + '")' 
				}
			}).appendTo(link) ;
			
		
	}

}
