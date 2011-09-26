
// http://gmaps-samples-v3.googlecode.com/svn/trunk/infowindow_custom/infowindow-custom.html

/* An InfoBox is like an info window, but it displays
 * under the marker, opens quicker, and has flexible styling.
 * @param {GLatLng} latlng Point to place bar at
 * @param {Map} map The map on which to display this InfoBox.
 * @param {Object} opts Passes configuration options - content,
 *   offsetVertical, offsetHorizontal, className, height, width
 */
 
function InfoBox(opts) {
  google.maps.OverlayView.call(this);
  this.latlng_ = opts.latlng;
  this.map_ = opts.map;
  this.offsetVertical_ = -195;
  this.offsetHorizontal_ = 0;
  this.height_ = 185;
  this.width_ = 130;
  this.data = opts.data ;
  this.thumbRenderer = opts.thumbRenderer ;

  var me = this;
  this.boundsChangedListener_ =
    google.maps.event.addListener(this.map_, "bounds_changed", function() {
      return me.panMap.apply(me);
    });

  // Once the properties of this OverlayView are initialized, set its map so
  // that we can display it.  This will trigger calls to panes_changed and
  // draw.
  this.setMap(this.map_);
}

/* InfoBox extends GOverlay class from the Google Maps API
 */
InfoBox.prototype = new google.maps.OverlayView();

/* Creates the DIV representing this InfoBox
 */
InfoBox.prototype.remove = function() {
  if (this.div_) {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
  }
};

/* Redraw the Bar based on the current projection and zoom level
 */
InfoBox.prototype.draw = function() {
  // Creates the element if it doesn't exist already.
  this.createElement();
  if (!this.div_) return;

  // Calculate the DIV coordinates of two opposite corners of our bounds to
  // get the size and position of our Bar
  var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
  if (!pixPosition) return;

  // Now position our DIV based on the DIV coordinates of our bounds
 // this.div_.style.width = this.width_ + "px";
  this.div_.style.left = (pixPosition.x + this.offsetHorizontal_) + "px";
 // this.div_.style.height = this.height_ + "px";
  this.div_.style.top = (pixPosition.y + this.offsetVertical_) + "px";
  this.div_.style.display = 'block';
};

InfoBox.prototype.close = function() {
	this.setMap(null);

};
/* Creates the DIV representing this InfoBox in the floatPane.  If the panes
 * object, retrieved by calling getPanes, is null, remove the element from the
 * DOM.  If the div exists, but its parent is not the floatPane, move the div
 * to the new pane.
 * Called from within draw.  Alternatively, this can be called specifically on
 * a panes_changed event.
 */
InfoBox.prototype.createElement = function() {
  var panes = this.getPanes();
  var div = this.div_;
  if (!div) {
    // This does not handle changing panes.  You can set the map to be null and
    // then reset the map to move the div.
    div = this.div_ = $('<div/>', { "class": "gmaps-infobox", "width": this.width_ + "px" }).get(0) ;
    	
	var contentDiv = $('<div/>', { css: { width: "128px" }}) ;
						
	var tr = this.thumbRenderer ;
	var thumb = this.data ;
	
	// select default media to show
	var mediaType = null ;
	if ( thumb.defaultMedia )
		mediaType = thumb.defaultMedia ;
	else if ( thumb.doc.media.length > 0 )
		mediaType = thumb.doc.media[0].type ;
		   
	tr.renderContents(contentDiv, thumb, mediaType) ;

    var topDiv = $('<div/>', { css: { "text-align": "right" } }).appendTo(div) ;
	var closeImg = $('<img/>', { css: { width: "32px", height: "32px", cursor: "pointer" }, src: "http://gmaps-samples.googlecode.com/svn/trunk/images/closebigger.gif" }).appendTo(topDiv) ;

    function removeInfoBox(ib) {
      return function() {
        ib.setMap(null);
      };
    }

    google.maps.event.addDomListener(closeImg.get(0), 'click', removeInfoBox(this));
	contentDiv.appendTo(div) ;
	div.style.display = 'none';
    panes.floatPane.appendChild(div);
    this.panMap();
  } else if (div.parentNode != panes.floatPane) {
    // The panes have changed.  Move the div.
    div.parentNode.removeChild(div);
    panes.floatPane.appendChild(div);
  } else {
    // The panes have not changed, so no need to create or move the div.
  }
}

/* Pan the map to fit the InfoBox.
 */
