TreeMap = function(searchResults, container, options) {
	
	//Comtains the String used in the jQuery selector
	this.container = container ;
	
	this.thumbOptions = {  } ;
	
	if (options.thumbSize) {
		this.thumbOptions.thumbSize = options.thumbSize ;
	}
	
	if (options.onItemClick) {
		this.thumbOptions.onClick = options.onItemClick ;
	}
	
	this.tree = {} ;
	this.history = [this.tree] ;
	
	//Contains the JSON data
	this.searchResults = searchResults ;
  this.makeTree(this.tree, searchResults.clusters) ;
	
	console.log('state of "this.tree" at the end of makeTree function: ');
	console.log(this.tree);
	this.redraw(this.tree, 0) ;
	
}

var p = TreeMap.prototype;

p.container = null ;
p.tree = null ;
p.searchResults = null ;
p.history = null ;
p.thumbOptions = null ;

TreeMap.HORIZONTAL = 0 ;
TreeMap.VERTICAL = 1 ;


p.setOptions = function(options)
{
	if ( options.thumbSize )
	{
		this.thumbOptions.thumbSize = options.thumbSize ;
	}

	this.redraw(this.tree, 0) ;

}

TreeMap.sortOnArea = function(a, b)
{
	return b.area - a.area ;
}

p.redraw = function(root, level)
{
	var $container = $(this.container);
	$container.empty();
	
	console.log($container);
	var w = $container.width() ;
	var h = $container.height() ;
	console.log('Drawing a treemap of level + ' + level + ' in a container of size '+ w + 'x' + h );
	this.draw(root, new Rectangle(0, 0, w, h), level) ;
}

p.makeTree = function(treeNode, clusters)
{
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
}

p.makeLabel = function(container, node, level)
{
	var that = this ;
	var box1 = document.createElement( "div" );
	box1.style.position = "absolute" ;
	box1.style.width = "100%";
	box1.style.height = "100%" ;
	box1.style.backgroundColor = "green" ;
	box1.style.textAlign = "center" ;
	box1.innerHTML = node.label ;
	
	box1.style.background = "url('img/bg1.png') repeat-x scroll left bottom #ccc" ;
	
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
		}
	}
	else
	{
		box2.style.background = "url('images/plus_button.png') no-repeat center" ;
		box2.onclick = function(e) { 
			that.history.push(node) ; 
			that.redraw(node, 0) ; 
		}
	}
	
	var box3 = document.createElement( "div" );
		
	container.appendChild(box1) ;
	container.appendChild(box2) ;
	
}
		
	
p.draw = function(treeNode, rect, level)
{
  console.log(this.container);
	console.log('Entered the draw function');
	console.log(treeNode);
	console.log(rect);
	console.log(level);
	
  var border = 1 ;
	var margin = 0 ;
  
	var subRect ;
	console.log('this.tree: ');
	console.log(this.tree);
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
    console.log('container: is coming')
    console.log(this.container);
		subRect = rect.shrink( 20 );
		
	
	}
	else
		subRect = rect.shrink(0) ;
	  console.log('SubRect coming next');
	  console.log(subRect);
	//if ( subRect !== null )
		//	this.draw( node, subRect, level +1 );
	console.log(rect);
	this.divideDisplayArea(treeNode.children, subRect) ;
	
	for(var i=0 ; i<treeNode.children.length ; i++ )
	{
		var node = treeNode.children[i] ;
		var rect = node.rect ;
		
		// Parent the box div
		var box = document.createElement( "div" );
		box.style.position = "absolute";
		box.style.border = "1px solid #444" ;
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
		
		box.onmouseover = function(e) { this.style.border = "1px solid #ab2011" ; }
		box.onmouseout = function(e) { this.style.border = "1px solid #444" ; }
			//label.onclick = this.createCallback( "onBoxClick", node, box, true );
	}
		
	
    
}

p.splitFairly = function( nodes )
{
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

p.divideDisplayArea = function( facades, destRectangle )
{	
  console.log('Trying to divide the display area');
  console.log(facades);
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
	console.log('total sum: '+ totalSum);

	// Degenerate case:  All size-zero entries.
	if( leftSum + rightSum <= 0 ) {
		midPoint = 0;
		orientation = TreeMap.HORIZONTAL;
	} else {
	  console.log('orientation: ' + orientation);
		if( destRectangle.isWide() ) {
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
	  console.log('Building horizontal treemap');
		this.divideDisplayArea( halves.left, new Rectangle( destRectangle.x, destRectangle.y, midPoint, destRectangle.height ) );
		this.divideDisplayArea( halves.right, new Rectangle( destRectangle.x + midPoint, destRectangle.y, destRectangle.width - midPoint, destRectangle.height ) );
	} else {
	  console.log('Building other (vertical) treemap');
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


