define("mylibs/visualization/dataParser", function(){
  
  var clusters = {} ;
  var docs = [] ;
  
  //Let's parse the results.
  //They can be JSON or XML
  var parse = function(data) {
    
    if (typeof data == 'string') {
      parseXML(data);
    } else {	
      parseJSON(data) ;
    }
    
    //Return a result object containing clusters and docs
    return {
      clusters: clusters,
      docs: docs
    };
    
  };
  
  var parseXML = function(xmlStr) {
    /*
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

  		docs.push(
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

  	parseClustersXML(xml.find("searchResults").children("cluster"), clusters) ;
    */
  };
  

  var parseJSON = function(data) {

	docs = [] ;
		
  	for (var i=0 ; i<data.documentList.length ; i++ ) {
  		var doc = data.documentList[i] ;
  		docs.push(doc) ;
  	}

	if ( data.clusters )
		parseClustersJSON(data.clusters[0], clusters) ;

  };
/*
  var parseClustersXML = function(data, cluster) {
    
    if (data.length == 0) {
      //If we have no data, exit the function
      return;
    }
    
    var level = data.attr("level") ;

    cluster.level = level;
    cluster.nodes = [];
    cluster.children = [];

    data.children("node").each(function(index){
      var docidx = $(this).attr("docidx") ; ;
      var x = $(this).attr("x") ;
      var y = $(this).attr("y") ;

      var obj = { "idx": docidx, "x": x, "y": y } ;
      cluster.nodes.push(obj) ;
    }) ; 

    var _this = this ;

    data.children("cluster").each(function(index){
      var child = {};

      _this.parseClustersXML($(this), child) ;				
      cluster.children.push(child) ;
    }) ; 
  };
*/
  var parseClustersJSON = function(data, cluster) {
    
    if (data == undefined) {
      return;
    }

    var level = data.level ;

  	cluster.level = level ;
  	cluster.nodes = [] ;
  	cluster.children = [] ;

  	for (var i=0 ; i<data.nodes.length ; i++) {
  		var node = data.nodes[i];
  		var docidx = node.docidx;
  		var x = node.x;
  		var y = node.y;

  		var obj = { "idx": docidx, "x": x, "y": y };

  		cluster.nodes.push(obj) ;
  	}
	
	if ( !data.children ) return ;

  	for(var i=0 ; i<data.children.length ; i++ ) {
  		var child = data.children[i]; 
  		var ch = {};

  		parseClustersJSON(child, ch);
  		cluster.children.push(ch);
  	} 
  };


  
  return {
    //We need to expose only ONE method
    parse: parse
  };
  
})

