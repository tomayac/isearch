define("mylibs/visualization/TreeMap", 
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
		"order!js/mylibs/visualization/Rectangle.js"
	],	function(){
  
	TreeMap = function(searchResults, container, options) {
		this.container = container ;

		this.thumbOptions = {  } ;

		if ( options.thumbSize )
			this.thumbOptions.thumbSize = +options.thumbSize ;

		if ( options.onItemClick )
			this.thumbOptions.onClick = options.onItemClick ;
			
		if ( options.iconArrange )
			this.thumbOptions.iconArrange = options.iconArrange ;
			
		if ( options.thumbRenderer )
			this.thumbOptions.thumbRenderer = options.thumbRenderer ;
			
		if ( options.tagManager )
			this.thumbOptions.tagManager = options.tagManager ;

		this.tree = {} ;
		this.history = [this.tree] ;

		this.searchResults = searchResults ;
		this.makeTree(this.tree, searchResults.clusters) ;

		this.redraw(this.tree, 0) ;
	};

	var p = TreeMap.prototype;

	p.container = null ;
	p.tree = null ;
	p.searchResults = null ;
	p.history = null ;
	p.thumbOptions = null ;
	p.level = 0 ;

	TreeMap.HORIZONTAL = 0 ;
	TreeMap.VERTIICAL = 1 ;


	p.setOptions = function(options) {
		if ( options.thumbSize )
			this.thumbOptions.thumbSize = +options.thumbSize ;
		if ( options.iconArrange )
			this.thumbOptions.iconArrange = options.iconArrange ;
		if ( options.thumbRenderer )
			this.thumbOptions.thumbRenderer = options.thumbRenderer ;

		this.redraw(this.tree, 0) ;
		
		var pnode = this.history[this.history.length-1] ; 
		this.redraw(pnode, this.level) ; 
	};

	TreeMap.sortOnArea = function(a, b)	{
		return b.area - a.area ;
	};

	p.redraw = function(root, level) {
		$(this.container).empty() ;
		var w = $(this.container).width() ;
		var h = $(this.container).height() ;
		
		this.level = level ;

		this.draw(root, new Rectangle(0, 0, w, h), level) ;
	};

	p.makeTree = function(treeNode, clusters) {
	
		var clusters = clusters.children ;

		treeNode.children = [] ;

		for( var i=0 ; i<clusters.length ; i++ )
		{
			var cluster = clusters[i] ;

			var icons = [] ;

			for( var j=0 ; j<cluster.nodes.length ; j++ )
			{
				var node = cluster.nodes[j] ;
				var docx = this.searchResults.docs[node.idx] ;

				var obj = { "doc": docx, "x": node.x, "y": node.y } ;

				icons.push(obj) ;
			}

			var node = { "label": cluster.level, "area": cluster.nodes.length, "icons": icons } ;

			this.makeTree(node, cluster) ;

			treeNode.children.push(node) ;

		}

		// sort based on area
		treeNode.children.sort(TreeMap.sortOnArea) ;
	};

	p.makeLabel = function(container, node, level)	{
	
		var that = this ;
		var box1 = document.createElement( "div" );
		box1.style.position = "absolute" ;
		box1.style.width = "100%";
		box1.style.height = "100%" ;
		box1.style.backgroundColor = "green" ;
		box1.style.textAlign = "center" ;
		box1.innerHTML = node.label ;

		box1.style.background = "url('img/bg1.png') repeat-x scroll left bottom #FFFFFF" ;

		var box2 = document.createElement( "div" );
		box2.style.position = "absolute" ;
		box2.style.right = 0 ;
		box2.style.width = "20px";
		box2.style.height = "100%" ;

		if ( level == 0 && this.history.length > 0 ) 
		{
			box2.style.background = "url('img/minus_button.png') no-repeat center" ;
			box2.onclick = function(e) { 

				that.history.pop() ; 
				var pnode = that.history[that.history.length-1] ; 
				that.redraw(pnode, level) ; 
			};
		}
		else
		{
			box2.style.background = "url('img/plus_button.png') no-repeat center" ;
			box2.onclick = function(e) { 
				that.history.push(node) ; 
				that.redraw(node, level-1) ; 
			};
		}

		var box3 = document.createElement( "div" );

		container.appendChild(box1) ;
		container.appendChild(box2) ;
	};

	p.draw = function(treeNode, rect, level) {

		var border = 1 ;
		var margin = 0 ;

		var subRect ;

		if ( treeNode.children.length > 0 && treeNode != this.tree)
		{
			var label = document.createElement( "div" );
			label.style.position = "absolute";
			label.style.left = rect.x + (border + margin) + "px";
			label.style.top = rect.y + (border + margin) + "px";
			label.style.overflow = "hidden" ;
			//label.style.marginLeft = "5px";
			label.style.backgroundColor = "#aaa" ;

			label.style.width = rect.width - 2*(margin) +"px";
			label.style.height = 20  + "px";

			if ( this.makeLabel ) this.makeLabel(label, treeNode, level) ;
			else label.innerHTML = treeNode.label;

			label.onmouseover = function(e) { this.style.border = "1px solid blue" ; }
			label.onmouseout = function(e) { this.style.border = "" ; }

			$(this.container).append( label );	

			subRect = rect.shrink( 20 );

		}
		else
			subRect = rect.shrink(0) ;

  	//if ( subRect !== null )
  		//	this.draw( node, subRect, level +1 );

		this.divideDisplayArea(treeNode.children, subRect) ;

		for(var i=0 ; i<treeNode.children.length ; i++ )
		{
			var node = treeNode.children[i] ;
			var rect = node.rect ;

			// Parent the box div
			var box = document.createElement( "div" );
			box.style.position = "absolute";
			box.style.border = "1px solid #444" ;
			box.style.overflow = "hidden";
			rect.moveDIV( box );
			$(this.container).append( box );

			if ( node.children.length == 0 )
			{
				var icons = document.createElement( "div" );
				icons.style.width = "100%" ;
				icons.style.height = "100%" ;
				$(box).append(icons) ;

				var tc = new ThumbContainer(icons, node.icons, this.thumbOptions) ;
				tc.draw() ;
			}

			this.draw(node, rect, level+1) ;

			box.onmouseover = function(e) { this.style.border = "1px solid blue" ; }
			box.onmouseout = function(e) { this.style.border = "1px solid #444" ; }
				//label.onclick = this.createCallback( "onBoxClick", node, box, true );
		}
	};

	p.splitFairly = function( nodes ) {
	
		var midPoint = 0;

		if( this.sumValues( nodes ) === 0 )
		{
			midPoint = Math.round( nodes.length /2 ); // JS uses floating-point maths
		} else {
			var halfValue = this.sumValues( nodes ) /2;
			var accValue = 0;
			for( ; midPoint< nodes.length; midPoint++ )
			{
				//NB: zeroth item _always_ goes into left-hand list
				if( midPoint > 0 && ( accValue + nodes[midPoint].area > halfValue ) )
					break;
				accValue += nodes[midPoint].area;
			}
		}

		return { 
			left: nodes.slice( 0, midPoint ),
			right: nodes.slice( midPoint )
		};
	};

	p.divideDisplayArea = function( facades, destRectangle ) {
	
		// Check for boundary conditions
		if( facades.length === 0 ) return;

		if( facades.length == 1 )
		{
			facades[0].rect = destRectangle;
			return;
		}
		// Find the 'centre of gravity' for this node-list
		var halves = this.splitFairly( facades );

		  // We can now divide up the available area into two
		  // parts according to the lists' sizes.
		var midPoint;
		var orientation;

		var leftSum = this.sumValues( halves.left ),
			rightSum = this.sumValues( halves.right ),
			totalSum = leftSum + rightSum;

		// Degenerate case:  All size-zero entries.
		if( leftSum + rightSum <= 0 )
		{
			midPoint = 0;
			orientation = TreeMap.HORIZONTAL;
		} else {

			if( destRectangle.isWide() )
			{
				orientation = TreeMap.HORIZONTAL;
				midPoint = Math.round( ( leftSum * destRectangle.width ) / totalSum );
			} else {
				orientation = TreeMap.VERTICAL;
				midPoint = Math.round( ( leftSum * destRectangle.height ) / totalSum );
			}
		}

		// Once we've split, we recurse to divide up the two
		// new areas further, and we keep recursing until
		// we're only trying to fit one entry into any
		// given area.  This way, even size-zero entries will
		// eventually be assigned a location somewhere in the
		// display.  The rectangles below are created in
		// (x, y, width, height) format.

		if( orientation == TreeMap.HORIZONTAL )
		{
			this.divideDisplayArea( halves.left, new Rectangle( destRectangle.x, destRectangle.y, midPoint, destRectangle.height ) );
			this.divideDisplayArea( halves.right, new Rectangle( destRectangle.x + midPoint, destRectangle.y, destRectangle.width - midPoint, destRectangle.height ) );
		} else {
			this.divideDisplayArea( halves.left, new Rectangle( destRectangle.x, destRectangle.y, destRectangle.width, midPoint ) );
			this.divideDisplayArea( halves.right, new Rectangle( destRectangle.x, destRectangle.y + midPoint, destRectangle.width, destRectangle.height - midPoint ) );
		}
	};

	p.sumValues = function( facades )
	{
		var result =0;
		for( var i=0; i< facades.length; i++ )
			result += facades[i].area ;
		return result;
	};
  
	return {
		create: function(searchResults, container, options) {
			return new TreeMap(searchResults, container, options);
		}
	};
  
});
