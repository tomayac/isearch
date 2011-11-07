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
		"mylibs/visualization/TreeMap",
		"mylibs/visualization/HyperbolicTree", 
		"mylibs/visualization/HPanel" ], 
    function(undefined, undefined, undefined, undefined, undefined, config, tagManager, treeMap, hyperbolicTree, hPanel) {
  
	var widget = null;
	var results = null;
	var element = null;
	var visPane = null;
	var menuPane = null;

	var draw = function(res, ele, options) {
		results = res ;
		element = ele ;
		
		options.tagManager = tagManager ;

		setup(options) ;
		redraw(options) ;
	};

	var setOptions = function(options) {
		for ( var opt in options )
		{
			if ( options.hasOwnProperty(opt) )
				config.constants.visOptions[opt] = options[opt] ;
		}	
		
		if (options.method) {
			redraw(config.constants.visOptions);
		} else {
			widget.setOptions(options) ;
		}
	};
	
	// create the main layout
	var setup = function(options) {
	
		
		
		//Let's empty the DOM element first
		$(element).empty() ;
		
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
						height: 40
					} 
				}
			).appendTo(element) ;
			
			tagManager.init(filterPane, results, __queryParams.index, function() {
				redraw(config.constants.visOptions);
			}) ;
			
		}
		
		// create main visualisation area
		
		visPane = $("<div/>", 
			{ css: 
				{ 
					position: "absolute", 
					width: "100%", 
					top: ( options.showFilterPane ) ? 40 : 0,
					bottom: 40
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
			+	'<input type="radio" name="ts" id="ts64"/><label for="ts64">64</label>'
			+ 	'<input type="radio" name="ts" id="ts96"/><label for="ts96">96</label>'
			+	'<input type="radio" name="ts" id="ts128"/><label for="ts128">128</label>'
			+	'</div></div>'
			+	'<div class="formitem"><span style="margin-right: 5px;">Layout</span><div id="arrange-buttons" style="display:inline;">'
			+	'<input type="radio" name="ia" id="ia-grid"/><label for="ia-grid">Grid</label>'
			+ 	'<input type="radio" name="ia" id="ia-smart"/><label for="ia-smart">Smart</label>'
			+ 	'<input type="radio" name="ia" id="ia-smart-grid"/><label for="ia-smart-grid">Smart Grid</label>'
			+	'</div></div>'
			+ 	'</form>');
			
		// menu handlers
		
		$('#vis-' + config.constants.visOptions.method, menuPane).attr('checked', true);
		$('#ts' + config.constants.visOptions.thumbSize, menuPane).attr('checked', true);
		$('#ia-' + config.constants.visOptions.iconArrange, menuPane).attr('checked', true);
					
		$("#ts-buttons", menuPane).buttonset() ;
		$("#method-buttons", menuPane).buttonset() ;
		$("#arrange-buttons", menuPane).buttonset() ;
		
		var that = this ;
		
		$("input[name=method]", menuPane).click(function() {
			var method = this.id.substr(4) ;
								
			setOptions({ "method": method }) ;
		}) ;
		
		$("input[name=ts]", menuPane).click(function() {
			var ts = this.id.substr(2) ;
								
			setOptions({thumbSize: ts}) ;
		}) ;
		
		$("input[name=ia]", menuPane).click(function() {
			var ia = this.id.substr(3) ;
								
			setOptions({iconArrange: ia}) ;
		}) ;
		
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
		  widget = hPanel.create(results, visPane, options) ;
		} else if (method == "tmap") {
		  widget = treeMap.create(results, visPane, options) ;  
		} else if (method == "htree") {
		  widget = hyperbolicTree.create(results, visPane, options) ;
		}
		else if ( method == "classic" ) {
			// for the moment just reuse hpanel with group navigation
			var opt = {} ;
			for (var i in options) opt[i] = options[i] ;
        	opt.showGroups = false ;
			widget = hPanel.create(results, visPane, opt) ;
		}

  };

  return {
    draw: draw,
    redraw: redraw, 
    setOptions: setOptions
  };
})