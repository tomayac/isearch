define("mylibs/visualization/HPanel", 
	[	
		"order!js/mylibs/visualization/gmap.js",	
		"order!js/mylibs/visualization/layout/Extent.js",
		"order!js/mylibs/visualization/layout/Candidate.js",
		"order!js/mylibs/visualization/layout/Feature.js",
		"order!js/mylibs/visualization/layout/CandidateIndex.js",
		"order!js/mylibs/visualization/layout/LabelManager.js",
		"order!js/mylibs/visualization/Thumbnail.js",
		"order!js/mylibs/visualization/audio/dsp.js",
		"order!js/mylibs/visualization/audio/audio.js",
		"order!js/mylibs/visualization/audio/audioRenderer.js",
		"order!js/mylibs/visualization/ThumbContainer.js",
		"order!js/mylibs/visualization/GroupBox.js"
	
	], function(){
  
  
	HPanel = function( searchResults, containerDiv, options, ctx ) {
		this.searchResults = searchResults ;
		this.currentCluster = searchResults.clusters ;
		this.hierarchy = [searchResults.clusters] ;
		this.ctx = ctx ;

		this.containerDiv = containerDiv ;

		this.thumbOptions = options.thumbOptions ;
					
		if ( options.hasOwnProperty("showGroups") )
			this.showGroups = options.showGroups ;
		

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
	p.showGroups = true ;

	p.containerDiv = null ;
	p.onClick = null ;

	p.setOptions = function(options) {
	
		this.thumbOptions = options.thumbOptions ;
	
		this.resultsPanel = new ThumbContainer($('#hpanel-results'), this.icons, this.thumbOptions, this.ctx ) ;
		this.resultsPanel.draw() ;

	};

	p.createLayout = function()  {
		
		$(this.containerDiv).empty() ;
		
		var extra = ( this.showGroups ) ? 40 : 0 ;
		var results = $('<div>', { id: "hpanel-results", css: { width: "100%", position: "absolute", top: extra, height: $(this.containerDiv).height() - extra }}).appendTo(this.containerDiv) ;
		
		this.resultsInnerDiv = results ;

		if ( this.showGroups )
		{
			this.groups = $('<div/>').appendTo(this.containerDiv) ;
			var button = $('<a/>', { text: "Groups"}).appendTo(this.groups) ;
		
			this.clustersInnerDiv = $('<div/>', {id: "hpanel-groups", 
				css: { 	"display": "none", 
						height: "180px"
					}}).appendTo(this.groups) ;
	
	
			button.button({icons: {
						secondary: "ui-icon-triangle-1-s"
					}}) ;
	
			button.click(function() {
				$('.ui-button-icon-secondary', button).toggleClass("ui-icon-triangle-1-s ui-icon-triangle-1-n") ;
				$("#hpanel-groups").slideToggle('medium');
			});
		}
	};
	
	p.populatePanels = function(modalities)  {
  	
		var groupIcons = [] ;
		var _this = this ;

		if ( this.showGroups ) {
		if ( this.hierarchy.length > 1 ) 
			groupIcons.push({url: "img/arrow_back.png", cluster: -1, clicked: function() { _this.groupClicked(-1); } }) ;

		for(var c=0 ; c < this.currentCluster.children.length ; c++ )
		{
			var cluster = this.currentCluster.children[c] ;

			var idx = cluster.nodes[0].idx ;
			var doc = this.searchResults.docs[idx] ;

			var thumbUrl = ThumbContainer.selectThumbUrl(doc, this.ctx.filterBar.modalities()) ;

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
		}
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

		this.resultsPanel = new ThumbContainer($('#hpanel-results'), this.icons, this.thumbOptions, this.ctx) ;

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
		create: function(searchResults, containerDiv, options, ctx) {
					return new HPanel(searchResults, containerDiv, options, ctx);
			}
	};
});