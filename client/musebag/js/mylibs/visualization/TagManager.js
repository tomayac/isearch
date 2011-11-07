define("mylibs/visualization/TagManager", 
	[],
function() {

	var ele, index, docs ;
	var currentTags = [], tagsButtons, filterTags = [] ;
	var callback  ;
		
	var init = function(ele_, results_, index_, callback_) {
		ele = ele_ ;
		index = index_ ;
		docs = results_.docs ;
		callback = callback_ ;
		
		load() ;
		update() ;
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
	
	var update = function()
	{
		var tags = currentTags = getAllTags() ;
		
		$(ele).empty() ;
		
		tagsButtons = $('<div/>', { css: { position: "absolute", left: 0 } } ).appendTo(ele) ;
				
		for(var i=0 ; i<Math.min(tags.length, 7) ; i++ )
		{
			var item = $("<input/>", { type: "checkbox", id: "tag-item-" + i }).appendTo(tagsButtons) ;
			var label = $("<label/>", { "for": "tag-item-" + i, text: tags[i] }).appendTo(tagsButtons) ;
			
			item.click(function() { 
				var id = $(this).attr('id').substr(9) ; 
				var tag = currentTags[id] ;
			
				var idx = $.inArray(tag, filterTags) ;
				if ( idx == -1 ) filterTags.push(tag) ;
				else filterTags.splice(idx, 1) ;
				
			}) ;
			
		}
		
		tagsButtons.buttonset() ;
		
		var buttonCont = $('<div/>', { css: { position: "absolute", "right": 0 }}).appendTo(ele) ;
		
		var filterButton = $('<button/>', { text: "Filter", css: { "float": "right" }}).appendTo(buttonCont) ;
		filterButton.button() ;
		
		filterButton.click(function() {
			applyFilter() ;
		}) ;
		
		var downloadButton = $('<button/>', { text: "Download", css: { "float": "right" }}).appendTo(buttonCont) ;
		downloadButton.button() ;
		
		downloadButton.click(function() {
			download() ;
		}) ;
		
		
		var clearButton = $('<button/>', { text: "Clear Tags", css: { "float": "right" }}).appendTo(buttonCont) ;
		clearButton.button() ;
		
		clearButton.click(function() {
			clear() ;
		}) ;
		
		
		
	}
	
	var applyFilter = function()
	{
		// reset all documents
		
		for(var i=0 ; i<docs.length ; i++ )
		{
			docs[i].filtered = false ;
		}
		
		for(var i=0 ; i<filterTags.length ; i++ )
		{
			var tag = filterTags[i] ;
			
			for( var i=0 ; i<docs.length ; i++ )
			{
				var doc = docs[i] ;
				
				if ( doc.tags && $.inArray(tag, doc.tags) ) doc.filtered = true ;
			}
		}
		
		callback() ;
			
	}
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
		
		update() ;
	};
	
	return { 
		init: init, 
		tags: getAllTags,
		store: store,
		update: update
	} ;

}) ;