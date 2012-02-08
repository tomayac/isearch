
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
var MarkerFactory = (function() {
  var width = 16;
  var height = 32;
  return new function() {

    var h = 1;
    var s = 78; // constant saturation
    var l = 63; // constant luminance
    var a = 1;

    var getColor = function(val, range) {
      h = Math.floor((360 / range) * val);

      return "hsla(" + h +"," + s + "%," + l +"%," + a +")";
    };

    var getColor1 = function() {
      return "hsla(" + h +"," + s + "%," + (l - 30) +"%," + a +")";
    };

    // draws a rounded rectangle
    var drawRect = function(context, x, y, width, height) {
      var radius = 5
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + radius);
      context.lineTo(x + width, y + height - radius);
      context.quadraticCurveTo(x + width, y + height, x + width -
      radius, y + height);
      context.lineTo(x + radius, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - radius);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.closePath();
    }
	
	var drawMarker = function(c, x, y, width, height) {
      var radius = 0.5*width ;
	  
		c.beginPath();
		
		var x0 = x + radius ;
		var y0 = y ;
		
		var r = 0.9*radius ;
		var h = height ;

		c.moveTo(x0, y0); 
		c.bezierCurveTo(x0,y0,x0-r,y0,x0-r, y0+r);
		c.bezierCurveTo(x0-r, y0+0.45*h, x0, y0+0.55*h, x0, y0+0.9*h);
		c.bezierCurveTo(x0, y0+0.55*h, x0+r, y0+0.45*h,x0+r, y0+r);
		c.bezierCurveTo(x0+r,y0,x0,y0,x0,y0);
	    c.closePath();
    }
	
	
		
    this.createCanvas = function(range) {
		var canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		var context = canvas.getContext("2d");

		context.clearRect(0,0,width,height);
		
		var color0 = "black" ;// getColor(val, range);

		context.fillStyle = getColor(range, 200);
		context.strokeStyle = color0;

		drawMarker(context, 0, 0, width, height);
	 		
		context.fill();
		context.stroke();

		context.fillStyle = "white";
		context.strokeStyle = "black"
	
		return canvas;
    };

    this.create = function(range) {
		var canvas = this.createCanvas(range);
		return canvas.toDataURL();
    };
  }
})();

/////////////////////////////////////////////////////////////////////////////////

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}

function ScaleBarControl(controlDiv, map) {

	// Set CSS styles for the DIV containing the control
	// Setting padding to 5 px will offset the control
	// from the edge of the map.
	controlDiv.style.padding = '5px';

	// Set CSS for the control border.
	var controlUI = document.createElement('DIV');
	controlUI.style.cursor = 'pointer';
	controlUI.title = 'Relevance scale';
	controlDiv.appendChild(controlUI);
  
	var canvas = document.createElement('canvas');
  
	canvas.width = 200;
	canvas.height = 18;

	var context = canvas.getContext("2d");
	
	var x = 0 ;
	for(var i=0 ; i<200 ; i+=5 )
	{
		var rgb = hslToRgb(i/360, 0.78, 0.63) ;
		var clr = 'rgb(' + Math.floor(rgb[0]) + ',' + Math.floor(rgb[1]) +  ',' + Math.floor(rgb[2]) + ')' ;
		context.fillStyle = clr;
		context.fillRect(x, 0, 5, 18) ;
		x += 5 ;
	}
		   
	context.strokeStyle = "white" ;
	context.strokeRect(0, 0, 200, 18) ;	
	controlUI.appendChild(canvas);

}


/////////////////////////////////////////////////////////////////////////////////
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
							visible: true,
							icon: MarkerFactory.create(data.score*100) 
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
		
	var homeControlDiv = document.createElement('DIV');
	var homeControl = new ScaleBarControl(homeControlDiv, map);

	homeControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(homeControlDiv);
	
		
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
	
