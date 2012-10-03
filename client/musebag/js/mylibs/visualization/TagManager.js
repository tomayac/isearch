define("mylibs/visualization/TagManager", [], function() {

	var index, docs, queryId, filterTagUrl, sortedTagList = [], tagServerUrl ;
			
	var init = function(results_, options) {
		
		docs = results_.docs;
		queryId = results_.queryId;

		if ( options.tagServerUrl ) {
			tagServerUrl = options.tagServerUrl ;
		}
		
		filterTagUrl = options.filterTagUrl ||	tagServerUrl || 'ptag/filterTags'  ;
		if ( tagServerUrl ) filterTagUrl += "&a=all" ;
		
		storeItemUrl = options.resultItemUrl || options.filterTagUrl || tagServerUrl ;
		if ( tagServerUrl ) storeItemUrl += "&a=store" ;
		
		
		load() ;
	};

	var load = function()	{
	
		var data = [] ;
		
		for(var i=0 ; i< docs.length ; i++ )
		{
			var doc = docs[i] ;
			data.push(doc.id) ;
		}
		
		$.ajax({
			type: 'GET',
			url: filterTagUrl, //+ '&a=all',
			data: { "tags":	JSON.stringify(data) },
			success: function(data) {
			
				if ( !data ) return ;
				
				if ( data.error ) {
				}
				else if ( data )
				{
					var allTags = {} ;
				
					for( var i=0 ; i<data.length ; i++ )
					{
						var tags = data[i].tags ;
						
						if ( !tags || tags.length == 0 ) continue ;
						
						for(var j=0 ; j<tags.length ; j++ ) docs[i].tags = tags ;
															
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
		
					sortedTagList = [] ;
		
					for( var i=0 ; i<sortedTags.length ; i++ )
					{
						sortedTagList.push(sortedTags[i].tag) ;
					}
				}
			},
			dataType: 'json'
		});
		
	} ;
	
	var toggleRelevance = function(doc)
	{
		if ( tagServerUrl )
		{
			var docid = doc.id ;
		
			var data = { "id": docid, "rel": (doc.relevant ? 'yes' : 'no')  } ;
		
			$.ajax({
				type: 'GET',
				url: tagServerUrl + '&a=rel',
				data: data
			});
		}
		else
		{
		    var data = {
      			"queryId" : queryId,  
			    "item" : {  
		        "id": doc.coid,
        		"tags" : doc.tags
      		}
    	};
    
    	if(doc.relevant) {
	      $.ajax({
        	type: "POST",
	        url:  storeItemUrl,
        	data: JSON.stringify(data),
	        contentType : "application/json; charset=utf-8",
        	dataType : "json",
        	success: function(data) {
          		console.log('Item stored, since it was marked relevant.');
	        },
        	error: function(jqXHR, error, object) {
	          console.log("Error:");
         	  console.log(error);
        	}
     	 });
	    } else {
    	  $.ajax({
    	    type: "DELETE",
    	    url:  storeItemUrl,
    	    data: JSON.stringify(data),
    	    contentType : "application/json; charset=utf-8",
    	    dataType : "json",
    	    success: function(data) {
    	      console.log('Item removed, since it was marked irrelevant.');
    	    },
    	    error: function(jqXHR, error, object) {
    	      console.log("Error:");
    	      console.log(error);
    	    }
    	  });
   	 }

	}
};

	
	var store = function(doc)
	{
		var tags = doc.tags ;
		var docid = doc.id ;
		
		var data = { "id": docid, "tags": JSON.stringify(tags)  } ;
		
		$.ajax({
			type: 'GET',
			url: storeItemUrl, // + '&a=store',
			data: data
		});
	};
	
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
		
		var fileName = 'tags-' + index + '.xml';
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
		tags: sortedTagList,
		store: store,
		clear: clear,
		toggleRelevance: toggleRelevance
	} ;

}) ;
