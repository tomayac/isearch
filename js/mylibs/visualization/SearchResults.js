SearchResults = function( data )
{
	this.clusters = new Object() ;
	this.docs = [] ;
	
	if ( typeof data == 'string' )
		this.parseXML(data) ;
	else	
		this.parseJSON(data) ;
}
   
var p = SearchResults.prototype;   

p.docs = null ;
p.clusters = null ;


p.parseClustersXML = function( data, cl )
{
	if ( data.length == 0  ) return ;
			
	var level = data.attr("level") ;
			
	cl.level = level ;
	cl.nodes = [] ;
	cl.children = [] ;
	
	data.children("node").each(function(index){
		var docidx = $(this).attr("docidx") ; ;
		var x = $(this).attr("x") ;
		var y = $(this).attr("y") ;
				
		var obj = { "idx": docidx, "x": x, "y": y } ;
				
		cl.nodes.push(obj) ;
	}) ; 
	
	var _this = this ;
	
	data.children("cluster").each(	function(index){
		var ch = new Object ;
				
		_this.parseClustersXML($(this), ch) ;				
		cl.children.push(ch) ;
	}) ; 
}

p.parseClustersJSON = function( data, cl )
{
	if ( data == undefined  ) return ;
			
	var level = data.level ;
			
	cl.level = level ;
	cl.nodes = [] ;
	cl.children = [] ;
	
	for(var i=0 ; i<data.nodes.length ; i++ )
	{
		var node = data.nodes[i] ;
		var docidx = node.docidx ;
		var x = node.x;
		var y = node.y ;
				
		var obj = { "idx": docidx, "x": x, "y": y } ;
				
		cl.nodes.push(obj) ;
	}
	
	for(var i=0 ; i<data.children.length ; i++ )
	{
		var child = data.children[i] ; 
		
		var ch = new Object ;
				
		this.parseClustersJSON(child, ch) ;				
		cl.children.push(ch) ;
	} 
}

p.parseXML = function( xmlStr ) {

	var xmlDoc = jQuery.parseXML( xmlStr ), xml = $( xmlDoc );
	
	var totalResults = xml.find("documentList").attr("count") ;
	
	var _this = this ;
	
	xml.find("document").each(function(index){
		var docid = $(this).attr("id") ;
		var score = $(this).attr("score") ;
		var thumbUrl = $(this).find("thumb").attr("url") ;
		var contentUrl = $(this).find("content").attr("url") ;
		var desc = $(this).find("desc").text() ;
		
		var pos = $(this).find("position") ;
		
		var lat = "", lon = "" ;
		
		if ( pos.length > 0 )
		{
			var coords = pos.text().split(" ") ;
			lat = coords[0] ;
			lon = coords[1] ;
		}
		
		_this.docs.push(
			{
				"id": docid, 
				"thumbUrl": thumbUrl, 
				"desc": desc,
				"contentUrl": contentUrl,
				"score": score,
				"lat": lat,
				"lon": lon
			}) ;
		
	}) ;
	
	this.parseClustersXML(xml.find("searchResults").children("cluster"), this.clusters) ;

}

p.parseJSON = function( data ) {

	for (var i=0 ; i<data.documentList.length ; i++ )
	{
		var doc = data.documentList[i] ;
	
		var docid = doc.id ;
		var score = doc.score ;
		var thumbUrl = doc.thumb.url ;
		var contentUrl = doc.content.url ;
		var desc = doc.desc ;
		
		var pos = doc.position ;
		
		if ( pos != undefined )
		{
			lat = pos.lat ;
			lon = pos.lon ;
		}
		
		this.docs.push(
			{
				"id": docid, 
				"thumbUrl": thumbUrl, 
				"desc": desc,
				"contentUrl": contentUrl,
				"score": score,
				"lat": lat,
				"lon": lon
			}) ;
		
	}
	
	this.parseClustersJSON(data.clusters, this.clusters) ;

}