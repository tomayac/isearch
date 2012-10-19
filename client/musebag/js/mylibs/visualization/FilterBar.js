define("mylibs/visualization/FilterBar",  ["mylibs/location"], 
  function(location) {

	var tagManager = null ;
	var currentTags = [], tagsButtons, filterTags = [], modalFilter = [] ;
	var callback, ele, docs, modalities, modaloptions, setToggleCallback  ;
	
	var init = function(ele_, options, tagManager_, docs_, toggleCallback_, callback_)
	{
		ele = ele_ ;
		callback = callback_ ;
		tagManager = tagManager_ ;
		docs = docs_ ;
		modaloptions = options.modalities ;
		setToggleCallback  = toggleCallback_;
		
		update() ;
	} ;
	
	var update = function() 
	{		
		$(ele).empty() ;
		
		// draw the sort by buttons		
		var sortbyDiv = $('<div/>', {"class": "group"}).appendTo(ele) ;
		$('<h4/>', {text: "Sort by" }).appendTo(sortbyDiv) ;
		var sortbyButtons = $('<div/>', {"class": "options"}).appendTo(sortbyDiv) ;
		
		/**
		 * Triantafillos:
		 * optimized existing code
		 */
		// sort by relevance button
		$("<label/>", { "for": "sortby-relevance", text: "Relevance" }).appendTo(sortbyButtons);
		$("<input/>", { type: "radio", name:"sortby", id: "sortby-relevance", "checked": "checked" })
		.appendTo(sortbyButtons)
		.button( {"icons": {primary:'ui-icon-sortby-relevance'}});
		
		// sort by time button
		$("<label/>", { "for": "sortby-time", text: "Time" }).appendTo(sortbyButtons) ;
		$("<input/>", { type: "radio", name:"sortby",  id: "sortby-time"  })
		.appendTo(sortbyButtons)
		.button( {"icons": {primary:'ui-icon-sortby-time'}});
		
		// sort by location button
		$("<label/>", { "for": "sortby-location", text: "Location" }).appendTo(sortbyButtons);
		$("<input/>", { type: "radio", name:"sortby", id: "sortby-location"  })
		.appendTo(sortbyButtons) 
		.button( {"icons": {primary:'ui-icon-sortby-location'}});
		
		$('[name=sortby]').click(function(event) {
		  event.preventDefault();
		  filter() ;
		  rerank() ;
		  return false;
	    });
		
		//sortbyButtons.buttonset() ;
    
    var filterDiv = $('<div/>', {'class': 'group'}).appendTo(ele) ;
    $('<h4/>', { text: 'Filter by' } ).appendTo(filterDiv) ;
    
    //Filter by media
    var mediaHeader = $('<button/>', { 'class' : 'optionsHeader', text: 'Media' } ).appendTo(filterDiv) ;
    mediaHeader.button({'icons': {secondary:'ui-icon-triangle-1-e'}});
    var mediaButtons = $('<div/>', {'class' : 'options'}).appendTo(filterDiv) ;
      
    // build buttons for each modality
    var btns = [] ; 
    var item = $("<input/>", { type: "radio", name: "modal-radio", id: "modal-item-all", "checked": "checked"  }).appendTo(mediaButtons) ;
    var label = $("<label/>", { "for": "modal-item-all", text: "all" }).appendTo(mediaButtons) ;
    item.button() ;
    item.click(function() {
      filter() ;
      rerank() ;
    });
      
    for ( var mod in modaloptions )
    {
      var modality = modaloptions[mod] ;
      
      var item = $("<input/>", { type: "radio", name: "modal-radio", id: "modal-item-" + mod  }).appendTo(mediaButtons) ;
      var label = $("<label/>", { "for": "modal-item-" + mod, text: modality.label }).appendTo(mediaButtons) ;
      
      /*if ( $.inArray(mod, modalFilter) != -1 ) */
      //  item.attr("checked", "checked") ;
      modalFilter.push(mod) ;
      
      item.button( {"icons": {primary:'ui-icon-media-' + mod}}) ;
      
      btns.push(item) ;
      
      item.click(function() {      
        filter() ;
        rerank() ;      
      });
    }
		
    setToggleCallback(mediaHeader,mediaButtons);
    
		// draw tag filter bar
    var tagHeader = $('<button/>', { 'class' : 'optionsHeader', text: 'Tags' } ).appendTo(filterDiv) ;
    tagHeader.button({'icons': {secondary:'ui-icon-triangle-1-e'}});
		var tagContainer = $('<div/>', { id: 'filter-tag-editor', 'class' : 'options' }).appendTo(filterDiv) ;
		
		tagManager.load(function(tags) {
		  var tagEditor = new TagEditor(tagContainer, [], tags, function(fTags) {
	      
	      filterTags = fTags || [];

	      //Original version
	      /*
	      filterTags = [] ;
	      
	      for( tag in this.tags ) { 
	        if ( this.tags[tag] == 2 )  filterTags.push(tag) ;
	      }
	      */    
	      filter() ;
	      rerank() ;
	      
	    }) ;
		}) ;
		
		setToggleCallback(tagHeader,tagContainer);
	};
	
	var filter = function()
	{
		// filter documents based on tags
		
		if ( filterTags.length == 0 ) 
		{
			for(var i=0 ; i<docs.length ; i++ ) {
				docs[i].filtered = false ;
			}
		}
		else
		{
			for(var i=0 ; i<docs.length ; i++ ) {
				docs[i].filtered = true ;
			}
			for( var i=0 ; i<docs.length ; i++ )
			{
				if ( !docs[i].tags) continue ;

				for(var j=0 ; j<filterTags.length ; j++ )
				{	
					var found = false ;
					for( var k=0 ; k<docs[i].tags.length ; k++ )
					{
						if ( docs[i].tags[k] != null) 
						{
							if (filterTags[j].toLowerCase() === docs[i].tags[k].toLowerCase()) {
							  console.log(filterTags[j].toLowerCase() + ' - ' + docs[i].tags[k].toLowerCase());
							  console.log('hello');
							  docs[i].filtered = false;
								break ;
							}
						}
					}
				}			
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
				if ( a.rw.time && b.rw.time )
					return new Date(b.rw.time.dateTime) - new Date(a.rw.time.dateTime)  ; 
				else return 0 ;
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
				location.getCurrentLocation(function(position) {
					var lat = position.coords.latitude ;
					var lon = position.coords.longitude ;
				
					docs.sort(function(a, b) { 
					
						if ( b.rw.pos && a.rw.pos )
						{	
							var distb = geodist(b.rw.pos.coords.lat, b.rw.pos.coords.lon, lat, lon) ;
							var dista = geodist(a.rw.pos.coords.lat, a.rw.pos.coords.lon, lat, lon) ;
							return dista-distb; 
						}
						else return 0 ;
					}) ;
					
					callback() ;
					
				}) ;
		}
	};
	
	var modalities = function()
	{
		var modalFilter = [] ;
		
		if ( $('#modal-item-all').attr('checked') == 'checked' )
		{
			for ( var mod in modaloptions )
				modalFilter.push(mod) ;
		}
		else
		{		
			for ( var mod in modaloptions )
			{
			
				var btn = $('#modal-item-' + mod) ;
				var id = btn.attr('id').substr(11) ; 
				var checked = ( btn.attr('checked') == 'checked') ;
					
				if ( checked ) modalFilter.push(id) ;
			
			}
		}
	
		return modalFilter ;
	};
  
  return {
	  tags: filterTags,
	  modalities: modalities,
    init: init,
	  update: update
  };
}); 