InfoBox.prototype.panMap = function() {
  // if we go beyond map, pan map
  var map = this.map_;
  var bounds = map.getBounds();
  if (!bounds) return;

  // The position of the infowindow
  var position = this.latlng_;

  // The dimension of the infowindow
  var iwWidth = this.width_;
  var iwHeight = this.height_;

  // The offset position of the infowindow
  var iwOffsetX = this.offsetHorizontal_;
  var iwOffsetY = this.offsetVertical_;

  // Padding on the infowindow
  var padX = 40;
  var padY = 40;

  // The degrees per pixel
  var mapDiv = map.getDiv();
  var mapWidth = mapDiv.offsetWidth;
  var mapHeight = mapDiv.offsetHeight;
  var boundsSpan = bounds.toSpan();
  var longSpan = boundsSpan.lng();
  var latSpan = boundsSpan.lat();
  var degPixelX = longSpan / mapWidth;
  var degPixelY = latSpan / mapHeight;

  // The bounds of the map
  var mapWestLng = bounds.getSouthWest().lng();
  var mapEastLng = bounds.getNorthEast().lng();
  var mapNorthLat = bounds.getNorthEast().lat();
  var mapSouthLat = bounds.getSouthWest().lat();

  // The bounds of the infowindow
  var iwWestLng = position.lng() + (iwOffsetX - padX) * degPixelX;
  var iwEastLng = position.lng() + (iwOffsetX + iwWidth + padX) * degPixelX;
  var iwNorthLat = position.lat() - (iwOffsetY - padY) * degPixelY;
  var iwSouthLat = position.lat() - (iwOffsetY + iwHeight + padY) * degPixelY;

  // calculate center shift
  var shiftLng =
      (iwWestLng < mapWestLng ? mapWestLng - iwWestLng : 0) +
      (iwEastLng > mapEastLng ? mapEastLng - iwEastLng : 0);
  var shiftLat =
      (iwNorthLat > mapNorthLat ? mapNorthLat - iwNorthLat : 0) +
      (iwSouthLat < mapSouthLat ? mapSouthLat - iwSouthLat : 0);

  // The center of the map
  var center = map.getCenter();

  // The new map center
  var centerX = center.lng() - shiftLng;
  var centerY = center.lat() - shiftLat;

  // center the map to the new shifted center
  map.setCenter(new google.maps.LatLng(centerY, centerX));

  // Remove the listener after panning is complete.
  google.maps.event.removeListener(this.boundsChangedListener_);
  this.boundsChangedListener_ = null;
};

/////////////////////////////////////////////////////////////////////////////////

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

GoogleMap = function(mapDiv, thumbRenderer, layers_) {

	this.map = null ;
	this.layers = [] ;
	this.bounds = new google.maps.LatLngBounds() ;
	this.visibleInfoWindow = null ;
	this.thumbRenderer = thumbRenderer ;
	
	this.initMap(mapDiv, layers_) ;
};

var p = GoogleMap.prototype ;

p.visibleInfoWindow = null ;

p.getMapZoomRange = function() {
	var currentMapTypeId = this.map.getMapTypeId();
	mapType = this.map.mapTypes.get(currentMapTypeId) ;
	var minZoom = 0, maxZoom = 30 ;
	if ( mapType )
	{
		if ( typeof(mapType.minZoom) == "number")  minZoom = mapType.minZoom;
		if ( typeof(mapType.maxZoom) == "number") maxZoom = mapType.maxZoom ;
	}
	
	return { 'minzoom': minZoom, 'maxzoom': maxZoom } ;
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
	

p.addLayers = function(_layers)
{
	var obj = this ;
	var map = this.map ;
	var offset = this.layers.length ;
		
	for( i = 0 ; i < _layers.length ; i++ )
	{
		_layers[i].finished = false ;
		
		if ( _layers[i].type == "markers" )
		{
			_layers[i].id = 'layer-' + (i + offset);
			
			var layer = _layers[i] ;
			
			layer.markers = null ;
			
			var markers = [] ;
			
			for ( var j=0 ; j<layer.data.length ; j++ )
			{
				var data = layer.data[j] ;
				
				var pos = new google.maps.LatLng(data.lat, data.lon) ;
				
				var marker ;
				
				if ( data.hasOwnProperty("icon") )
				{
					var markerImage = new google.maps.MarkerImage(data.icon, 
						new google.maps.Size(32, 32),
						new google.maps.Point(0, 0),
						new google.maps.Point(16, 16),
						new google.maps.Size(32, 32)
					);
				
					marker = new google.maps.Marker({
							position: pos,
							map: map,
							title: data.tooltip,
							visible: true,
							icon: markerImage  
					} ) ;
				}
				else
				{
					marker = new google.maps.Marker({
							position: pos,
							map: map,
							title: data.tooltip,
							visible: true
					} ) ;
				}							
		
				google.maps.event.addListener(marker, "click", 	(function(data, marker) { 
					return function(e) {
						if ( obj.visibleInfoWindow ) obj.visibleInfoWindow.close() ;
						obj.visibleInfoWindow = new InfoBox({latlng: marker.getPosition(), map: map, data: data.data, thumbRenderer: obj.thumbRenderer});
						}
					})(data, marker));
				
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
	
	var layers = this.layers ;
		
	google.maps.event.addListener(map, "zoom_changed", function() {
		for(var i=0 ; i<layers.length ; i++ )
			obj.updateLayerVisibility(layers[i]) ;
		} 
	) ;
	
	google.maps.event.addListener(map, "bounds_changed", function() {
		for(var i=0 ; i<layers.length ; i++ )
			obj.updateLayerVisibility(layers[i]) ;
		} 
	) ;
	
};
	
