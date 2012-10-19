/*
* Class which triggers the visualization of the results
*/

/*
* IMPORTANT NOTE
* I DID NOT refactor all the visualization methods/classes. Thus, I just loaded them all here.
* But eventually, it will be important to precisely establish the dependancies between them.
* The files I touched are slightly renamed:
* SearchResults.js => dataParser.js 
* ResultVisualization.js => visualizer.js
* TreeMap.js => treeMap.js
* HyperbolicTree.js => hyperbolicTree.js
*/

/*
* Other note: what are those classes doing?
* => IconContainer
* => UI
*/

define("mylibs/visualization/visualizer",
    [	"order!js/libs/jquery-ui-1.8.17.custom.min.js",
     	"order!libs/jquery.ui.touch-punch.min",
		"order!js/libs/slides.jquery.js",
		"order!js/libs/jquery.mousewheel.js",
		"order!js/mylibs/visualization/ContextMenu.js",
		"order!js/mylibs/visualization/TagEditor.js",
		"mylibs/config",
		"mylibs/visualization/TagManager",
		"mylibs/visualization/FilterBar",
		"mylibs/visualization/TreeMap",
		"mylibs/visualization/HyperbolicTree", 
		"mylibs/visualization/HPanel",
		"mylibs/visualization/Cubes"], 
    function(undefined, undefined, undefined, undefined, undefined, undefined, config, tagManager, filterBar, treeMap, hyperbolicTree, hPanel, cubes) {
  
	var widget = null;
	var results = null;
	var element = null;
	var visPane = null;
	var menuPane = null;
	var ctx = {} ;

	var draw = function(res, ele, options) {
		results = res ;
		element = ele ;
		
		if (!results || results.docs.length == 0 )
    {
      $('<span>No results found</span>').appendTo(element) ;
      return;
    }
		
		setup(options) ;
		redraw(options) ;
	};

	var setMethod = function(method)
	{
		config.constants.visOptions.method = method ;
		redraw(config.constants.visOptions);
	};
		
	var setThumbOptions = function(options) {
		for ( var opt in options )
		{
			config.constants.visOptions.thumbOptions[opt] = options[opt] ;
		}	
		
		widget.setOptions(config.constants.visOptions) ;
	};
	
	// create the main layout
	var setup = function(options) {
	
		//Let's empty the DOM element first
		$(element).empty() ;
		
		tagManager.init(results, config.constants) ;
		
		ctx.tagManager = tagManager ;
		ctx.filterBar = filterBar ;
		ctx.modalities = [] ;
		ctx.config = config ;
		
		for(var mod in config.constants.visOptions.filterBar.modalities )
		{
			ctx.modalities.push(mod) ;
		}
		
		var setToogleCallback = function($header,$buttons) {
		  var callback = function() {
	      if($(this).is(":hidden")) {
	        $header.button("option", {
	          icons: { secondary:'ui-icon-triangle-1-e' }
	        });
	      } else {
	        $header.button("option", {
	          icons: { secondary:'ui-icon-triangle-1-s' }
	        });
	      }
	    };
	    
	    $buttons.hide();
	    $header.click(function(e) {
	      $buttons.slideToggle(200,callback);
      });
		};
		
		
    // create result menu 
    menuPane = $("<div/>").attr('id', 'visualization-menu').appendTo(element); 
		
		// create a filter pane on the top if requested
		var filterPane = null ;
		
		if ( options.showFilterPane )
		{
			filterBar.init(menuPane, options.filterBar, tagManager, results.docs, setToogleCallback, function() {
				redraw(config.constants.visOptions);
			}) ;	
		}
		
		var hasHierarchy = ( results.clusters.children.length > 1 );
		
		var viewDiv = $('<div/>', {"class": "group"}).appendTo(menuPane) ;
    $('<h4/>', { text: "View Options" } ).appendTo(viewDiv);
		
		//var menuPaneHtml = '<form id="vis-options" style="padding-top: 5px">'  ;
		
		if ( hasHierarchy && options.methods && options.methods.length > 1 ) 
		{
	    var methodHeader = $('<button/>', { 'class' : 'optionsHeader', text: 'Method' } ).appendTo(viewDiv) ;
	    methodHeader.button({'icons': {secondary:'ui-icon-triangle-1-e'}});
	    var methodButtons = $('<div/>', {'class' : 'options'}).appendTo(viewDiv) ;
	    
			//menuPaneHtml +=	'<div class="formitem"><span style="margin-right: 5px;">Method</span><div id="method-buttons" style="display:inline;">'  ;

			for (var idx in options.methods )
			{
				switch ( options.methods[idx] )
				{
					case "classic":
					  methodButtons.append('<input type="radio" name="method" id="vis-classic"/><label for="vis-classic">Classic</label>');
					  //menuPaneHtml += '<input type="radio" name="method" id="vis-classic"/><label for="vis-classic">Classic</label>';
						break ;
					case "hpanel":
					  methodButtons.append('<input type="radio" name="method" id="vis-hpanel"/><label for="vis-hpanel">HPanel</label>');
						break ;
					case "htree":
					  methodButtons.append('<input type="radio" name="method" id="vis-htree"/><label for="vis-htree">Hyperbolic Tree</label>');
						break ;
					case "tmap":
					  methodButtons.append('<input type="radio" name="method" id="vis-tmap"/><label for="vis-tmap">Treemap</label>');
						break ;
				}
			}	
			
			setToogleCallback(methodHeader,methodButtons);
		}
    
		var sizeHeader = $('<button/>', { 'class' : 'optionsHeader', text: 'Preview Size' } ).appendTo(viewDiv) ;
		sizeHeader.button({'icons': {secondary:'ui-icon-triangle-1-e'}});
    var sizeButtons = $('<div/>', {'class' : 'options'}).appendTo(viewDiv) ;
		
    sizeButtons.append('<label for="ts64">Small</label><input type="radio" name="ts" id="ts64"/>');
    sizeButtons.append('<label for="ts96">Medium</label><input type="radio" name="ts" id="ts96"/>');
    sizeButtons.append('<label for="ts128">Large</label><input type="radio" name="ts" id="ts128"/>');
    
    setToogleCallback(sizeHeader,sizeButtons);
    
		/*menuPaneHtml +=	 '<div class="formitem"><span style="margin-right: 5px;">Icon Size</span><div id="ts-buttons" style="display:inline;">'
			+	'<label for="ts64">Small</label><input type="radio" name="ts" id="ts64"/>'
			+ 	'<label for="ts96">Medium</label><input type="radio" name="ts" id="ts96"/>'
			+	'<label for="ts128">Large</label><input type="radio" name="ts" id="ts128"/>'
			+	'</div></div>';
		*/
    
		if ( options.thumbOptions.iconArrangeMethods && options.thumbOptions.iconArrangeMethods.length > 1 )
		{
		  var layoutHeader = $('<button/>', { 'class' : 'optionsHeader', text: 'Layout' } ).appendTo(viewDiv) ;
		  layoutHeader.button({'icons': {secondary:'ui-icon-triangle-1-e'}});
	    var layoutButtons = $('<div/>', {"class" : "options"}).appendTo(viewDiv) ;
		  //menuPaneHtml +=	 '<div class="formitem"><span style="margin-right: 5px;">Layout</span><div id="arrange-buttons" style="display:inline;">';
						
			for (var idx in options.thumbOptions.iconArrangeMethods )
			{
				switch ( options.thumbOptions.iconArrangeMethods[idx] )
				{
					case "grid":
					  layoutButtons.append('<input type="radio" name="ia" id="ia-grid"/><label for="ia-grid">Grid</label>');
					  //menuPaneHtml +=	'<input type="radio" name="ia" id="ia-grid"/><label for="ia-grid">Grid</label>' ;
						break ;
					case "smart":
					  layoutButtons.append('<input type="radio" name="ia" id="ia-smart"/><label for="ia-smart">Smart</label>');
						//menuPaneHtml += '<input type="radio" name="ia" id="ia-smart"/><label for="ia-smart">Smart</label>' ;
						break ;
					case "smart-grid":
					  layoutButtons.append('<input type="radio" name="ia" id="ia-smart-grid"/><label for="ia-smart-grid">Smart Grid</label>');
						//menuPaneHtml +=	'<input type="radio" name="ia" id="ia-smart-grid"/><label for="ia-smart-grid">Smart Grid</label>' ;
						break ;
					case "list":
					  layoutButtons.append('<input type="radio" name="ia" id="ia-list"/><label for="ia-list">List</label>');
						//menuPaneHtml +=	'<input type="radio" name="ia" id="ia-list"/><label for="ia-list">List</label>' ;
						break ;
				}
			}
			
			setToogleCallback(layoutHeader,layoutButtons);
			//menuPaneHtml +=	'</div></div>' ;
		}
		
		if ( options.thumbOptions.navModes && options.thumbOptions.navModes.length > 1 ) 
		{
		  var navModeHeader = $('<button/>', { 'class' : 'optionsHeader', text: 'Nav Mode' } ).appendTo(viewDiv) ;
		  navModeHeader.button({'icons': {secondary:'ui-icon-triangle-1-e'}});
      var navModeButtons = $('<div/>', {'class' : 'options'}).appendTo(viewDiv) ;
		  //menuPaneHtml +=	'<div class="formitem" style="float: right"><span style="margin-right: 5px;">Navigation Mode</span><div id="nav-buttons" style="display:inline;">' ;
			
			for (var idx in options.thumbOptions.navModes )
			{
				switch ( options.thumbOptions.navModes[idx] )
				{
					case "browse":
					  navModeButtons.append('<input type="radio" name="nav" id="nav-browse"/><label for="nav-browse">Browse</label>');
						//menuPaneHtml +=	'<input type="radio" name="nav" id="nav-browse"/><label for="nav-browse">Browse</label>' ;
						break ;
					case "feedback":
					  navModeButtons.append('<input type="radio" name="nav" id="nav-feedback"/><label for="nav-feedback">Feedback</label>');
						//menuPaneHtml += '<input type="radio" name="nav" id="nav-feedback"/><label for="nav-feedback">Feedback</label>' ; 
						break ;
				}
				
			}
			
			setToogleCallback(navModeHeader,navModeButtons);
			//menuPaneHtml +=	'</div></div>' ;
		}
		
		//menuPaneHtml +=	'</form>';
			
		//menuPane.html(menuPaneHtml);
		
		// menu handlers
		$('#vis-' + config.constants.visOptions.method, menuPane).attr('checked', true);
		$('#ts' + config.constants.visOptions.thumbOptions.thumbSize, menuPane).attr('checked', true);
		$('#ia-' + config.constants.visOptions.thumbOptions.iconArrange, menuPane).attr('checked', true);
		$('#nav-' + config.constants.visOptions.thumbOptions.navMode, menuPane).attr('checked', true);
				
		//$("#method-buttons", menuPane).buttonset(
			$('#vis-classic', menuPane).button( {"icons": {primary:'ui-icon-method-classic'}});
			$('#vis-hpanel', menuPane).button( {"icons": {primary:'ui-icon-method-hpanel'}});
			$('#vis-htree', menuPane).button( {"icons": {primary:'ui-icon-method-htree'}});
			$('#vis-tmap', menuPane).button( {"icons": {primary:'ui-icon-method-tmap'}});
		//) ;
		
		//$("#ts-buttons", menuPane).buttonset(
			$('#ts64', menuPane).button( {"icons": {primary:'ui-icon-thumbs-small'}});
			$('#ts96', menuPane).button( {"icons": {primary:'ui-icon-thumbs-medium'}});
			$('#ts128', menuPane).button( {"icons": {primary:'ui-icon-thumbs-large'}});
		//) ;
		
		//$("#arrange-buttons", menuPane).buttonset(
			$('#ia-grid', menuPane).button( {"icons": {primary:'ui-icon-layout-grid'}});
			$('#ia-smart', menuPane).button( {"icons": {primary:'ui-icon-layout-smart'}});
			$('#ia-smart-grid', menuPane).button( {"icons": {primary:'ui-icon-layout-smart-grid'}});
			$('#ia-list', menuPane).button();
		//) ;
		
		//$("#nav-buttons", menuPane).buttonset() ;
			$('#nav-browse', menuPane).button();
			$('#nav-feedback', menuPane).button();
		
		var that = this ;
		
		$("input[name=method]", menuPane).click(function() {
			var method = this.id.substr(4) ;
								
			setMethod(method) ;
		}) ;
		
		$("input[name=ts]", menuPane).click(function() {
			var ts = this.id.substr(2) ;
								
			setThumbOptions({thumbSize: ts}) ;
		}) ;
		
		$("input[name=ia]", menuPane).click(function() {
			var ia = this.id.substr(3) ;
								
			setThumbOptions({iconArrange: ia}) ;
		}) ;
		
		$("input[name=nav]", menuPane).click(function() {
			var nav = this.id.substr(4) ;
								
			setThumbOptions({navMode: nav}) ;
		}) ;
		
	  // create main visualisation area   
    visPane = $("<div/>").attr('id', 'visualization-area').appendTo(element);
		
		// context menu	
		var cm = $('<div style="display:none" id="vis-context-menu">\
			<ul>\
				<li id="relevant">Toggle relevant</li>\
				<li id="tags">Edit tags</li>\
				<li id="remove">Remove items</li>\
			</ul>').appendTo(element) ;
	} ;

	// redraw visualization area when some option has changed
	
	var redraw = function(options) {

		var method = options.method ;

		if (method == "hpanel") {
		  widget = hPanel.create(results, visPane, options, ctx) ;
		} else if (method == "tmap") {
		  widget = treeMap.create(results, visPane, options, ctx) ;  
		} else if (method == "htree") {
		  widget = hyperbolicTree.create(results, visPane, options, ctx) ;
		} else if (method == "cubes") {
		  widget = cubes.create(results, visPane, options, ctx) ;
		}
		else if ( method == "classic" ) {
			// for the moment just reuse hpanel with group navigation
			var opt = {} ;
			for (var i in options) 
			  opt[i] = options[i] ;
      opt.showGroups = false ;
			widget = hPanel.create(results, visPane, opt, ctx) ;
		}

  };

  return {
    draw: draw,
    redraw: redraw, 
    setThumbOptions: setThumbOptions,
	  setMethod: setMethod
  };
});
