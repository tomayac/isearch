define("mylibs/visualization/HPanel", 
	[	
		"mylibs/visualization/gmap",	
		"mylibs/visualization/Thumbnail",
		"mylibs/visualization/ThumbContainer",
		"mylibs/visualization/GroupBox"
	], function(){
  
  
	HPanel = function( searchResults, containerDiv, options ) {
		this.searchResults = searchResults ;
		this.currentCluster = searchResults.clusters ;
		this.hierarchy = [searchResults.clusters] ;

		this.containerDiv = containerDiv ;

		this.thumbOptions = {  } ;

		if ( options.thumbSize )
			this.thumbOptions.thumbSize = +options.thumbSize ;

		if ( options.onItemClick )
			this.thumbOptions.onClick = options.onItemClick ;

		this.createLayout() ;

		this.populatePanels() ;
	};

	var p = HPanel.prototype;   

	p.clustersPanel = null;
	p.resultsPanel = null ;
	p.currentLevel = 0 ;
	p.currentCluster = null ;
	p.searchResults = null ;
	p.hierarchy = null ;
	p.icons = null ;
	p.thumbOptions = null ;

	p.containerDiv = null ;
	p.onClick = null ;

	p.setOptions = function(options) {
		if ( options.thumbSize )
		{
			this.thumbOptions.thumbSize = +options.thumbSize ;
		}

		this.resultsPanel = new ThumbContainer($('#hpanel-results'), this.icons, this.thumbOptions ) ;
		this.resultsPanel.draw() ;

	};

	p.createLayout = function()  {
		
		var results = $('<div>', { id: "hpanel-results", css: { width: "100%", position: "absolute", top: 40, height: $(this.containerDiv).height() - 40 }}).appendTo(this.containerDiv) ;

		this.resultsInnerDiv = results ;

		this.groups = $('<div/>', { "class": '{ title: "Groups"}' }).appendTo(this.containerDiv) ;
		this.clustersInnerDiv = $('<div/>', {id: "hpanel-groups", css: { height: "180px"}}).appendTo(this.groups) ;

		var that = this ;

		$(this.groups).buildMbExtruder({
            positionFixed:false,
            width: $(this.containerDiv).width(),
            sensibility:100,
            position:"top", // left, right, bottom
            flapDim:100,
            textOrientation:"bt", // or "tb" (top-bottom or bottom-top)
            onExtOpen:function(){},
            onExtContentLoad:function(){},
            onExtClose:function(){},
            hidePanelsOnClose:true,
            autoCloseTime:500, // 0=never
            slideTimer:300
       });
	};

	p.populatePanels = function()  {
  	
		var groupIcons = [] ;
		var _this = this ;

		if ( this.hierarchy.length > 1 ) 
			groupIcons.push({url: "img/arrow_back.png", cluster: -1, clicked: function() { _this.groupClicked(-1); } }) ;

		for(var c=0 ; c < this.currentCluster.children.length ; c++ )
		{
			var cluster = this.currentCluster.children[c] ;

			var idx = cluster.nodes[0].idx ;
			var doc = this.searchResults.docs[idx] ;

			var thumbUrl = doc.thumbUrl ;

			groupIcons.push({url: thumbUrl, cluster: c, clicked: 
				(function(item) {
						 // that returns our function 
						 return function() {
							_this.groupClicked(item) ;
						 };
					  })(c)
					}) ;
		}

		this.clustersPanel = new GroupBox($('#hpanel-groups'), groupIcons) ;

		this.icons = [] ;

		for(var j=0 ; j<this.currentCluster.nodes.length ; j++)
		{
			var idx = this.currentCluster.nodes[j].idx ;
			var docx = this.searchResults.docs[idx] ;

			var x = this.currentCluster.nodes[j].x ;
			var y = this.currentCluster.nodes[j].y ;

			var obj = { "doc": docx, "x": x, "y": y} ;
			this.icons.push(obj) ;
		}

		this.resultsPanel = new ThumbContainer($('#hpanel-results'), this.icons, this.thumbOptions) ;

		this.resultsPanel.draw() ;
	};

	p.init = function(clustersDiv, resultsDiv)  {

		this.populatePanels() ;

	};

	p.groupClicked = function(cluster) { 
		if ( cluster >= 0 )
		{		
			this.currentCluster = this.currentCluster.children[cluster] ;

			this.hierarchy.push(this.currentCluster) ;
		}
		else
		{
			this.hierarchy.pop() ;
			this.currentCluster = this.hierarchy[this.hierarchy.length - 1] ;
		}

		this.populatePanels() ;

		if ( this.onClick ) this.onClick(this.currentCluster) ;
	};
  
	return {
		create: function(searchResults, containerDiv, options) {
					return new HPanel(searchResults, containerDiv, options);
			}
	};
});