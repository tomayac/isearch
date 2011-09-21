LabelManager = function(mapWidth, mapHeight, options) {	
	this.m_mapWidth = mapWidth ;	
	this.m_mapHeight = mapHeight ;	
	this.m_index = new CandidateIndex(mapWidth / 32, mapHeight / 32 ); 	
	this.m_features = [] ;	
	if ( options )
	{
		if ( options.hasOwnProperty('snapToGrid' ) ) this.m_snapToGrid = options.snapToGrid ;
	}
}	

var p = LabelManager.prototype;	

p.m_index = null ;	
p.m_features = null ;	
p.m_mapWidth = 0 ;	
p.m_mapHeight = 0 ;	
p.m_snapToGrid = true ;
			
p.addLabelGraphic = function( index, x, y, width, height ) {	

	var feature ;
	
	if ( this.m_snapToGrid == true )
	{
		var _x = parseInt(x / width) ;
		var _y = parseInt(y / height) ;
		_x = width * _x ;
		_y = height * _y ;
		
		feature = new Feature( index, _x, _y, width, height );	
	}
	else feature = new Feature( index, x, y, width, height );	
	
	this.m_features.push( feature );	
	for ( var c = 0 ; c< feature.candidates.length ; c++ )	
	{	
		this.m_index.addCandidate( feature.candidates[c] );	
	}	
}	
			
p.solve = function()	
{	
	var labelGraphics = [];	
	this.calcFeatureCost();	
		 	
	while ( this.m_features.length )	
	{	
		var feature = this.m_features.pop() ;	
					
		var smallestCost = Number.POSITIVE_INFINITY;	
		var bestCandidate = null;               	
			
		for ( var c=0 ; c <feature.candidates.length ; c++ )	
		{          	
			var candidate = feature.candidates[c] ;	
				
			if ( candidate.removed === false )	
			{	
				this.m_index.searchForOverlappingCandidates( candidate );	
				if ( candidate.cost < smallestCost )	
				{	
					smallestCost = candidate.cost;	
					bestCandidate = candidate;	
				}                    	
			}	
		}	
			
		if ( bestCandidate )	
		{	
					  	
			for ( var overlap=0 ; overlap <bestCandidate.overlapping.length ; overlap++ )	
			{	
				bestCandidate.overlapping[overlap].remove();                    	
			}   	
			var res = new Object ;	
			res.index =  bestCandidate.feature.labelGraphic ;	
			res.x = bestCandidate.m_extent.xmin ;	
			res.y = bestCandidate.m_extent.ymin ;                	
			labelGraphics.push( res );	
		}	
		else	
		{	
		  //          feature.labelGraphic.textField.visible = false;	
		}                   	
	}	
	return labelGraphics;	
}	
			
p.m_calcValue = null ;	
			
p.calcValue0 = function( value, priority, length )	
{	
	this.m_calcValue = this.calcValueN;	
	return priority;	
}	
			
p.calcValueN = function( value, priority, length )	
{	
	return value + priority / length;             	
}	
			
p.calcFeatureCost = function()	
{	
	this.m_calcValue = this.calcValue0;	
				
	var value = 0;            	
	var priority = 1;	
	for ( var f=0 ; f<this.m_features.length; f++ )	
	{	
		var feature = this.m_features[f] ;	
			
		feature.cost = this.m_calcValue( value, priority++, this.m_features.length );	
		value = feature.cost;	
					
		for ( var c=0 ; c<feature.candidates.length ; c++ )	
		{	
			var candidate = feature.candidates[c] ;	
				
			if ( candidate.m_extent.xmin < 0 )	
			{	
				candidate.remove();	
			}	
			else if ( candidate.m_extent.xmax > this.m_mapWidth )	
			{	
				candidate.remove();	
			}	
			else if ( candidate.m_extent.ymin < 0 )	
			{	
				candidate.remove();	
			}	
			else if ( candidate.m_extent.ymax > this.m_mapHeight )	
			{	
				candidate.remove();	
			}	
		}	
	}	
}	
