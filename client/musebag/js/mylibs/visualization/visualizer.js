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
    [	"https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.14/jquery-ui.min.js",
		"order!js/libs/slides.jquery.js",
		"order!js/libs/jquery.mousewheel.js",
		"order!js/mylibs/visualization/ContextMenu.js",
		"order!js/mylibs/visualization/TagEditor.js",
		"mylibs/config",
		"mylibs/visualization/TagManager",
		"mylibs/visualization/FilterBar",
		"mylibs/visualization/TreeMap",
		"mylibs/visualization/HyperbolicTree", 
		"mylibs/visualization/HPanel" ], 
    function(undefined, undefined, undefined, undefined, undefined, config, tagManager, filterBar, treeMap, hyperbolicTree, hPanel) {
  
	var widget = null;
	var results = null;
	var element = null;
	var visPane = null;
	var menuPane = null;
	var ctx = {} ;

	var draw = function(res, ele, options) {
		results = res ;
		element = ele ;
	
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
		
		
		if ( results.docs.length == 0 )
		{
			$('<span>No results found</span>').appendTo(element) ;
			return ;
		}
		
		tagManager.init(results, config.constants) ;
		
		ctx.tagManager = tagManager ;
		ctx.filterBar = filterBar ;
					
		// create a filter pane on the top if requested
		var filterPane = null ;
		
		if ( options.showFilterPane )
		{
			filterPane = $(
			"<div/>", 
				{ css: 
					{ 
						position: "absolute", 
						width: "100%", 
						top: 0,
						bottom: 50,
						height: 50,
						display: "table"
					} 
				}
			).appendTo(element) ;
			
			filterBar.init(filterPane, options.filterBar, tagManager, results.docs, function() {
				redraw(config.constants.visOptions);
			}) ;
			
			
		}
		
		// create main visualisation area
		
		visPane = $("<div/>", 
			{ css: 
				{ 
					position: "absolute", 
					width: "100%", 
					top: ( options.showFilterPane ) ? 50 : 0,
					bottom: 50
				} 
			}
		).appendTo(element) ;
		
		// create menu on the bottom
		
		menuPane = $("<div/>", 
			{ css: 
				{ 
					position: "absolute", 
					width: "100%",
					height: 40,
					bottom: 0
				} 
			}
		).appendTo(element) ;
	
		menuPane.html('<form id="vis-options" style="padding-top: 5px">'  
			+	'<div class="formitem"><span style="margin-right: 5px;">Method</span><div id="method-buttons" style="display:inline;">' 
			+ 	'<input type="radio" name="method" id="vis-classic"/><label for="vis-classic">Classic</label>' 
			+ 	'<input type="radio" name="method" id="vis-hpanel"/><label for="vis-hpanel">HPanel</label>' 
			+ 	'<input type="radio" name="method" id="vis-htree"/><label for="vis-htree">Hyperbolic Tree</label>'
			+	'<input type="radio" name="method" id="vis-tmap"/><label for="vis-tmap">Treemap</label></div></div>'
			+	'<div class="formitem"><span style="margin-right: 5px;">Icon Size</span><div id="ts-buttons" style="display:inline;">'
			+	'<input type="radio" name="ts" id="ts64"/><label for="ts64">Small</label>'
			+ 	'<input type="radio" name="ts" id="ts96"/><label for="ts96">Medium</label>'
			+	'<input type="radio" name="ts" id="ts128"/><label for="ts128">Large</label>'
			+	'</div></div>'
			+	'<div class="formitem"><span style="margin-right: 5px;">Layout</span><div id="arrange-buttons" style="display:inline;">'
			+	'<input type="radio" name="ia" id="ia-grid"/><label for="ia-grid">Grid</label>'
			+ 	'<input type="radio" name="ia" id="ia-smart"/><label for="ia-smart">Smart</label>'
			+ 	'<input type="radio" name="ia" id="ia-smart-grid"/><label for="ia-smart-grid">Smart Grid</label>'
			+	'</div></div>'
			+	'<div class="formitem" style="float: right"><span style="margin-right: 5px;">Navigation Mode</span><div id="nav-buttons" style="display:inline;">'
			+	'<input type="radio" name="nav" id="nav-browse"/><label for="nav-browse">Browse</label>'
			+ 	'<input type="radio" name="nav" id="nav-feedback"/><label for="nav-feedback">Feedback</label>'
			+	'</div></div>'
			+ 	'</form>');
			
		// menu handlers
		
		$('#vis-' + config.constants.visOptions.method, menuPane).attr('checked', true);
		$('#ts' + config.constants.visOptions.thumbOptions.thumbSize, menuPane).attr('checked', true);
		$('#ia-' + config.constants.visOptions.thumbOptions.iconArrange, menuPane).attr('checked', true);
		$('#nav-' + config.constants.visOptions.thumbOptions.navMode, menuPane).attr('checked', true);
					
		$("#method-buttons", menuPane).buttonset(
			$('#vis-classic', menuPane).button( {text: false,  "icons": {primary:'ui-icon-method-classic'}}),
			$('#vis-hpanel', menuPane).button( {text: false,  "icons": {primary:'ui-icon-method-hpanel'}}),
			$('#vis-htree', menuPane).button( {text: false,  "icons": {primary:'ui-icon-method-htree'}}),
			$('#vis-tmap', menuPane).button( {text: false,  "icons": {primary:'ui-icon-method-tmap'}})
		) ;
		
		$("#ts-buttons", menuPane).buttonset(
			$('#ts64', menuPane).button( {text: false,  "icons": {primary:'ui-icon-thumbs-small'}}),
			$('#ts96', menuPane).button( {text: false,  "icons": {primary:'ui-icon-thumbs-medium'}}),
			$('#ts128', menuPane).button( {text: false,  "icons": {primary:'ui-icon-thumbs-large'}})
		) ;
		
		$("#arrange-buttons", menuPane).buttonset(
			$('#ia-grid', menuPane).button( {text: false,  "icons": {primary:'ui-icon-layout-grid'}}),
			$('#ia-smart', menuPane).button( {text: false,  "icons": {primary:'ui-icon-layout-smart'}}),
			$('#ia-smart-grid', menuPane).button( {text: false,  "icons": {primary:'ui-icon-layout-smart-grid'}})
		) ;
		
		$("#nav-buttons", menuPane).buttonset() ;
		
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
		
		// context menu
		
		var cm = $('<div style="display:none" id="vis-context-menu">\
			<ul>\
				<li id="relevant">Toggle relevant</li>\
				<li id="tags">Edit tags</li>\
				<li id="remove">Remove items</li>\
			</ul>').appendTo(element) ;
			
			
		var loader = $('<div class="ui-loader" style="top: 313.5px;"><span class="ui-icon-loading"></span><h1>loading</h1></div>').appendTo(element) ;

	
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
		}
		else if ( method == "classic" ) {
			// for the moment just reuse hpanel with group navigation
			var opt = {} ;
			for (var i in options) opt[i] = options[i] ;
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
})