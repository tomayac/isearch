define("mylibs/location",
  [],
  function(){
	
	var getCurrentLocation = function(callback) {
	  if(navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition( 
	   	  function(position) {
	        callback(position);	
	   	  },
	      function(error) {
	      	alert("Error getting your current location");
	   	  },
	   	  {enableHighAccuracy: true}
	    );
	  }
	}
	
	Map = function(mapDiv) {
	  this.map = null ;
	  this.bounds = new google.maps.LatLngBounds() ;
	  this.marker = null;
	  this.initMap(mapDiv);
	};
	
	Map.prototype.initMap = function(mapDiv, _layers) {
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
	  google.maps.event.addListener(map, 'click', function(event) {
		obj.placeMarker(event.latLng);
	  });
	};
	
	Map.prototype.placeMarker = function(location) {
	  var map = this.map;
	  var marker = this.marker;
	  if (marker) {
		marker.setPosition(location);
	  }
	  else {
		marker = this.marker = new google.maps.Marker({
		  position: location,
		  map: map
	    });
	  }
	  map.setCenter(location);
	}
	
	var showMap = function(callback) {
	  var map=null;
	  $('<div/>')
		.appendTo('body')
		.dialog({
		  title: "Choose a location",
		  width: $(window).width()*2/3,
		  height: $(window).height()*3/4,
		  modal: true,
		  resizable: false,
		  open: function(e, ui) {
			map = new Map($(this).get(0));
		  },
		  buttons: {
			OK: function() {
			  if(map.marker) {
				callback(map.marker.position.lat(), map.marker.position.lng());
			  	$(this).dialog("close");
			  }
			  else {
				alert("You must Select a location!");
			  }
			}
		  }
		});	
	};
	
	return {
	  getCurrentLocation: getCurrentLocation,
	  showMap: showMap
	};
  }
);
