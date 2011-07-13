CandidateIndex = function( cellWidth, cellHeight )
{
	this.m_cellWidth = cellWidth;
    this.m_cellHeight = cellHeight;
    this.m_dict = new Object();
}
   
var p = CandidateIndex.prototype;   
   
p.m_cellWidth = 0 ;
p.m_cellHeight = 0 ;
p.m_dict = null ;
      
p.addCandidate = function( candidate )
{
	const xmin = Math.floor( candidate.m_extent.xmin / this.m_cellWidth );
	const xmax = Math.floor( candidate.m_extent.xmax / this.m_cellWidth );            
	const ymin = Math.floor( candidate.m_extent.ymin / this.m_cellHeight );
	const ymax = Math.floor( candidate.m_extent.ymax / this.m_cellHeight );
    
	for ( var x = xmin; x <= xmax; x++ )
    {
        var tx  = x << 8;
    
		for( var y = ymin; y <= ymax; y++ )
        {
            var ti = tx | y;
            var candidates = this.m_dict[ti] ;
        
			if ( !candidates  )
            {
                this.m_dict[ti] = [candidate];
            }        
            else
            {
                candidates.push( candidate );                        
            }                    
        }
    }
}
        
p.overlaps = function( lhs, rhs )
{
    if ( lhs.xmax <= rhs.xmin ) return false;
    if ( lhs.xmin >= rhs.xmax ) return false;
    if ( lhs.ymax <= rhs.ymin ) return false;
    if ( lhs.ymin >= rhs.ymax ) return false;
    return true;
}            
        
p.searchForOverlappingCandidates = function( candidate )
{

	var _this = this ;
	
    function forEach( forEachCandidate )
    {
        function some( someCandidate ) 
        {
            return someCandidate === forEachCandidate;
        }
        
		if ( forEachCandidate.removed )
        {
            return;
        }
        
		if ( forEachCandidate.feature === candidate.feature )
        {
            return;
        }
        
		var found = false ;
		for(var i=0 ; i<candidate.overlapping.length ; i++ )
		{
			if ( some(candidate.overlapping[i]) ) {
				found = true ;
				break ;
			}
		}
        
		if ( found ) return ;
		
        if ( _this.overlaps( candidate.m_extent, forEachCandidate.m_extent ))
        {
            candidate.overlapping.push( forEachCandidate );
            candidate.cost += forEachCandidate.feature.cost;
        }                        
    }

    candidate.cost = 0;
    candidate.overlapping = [];
    candidate.removed = true;
    var xmin = Math.floor( candidate.m_extent.xmin / this.m_cellWidth );
    var xmax = Math.floor( candidate.m_extent.xmax / this.m_cellWidth );            
    var ymin = Math.floor( candidate.m_extent.ymin / this.m_cellHeight );
    var ymax = Math.floor( candidate.m_extent.ymax / this.m_cellHeight );
            
	for ( var x = xmin; x <= xmax; x++ )
    {
		var tx = x << 8;
        for( var y = ymin; y <= ymax; y++ )
        {
            var ti = tx | y;
            var candidates = this.m_dict[ti] ;
                   
			if ( candidates )
            {
                for( var i=0 ; i<candidates.length ; i++ )
					forEach(candidates[i]);                        
            }                    
        }
    }            
}                        
    