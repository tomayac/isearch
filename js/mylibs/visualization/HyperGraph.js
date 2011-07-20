GraphNode = function(id, info, url) {	
	this.id = id ;	
	if ( info != undefined ) this.info = info ;	
	this.drawn = false ;	
	this.initLength = 0.5 ;	
	this.radius = 1.0 ;	
	this.angleSpanBegin = 0.0 ;	
	this.angleSpanEnd = 0.0 ;	
	this.posStart = new HPoint(0, 0) ;	
	this.posEnd = new HPoint(0, 0) ;	
	this.pos = new HPoint(0, 0) ;	
	this.url = url ;	
	this.loaded = null ;	
	this.image = new Image ;	
	this.children = [] ;	
	this.thumbSize = 0 ;	
	this.px = 0 ;	
	this.py = 0 ;	
		
}	

var p = GraphNode.prototype ;	

p.show = function(ctx, x, y) {	
			
	if ( !this.url ) return ;	
		
	if ( !this.loaded )	
	{	
		var obj = this ;	
		this.image.onload = function() {	
			obj.loadCallback(ctx, x, y);	
		};	
		this.image.src = this.url;	
		
	}	
	else this.drawImage(ctx, x, y) ;	
		
}	

p.loadCallback = function(ctx, x, y) {	
	this.loaded = true ;	
	this.drawImage(ctx, x, y) ;	
}	

p.drawImage = function(ctx, x, y)	
{	
	var size = 1.0 - Math.sqrt(this.pos.x() * this.pos.x() + this.pos.y() * this.pos.y()) ;	
	var dstw2 = HyperbolicTree.iconSize * size / ( Math.min(ctx.canvas.height, ctx.canvas.width)/2) ;  	
	var dsth2 = dstw2 ;	
		
	var origw = this.image.width ;	
	var origh = this.image.height ;	
		
	var thumbw, thumbh ;	
		
	if ( origw > origh )	
	{	
		thumbw = dstw2 ;  	
		thumbh = dsth2*(origh/origw);  	
	}  	
	else if ( origw <= origh )   	
	{  	
		thumbh = dsth2 ;  	
		thumbw = dstw2*(origw/origh);  	
	}  	
		
	this.thumbSize = thumbw ;	
	this.px = x ;	
	this.py = y ;	
		
	ctx.drawImage(this.image, x - thumbw/2, y - thumbh/2, thumbw, thumbh) ;	
}	

HyperGraph = function(res)	
{	
	this.nodes = [] ;	
	this.icons = [] ;	
	this.createNodes(res.docs, res.clusters, null) ;	
	this.calculatePositions() ;	
}	

var p = HyperGraph.prototype ;	

p.nodes = null ;	
p.icons = null ;	
			
p.createNodes = function(docs, c, parent)	
{	
		
	var iconSize = 48 ;	
	var gnode ;	
								
	if ( parent != null )	
	{	
					
		var doc = docs[c.nodes[0].idx] ;	
																			
		var img = new Image ; 	
		var thumbUrl = doc.thumbUrl ;	
									
		var arr = [] ;	
					
		for(var j=0 ; j<c.nodes.length ; j++)	
		{	
			var idx = c.nodes[j].idx ;	
			var docx = docs[idx] ;	
						
			var x = c.nodes[j].x ;	
			var y = c.nodes[j].y ;	
			
			var obj = { "doc": docx, "x": x, "y": y } ;	
			arr.push(obj) ;	
		}	
					
		this.icons.push(arr) ;	
			
		var gnode = new GraphNode(this.icons.length, null, thumbUrl) ;	
		parent.children.push(gnode) ;	
			
	}	
	else	
		gnode = new GraphNode(0, null) ;	
			
					
	this.nodes.push(gnode) ;		
						
	for(var i=0 ; i<c.children.length ; i++)	
	{	
		this.createNodes(docs, c.children[i], gnode) ;	
	}	
}	
			

		
 	
p.transform = function(theta, c)	
{	
	for (var i = 0 ; i<this.nodes.length ; i++ )	
	{	
		var node = this.nodes[i] ;	
		node.posEnd = node.posEnd.moebius(theta, c) ;	
		node.radius = Complex.norm(node.posEnd.moebius(theta, new HPoint(node.radius, 1))) ;	
	}	
}	
			
p.clearState = function()	
{	
	for ( var i = 0 ; i<this.nodes.length ; i++ )	
	{	
		var node = this.nodes[i] ;	
		node.drawn = false ;	
	}	
}	
			
p.saveState = function()	
{	
	for( var i = 0 ; i<this.nodes.length ; i++ )	
	{	
		var node = this.nodes[i] ;	
		node.posStart = node.posEnd ;	
	}	
}	
		
		
p.calculatePositions = function()	
{	
	var node = this.nodes[0] ;	

	var queue = [] ;	

	node.drawn = false ;	
	node.angleSpanBegin = 0.0 ;	
	node.angleSpanEnd = 2*Math.PI ;	
	node.posEnd = new HPoint(0, 0) ;	
		
	queue.push(node) ;	
		
	this.calculateChildrenPosition(queue);	

	this.saveState() ;	
}	
			
p.calculateChildrenPosition = function(queue)	
{		 	
	var theta = new HPoint(1, 0) ;	

	while ( queue.length > 0 ) 	
	{	
		var node = queue[0] ;	
			
		if ( !node.drawn )	
		{	
			var transformed = false ;	
			var c = new HPoint(0, 0) ;	
				
			if (node.posEnd.x() != 0 || node.posEnd.y() != 0) 	
			{	
				//tranformation parameters	
				
				c = node.posEnd ;	
				this.transform(theta, c);	
				transformed = true ;	
			}	
						
			node.drawn = true ;	

			var len = node.children.length ;	
				
			var angleStep ;	

			var angleSpan = Math.abs(node.angleSpanEnd - node.angleSpanBegin) ;	
				
			if ( len > 2 && angleSpan < Math.PI*2 ) {	
				angleStep = angleSpan / (len-2) ;	
			} else if ( len == 2 && angleSpan < Math.PI*2 ) {	
				angleStep= 0;	
				node.angleSpanBegin = (node.angleSpanBegin + node.angleSpanEnd) / 2;	
			} else {	
				angleStep = angleSpan / len;	
			}	

			var angle = node.angleSpanBegin ;	

			for(var i = 0 ; i<node.children.length ; i++ )	
			{	
				var nb = node.children[i]  ; 	

				if ( !nb.drawn ) 	
				{	
					var posTo = new HPoint(node.initLength * Math.cos(angle), node.initLength*Math.sin(angle)) ;	
					
					nb.posEnd = posTo ;	
					nb.angleSpanBegin = angle - angleStep / 2 ; //angleRate /*/ 2*/;	
					nb.angleSpanEnd   = angle + angleStep / 2 ; //this.config.angleRate /*/ 2*/;	
					nb.initLength = node.initLength ;	
					angle += angleStep;	
				}	

				queue.push(nb) ;	
			}	
  	
			if ( transformed ) {	
				this.transform(theta, new HPoint(-c.x(), -c.y()));	
			}	
		}	
		queue.shift() ;	
	}	
}	
