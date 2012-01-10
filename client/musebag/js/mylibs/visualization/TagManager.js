define("mylibs/visualization/TagManager", 
	[],
function() {

	var index, docs ;
			
	var init = function(results_, index_) {
		
		index = index_ ;
		docs = results_.docs ;
		
		load() ;
	};
	
	var getAllTags = function() {

		// load all tags associated with this index

		var allTags = {} ;
		
		for(var i=0 ; i< docs.length ; i++ )
		{
			var doc = docs[i] ;
		
			var tags = JSON.parse(localStorage.getItem(index + ':' + doc.id)) ;
		
			if ( !tags ) continue ;
			
			for(var j=0 ; j<tags.length ; j++ )
			{
				var tag = tags[j] ;
				if ( allTags.hasOwnProperty(tag) ) 	allTags[tag] ++ ;
				else allTags[tag] = 1 ;
			}
		}
		
		// make a sorted array with most common tags in the front
		
		var sortedTags = [] ;
		
		for (var tag in allTags)
			sortedTags.push({tag: tag, count: allTags[tag]}) ;
			
		sortedTags.sort(function(a, b) { return b.count - a.count ; }) ;
		
		var res = [] ;
		
		for( var i=0 ; i<sortedTags.length ; i++ )
		{
			res.push(sortedTags[i].tag) ;
		}
		
		return res ;
	};
	
	var load = function()	{
		for(var i=0 ; i< docs.length ; i++ )
		{
			var doc = docs[i] ;
		
			var tags = JSON.parse(localStorage.getItem(index + ':' + doc.id)) ;
		
			if ( !tags ) continue ;
			
			doc.tags = tags ;
		}
	} ;
	

	
	var store = function(doc)
	{
		var tags = doc.tags ;
		var docid = doc.id ;
		
		var key  = index + ":" + docid ;
		
		if ( tags && tags.length > 0 )				
			localStorage[key] = JSON.stringify(tags) ;
		else
			localStorage.removeItem(key) ;
	}
	
	// this is to download the list of tag assignements. Currently we do this be sending the content
	// to a server script that mirrors it.
	
	var download = function()
	{
		var xml = '<?xml version="1.0" encoding="UTF-8"?><tags>' ;
				
		for( var i=0 ; i<docs.length ; i++ )
		{
			var doc = docs[i] ;
			
			if ( !doc.tags || doc.tags.length == 0 ) continue ;
			
			xml += '<doc id="' + doc.id + '">' ;
			
			for( var j=0 ; j<doc.tags.length ; j++ ) {
				xml += '<tag>' + doc.tags[j] + '</tag>' ;
			}
			
			xml += '</doc>' ;
		}
		
		xml += '</tags>' ;
		
		var fileName = 'tags-' + index + '.xml'
		$.ajax({
			type: 'POST',
			url: "http://vision.iti.gr/sotiris/isearch/download.php",
			data: { filename: fileName, content: xml },
			success: function(data) {
				if ( data.success == 'true' )
							window.open("http://vision.iti.gr/sotiris/isearch/download.php?filename=" + fileName) ;
			
			},
			dataType: "json"
		}) ;
	
		
	};
	
	var clear = function() {
		
		localStorage.clear() ;
		
		for(var i=0 ; i<docs.length ; i++ )
		{
			docs[i].tags = [] ;
		}
		
	
	};
	
	return { 
		docs: docs,
		init: init, 
		tags: getAllTags,
		store: store,
		clear: clear
	} ;

}) ;