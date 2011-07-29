MarkerLayer = function(markers_) {

	this.markers = markers_ ;

};

var p = MarkerLayer.prototype ;
	
p.setVisible = function ( visible ) { 
	for(var i=0 ; i<this.markers.length ; i++ )
	{
		this.markers[i].setVisible(visible) ;
	}
};

p.updateVisibility = function( zoom, minZoom, maxZoom ) 
{
	if ( zoom >= minZoom && zoom <= maxZoom ) this.setVisible(true) ;
	else this.setVisible(false) ;
};

///////////////////////////////////////////////////////////////////////////////

GoogleMap = function(mapDiv, layers_) {

	this.map = null ;
	this.layers = [] ;
	this.bounds = new google.maps.LatLngBounds() ;
	this.visibleInfoWindow = null ;
	
	this.initMap(mapDiv, layers_) ;
};

var p = GoogleMap.prototype ;

p.getMapZoomRange = function() {
	var currentMapTypeId = this.map.getMapTypeId();
	mapType = this.map.mapTypes.get(currentMapTypeId) ;
	var minZoom = 0, maxZoom = 30 ;
	if ( typeof(mapType.minZoom) == "number")  minZoom = mapType.minZoom;
	if ( typeof(mapType.maxZoom) == "number") maxZoom = mapType.maxZoom ;
	
	return { 'minzoom': minZoom, 'maxzoom': maxZoom } ;
} ;
	
p.openInfoWindow = function(infoWindow, marker) {
	if ( this.visibleInfoWindow ) this.visibleInfoWindow.close();
    infoWindow.open(this.map, marker);
	this.visibleInfoWindow = infoWindow ;
} ;
	
p.updateLayerVisibility = function(layer) {
	
	var zoom = this.map.getZoom() ;
	var range = this.getMapZoomRange()
		
	var minZoom, maxZoom ;
	if ( !layer.hasOwnProperty('minzoom') ) minZoom = range['minzoom'] ;
	else minZoom = layer['minzoom'] ;
		
	if ( !layer.hasOwnProperty('maxzoom') ) maxZoom = range['maxzoom'] ;
	else maxZoom = layer['maxzoom'] ;
	//alert(zoom + ' ' + minZoom + ' ' + maxZoom) ;
	
	if ( layer.type == "markers" && layer.markers )
		layer.markers.updateVisibility(zoom, minZoom, maxZoom) ;
};
		
p.checkFinished = function() {
	for( var i=0 ; i<this.layers.length ; i++ )
	{
		if ( !this.layers[i].finished ) return ;
	}
	
	this.map.fitBounds(this.bounds) ;
} ;
	
p.UpdateLayerListMenu = function() {
	var layers = this.layers ;
	var html = '' ;
		
	for( i=0 ; i<layers.length ; i++ )
	{
		if ( layers[i].name ) html += '<li><a id="' + layers[i].id + '" href="#"><img src="images/checked.png"/>' + layers[i].name + '</a></li>' ;
	}
	
	$(".gmap-control-drop-down-menu ul").html(html) ;
};
	
	
p.CreateLayersControl = function (controlDiv) {
		
	var map = this.map ;
	var layers = this.layers ;
	var obj = this ;

	var html = '<div class="gmaps-control"><div class="gmaps-control-dropdown">Layers<img style="position: absolute; right: 4px; top: 4px; display: block;" src="http://maps.gstatic.com/intl/en_us/mapfiles/down-arrow.gif"></div></div>' ;

	html += '<div class="gmap-control-drop-down-menu"><ul>' ;
	
	html += '</ul></div>' ;
	
	controlDiv.innerHTML = html ;
  
	google.maps.event.addDomListener(controlDiv, 'click', function() {
		obj.UpdateLayerListMenu() ;
		if ( $(".gmap-control-drop-down-menu").css('display') == 'none' ) 
			$(".gmap-control-drop-down-menu").css("display", "block") ;
		else 
			$(".gmap-control-drop-down-menu").css("display", "none") ;
				
		$('.gmap-control-drop-down-menu ul li a').bind( 'click', {'layers': layers, 'map': map }, function(e) {
			var img = $(this).children('img:first');
			var isChecked = false;
			if ( img.attr('src') === "images/checked.png"){
				img.attr('src', "images/unchecked.png");
			} else {
				img.attr('src', "images/checked.png");
				isChecked = true;
			}
			
			var id = this.id ;
			var layers = e.data.layers ;
			
			for( i=0 ; i<layers.length ; i++ )
			{
				if ( layers[i].id == id ) 
				{
					if ( layers[i].type == "kml" )
					{
						if ( isChecked ) layers[i].layer.setMap(e.data.map) ;
						else layers[i].layer.setMap(null) ;
					}
					else if ( layers[i].type == "markers" )
					{
						layers[i].markers.setVisible(isChecked) ;
					}
				}
			}
							
			return false ;

		}) ;
	}); 
};

