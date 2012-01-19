define("mylibs/visualization/FilterBar",  [ ], 
    function() {

	var tagManager = null ;
	var currentTags = [], tagsButtons, filterTags = [], modalFilter = [] ;
	var callback, ele, docs, modalities  ;
	
	var init = function(ele_, options, tagManager_, docs_, callback_)
	{
		ele = ele_ ;
		callback = callback_ ;
		tagManager = tagManager_ ;
		docs = docs_ ;
		modaloptions = options.modalities ;
		
		update() ;
	} ;
	
	var update = function() 
	{
		
		$(ele).empty() ;
			
		mediaDiv = $('<div/>', {"class": "formitem", css: { "display": "table-cell", "vertical-align": "middle", "width": "150px"}}).appendTo(ele) ;
		$('<span/>', { css: { "display": "table-cell", "vertical-align": "middle", "padding-right": "5px"},  text: "Media:" } ).appendTo(mediaDiv) ;
		mediaButtons = $('<div/>', { css: { display: "table-cell" } } ).appendTo(mediaDiv) ;
			
		// build buttons for each modality
		
		var btns = [] ;
		
		for ( var mod in modaloptions )
		{
			var modality = modaloptions[mod] ;
			
			var item = $("<input/>", { type: "checkbox", id: "modal-item-" + mod, "checked": "checked"  }).appendTo(mediaButtons) ;
			var label = $("<label/>", { "for": "modal-item-" + mod, text: modality.label }).appendTo(mediaButtons) ;
			
			/*if ( $.inArray(mod, modalFilter) != -1 ) */
			item.attr("checked", "checked") ;
			modalFilter.push(mod) ;
			
			item.button( {text: false,  "icons": {primary:'ui-icon-media-' + mod}}) ;
			
			btns.push(item) ;
			
			item.click(function() {
						
				filter() ;
				callback() ;
					
			});
		
		}
		
		
		// draw the sort by buttons
		
		sortbyDiv = $('<div/>', {"class": "formitem", css: { "display": "table-cell", "vertical-align": "middle", "width": "200px"}}).appendTo(ele) ;
		$('<span/>', { css: { "display": "table-cell", "vertical-align": "middle", "padding-right": "5px"},  text: "Sort by:" } ).appendTo(sortbyDiv) ;
		sortbyButtons = $('<div/>', { css: { display: "table-cell" } } ).appendTo(sortbyDiv) ;
		
		var item = $("<input/>", { type: "radio", name:"sortby", id: "sortby-relevance", "checked": "checked"  }).appendTo(sortbyButtons) ;
		var label = $("<label/>", { "for": "sortby-relevance", text: "Relevance" }).appendTo(sortbyButtons) ;
			
		item.button( {text: false,  "icons": {primary:'ui-icon-sortby-relevance'}}) ;
			
		item.click(function() {
			filter() ;
			callback() ;
		});
		
		item = $("<input/>", { type: "radio", name:"sortby", id: "sortby-location"  }).appendTo(sortbyButtons) ;
		label = $("<label/>", { "for": "sortby-location", text: "Location" }).appendTo(sortbyButtons) ;
			
		item.button( {text: false,  "icons": {primary:'ui-icon-sortby-location'}}) ;
			
		item.click(function() {
			filter() ;
			callback() ;
		});
		
		item = $("<input/>", { type: "radio", name:"sortby",  id: "sortby-time"  }).appendTo(sortbyButtons) ;
		label = $("<label/>", { "for": "sortby-time", text: "Time" }).appendTo(sortbyButtons) ;
			
		item.button( {text: false,  "icons": {primary:'ui-icon-sortby-time'}}) ;
			
		item.click(function() {
			filter() ;
			callback() ;
		});
		
		sortbyButtons.buttonset() ;
		
		// draw tag filter bar
		var tags = currentTags = tagManager.tags ;
		
		tagsDiv = $('<div/>', {"class": "formitem", css: { "display": "table-cell", "vertical-align": "middle"}}).appendTo(ele) ;
		$('<span/>', { css: { "display": "table-cell", "vertical-align": "middle", "padding-right": "5px"},  text: "Tags:" } ).appendTo(tagsDiv) ;
		tagEditorDiv = $('<div/>', { id: "filter-tag-editor", css: { display: "table-cell" } }).appendTo(tagsDiv) ;
		
		var tagEditor = new TagEditor(tagEditorDiv, [], tags, function() {
		
			filterTags = [] ;
			
			for( tag in this.tags )	{	
				if ( this.tags[tag] == 2 ) 	filterTags.push(tag) ;
			}
			
			filter() ;
									
			callback() ;		
			
		}) ;
		
		
		
	};
	
	var filter = function()
	{
		// filter documents based on tags
		
		if ( filterTags.length == 0 ) 
		{
			for(var i=0 ; i<docs.length ; i++ )
				docs[i].filtered = false ;
		}
		else
		{
			for(var i=0 ; i<docs.length ; i++ )
				docs[i].filtered = true ;
		
			for( var i=0 ; i<docs.length ; i++ )
			{
				var doc = docs[i] ;
				
				if ( !doc.tags) continue ;
					
				var filtered = false ;
				
				for(var j=0 ; j<filterTags.length ; j++ )
				{
					var tag = filterTags[j] ;
									
					if (  $.inArray(tag, doc.tags) == -1 ) { 
						filtered = true ;
						break ;
						
						
					}
				}
				
				doc.filtered = filtered ;
			}
			
		}
		
		
		
	};
	
	var modalities = function()
	{

		var modalFilter = [] ;
		
		for ( var mod in modaloptions )
		{
			
			var btn = $('#modal-item-' + mod) ;
			var id = btn.attr('id').substr(11) ; 
			var checked = ( btn.attr('checked') == 'checked') ;
					
			if ( checked ) modalFilter.push(id) ;
		}
		
		return modalFilter ;
	};
  
   return {
	tags: filterTags,
	modalities: modalities,
    init: init,
	update: update
  };
  
  
}) 