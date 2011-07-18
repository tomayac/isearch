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
* HyperbolicTree.js =~ hyperbolicTree.js
*/

/*
* Other note: what are those classes doing?
* => IconContainer
* => UI
*/

define("mylibs/visualization/visualizer", 
    ["mylibs/visualization/TreeMap","mylibs/visualization/HyperbolicTree", "mylibs/visualization/HPanel", "mylibs/visualization/gmap", "mylibs/visualization/layout/Feature","mylibs/visualization/layout/CandidateIndex", 
    "mylibs/visualization/layout/Candidate", "mylibs/visualization/layout/Extent", "mylibs/visualization/layout/LabelManager",
    "mylibs/visualization/GroupBox", "mylibs/visualization/Thumbnail", "mylibs/visualization/ThumbContainer", "mylibs/visualization/Rectangle",
    "mylibs/visualization/Complex", "mylibs/visualization/HPoint", "mylibs/visualization/Tween", "mylibs/visualization/HyperGraph"], 
    function(treeMap, hyperbolicTree, hPanel) {
  
  var widget = null;
  var results = null;
  var element = null;

  var draw = function(res, ele, options) {
  	results = res ;
  	element = ele ;

  	redraw(options.method, options) ;
  };

  var setOptions = function(options) {
  	if (options.method) {
  		redraw(options.method, options);
		} else {
  		widget.setOptions(options) ;
    }
  };

  var redraw = function(method, options) {
  	
  	//Let's empty the DOM element first
  	$(element).empty() ;

  	if (method == "hpanel") {
      widget = hPanel.create(results, element, options) ;
  	} else if (method == "tmap") {
      widget = treeMap.create(results, element, options) ;  
    } else if (method == "htree") {
      widget = hyperbolicTree.create(results, element, options) ;
  	}
  };

  return {
    draw: draw,
    redraw: redraw, 
    setOptions: setOptions
  };
})