p.addLayers = function(_layers)
{
	var obj = this ;
	var map = this.map ;
	var offset = this.layers.length ;
		
	for( i = 0 ; i < _layers.length ; i++ )
	{
		_layers[i].finished = false ;
		
		if ( _layers[i].type == "kml" )
		{
			var layerUrl = _layers[i].url ;
			var layer = new google.maps.KmlLayer(layerUrl, { preserveViewport: true });
			_layers[i].layer = layer ;
			_layers[i].id = 'layer-' + (i + offset) ;
			layer.setMap(map) ;
				
			google.maps.event.addListener(layer, "defaultviewport_changed", function() {
				obj.bounds.union(this.getDefaultViewport()) ;
			}) ;
			google.maps.event.addListener(layer, "metadata_changed", ( function(index) {
				return function() {
					_layers[index].finished = true ;
					obj.checkFinished() ;
				}
			})(i)) ;
				
		}
		else if ( _layers[i].type == "markers" )
		{
			_layers[i].id = 'layer-' + (i + offset);
			
			var layer = _layers[i] ;
			
			layer.markers = null ;
			
			var markers = [] ;
			
			for ( var j=0 ; j<layer.data.length ; j++ )
			{
				var data = layer.data[j] ;
				
				var pos = new google.maps.LatLng(data.lat, data.lon) ;
				
				var markerImage = new google.maps.MarkerImage(data.icon, 
					new google.maps.Size(32, 32),
					new google.maps.Point(0, 0),
					new google.maps.Point(16, 16),
					new google.maps.Size(32, 32)
				);
				
				var marker = new google.maps.Marker({
								position: pos,
								map: map,
								title: data.desc,
								visible: true,
								icon: markerImage  
							} ) ;
							
						 // Create marker info window.
				var infoWindow = new google.maps.InfoWindow({	
					content: data.desc,
					size: new google.maps.Size(200, 80)
				});

				// Add marker click event listener.
				google.maps.event.addListener(marker, 'click', ( function(infowin) { 
					return function() {
						if ( obj.visibleInfoWindow ) obj.visibleInfoWindow.close();
						infowin.open(obj.map, this);
						obj.visibleInfoWindow = infowin ;
					} ; 
				})(infoWindow) ) ;
							
				markers.push(marker) ;
							
				obj.bounds.extend(pos) ;
			}
				
			_layers[i].markers = new MarkerLayer(markers) ;
						
			_layers[i].finished = true ;
			obj.checkFinished() ;
		}	
		
		this.layers.push(_layers[i]) ;
	}
} ;
	
p.initMap = function(mapDiv, _layers) {
	var obj = this ;
	var latlng = new google.maps.LatLng(39.1, 21.6);
	var options = {
		zoom: 5,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.TERRAIN,
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
			mapTypeIds: [google.maps.MapTypeId.ROADMAP,
			google.maps.MapTypeId.SATELLITE,
			google.maps.MapTypeId.HYBRID,
			google.maps.MapTypeId.TERRAIN]
		}	 
	};
	
   	var map = this.map = new google.maps.Map(mapDiv, options);
		
	this.addLayers(_layers) ;
		
		
	var layersControlDiv = document.createElement('DIV');
	layersControlDiv.setAttribute('id', 'map-layers-control') ;
	layersControlDiv.index = 1;
	layersControlDiv.style.padding = '5px';
	
	this.CreateLayersControl(layersControlDiv) ;
		
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(layersControlDiv);
		
	google.maps.event.addDomListener(layersControlDiv, 'click', function() {});
		
	var layers = this.layers ;
		
	google.maps.event.addListener(map, "zoom_changed", function() {
		for(var i=0 ; i<layers.length ; i++ )
			obj.updateLayerVisibility(layers[i]) ;
		} 
	) ;
	
};
	
