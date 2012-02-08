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
				rerank() ;
					
			});
		
		}
		
		
		// draw the sort by buttons
		
		var sortbyDiv = $('<div/>', {"class": "formitem", css: { "display": "table-cell", "vertical-align": "middle", "width": "200px"}}).appendTo(ele) ;
		$('<span/>', { css: { "display": "table-cell", "vertical-align": "middle", "padding-right": "5px"},  text: "Sort by:" } ).appendTo(sortbyDiv) ;
		var sortbyButtons = $('<div/>', { css: { display: "table-cell" } } ).appendTo(sortbyDiv) ;
		
		/**
		 * Triantafillos:
		 * optimized existing code
		 */
		// sort by relevance button
		$("<label/>", { "for": "sortby-relevance", text: "Relevance" }).appendTo(sortbyButtons);
		$("<input/>", { type: "radio", name:"sortby", id: "sortby-relevance", "checked": "checked" })
		.appendTo(sortbyButtons)
		.button( {text: false,  "icons": {primary:'ui-icon-sortby-relevance'}});
		
		// sort by time button
		$("<label/>", { "for": "sortby-time", text: "Time" }).appendTo(sortbyButtons) ;
		$("<input/>", { type: "radio", name:"sortby",  id: "sortby-time"  })
		.appendTo(sortbyButtons)
		.button( {text: false,  "icons": {primary:'ui-icon-sortby-time'}});
		
		// sort by location button
		$("<label/>", { "for": "sortby-location", text: "Location" }).appendTo(sortbyButtons);
		$("<input/>", { type: "radio", name:"sortby", id: "sortby-location"  })
		.appendTo(sortbyButtons) 
		.button( {text: false,  "icons": {primary:'ui-icon-sortby-location'}});
		
		$('[name=sortby]').click(function(event) {
		  event.preventDefault();
		  filter() ;
		  rerank() ;
		  return false;
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
			rerank() ;
			
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
	
	var geodist = function(lat1, lon1, lat2, lon2)
	{
		var R = 6371; // km
		var dLat = (lat2-lat1) *  Math.PI / 180;
		var dLon = (lon2-lon1) *  Math.PI / 180;
		var lat1 = lat1 *  Math.PI / 180;
		var lat2 = lat2 *  Math.PI / 180;

		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c;
		
		return d ;
	
	};
	
	var rerank = function()
	{
		var btn =  $('[name=sortby]:checked');
		var sortby = btn.attr('id').substr(7) ;
		
		if ( sortby == 'time' ) {
			docs.sort(function(a, b) { 
				return new Date(b.rw.time.dateTime) - new Date(a.rw.time.dateTime)  ; 
			}) ;
			callback() ;
		}
		else if ( sortby == 'relevance' ) {
			docs.sort(function(a, b) { 
				return b.score - a.score  ; 
			}) ;
			callback() ;
		}
		else if ( sortby == 'location' )
		{
			if ( navigator.geolocation )
			{
				navigator.geolocation.getCurrentPosition(function(position) {
					var lat = position.coords.latitude ;
					var lon = position.coords.longitude ;
				
					docs.sort(function(a, b) { 
					
						if ( b.rw.pos && a.rw.pos )
						{	
							var distb = geodist(b.rw.pos.coords.lat, b.rw.pos.coords.lon, lat, lon) ;
							var dista = geodist(a.rw.pos.coords.lat, a.rw.pos.coords.lon, lat, lon) ;
							return distb - dista  ; 
						}
						else return 0 ;
					}) ;
					
					callback() ;
					
				}) ;
			}
		}
	}
	
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