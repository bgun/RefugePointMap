mapboxgl.accessToken = 'pk.eyJ1IjoiYmVuLWNpdHltYXBzIiwiYSI6Imt2SVhSa3MifQ.7Llc31vHrYdpHRj9RTOfFQ';
var map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/ben-citymaps/cj9tdnhko2vhq2rnybxftd6ob',
    center: [0, 12],

    zoom: 2,
    minZoom: 1,
    maxZoom: 4,

    dragRotate: false,
    pitchWithRotate: false,
    touchZoomRotate: false,
});


// build RefugePoint data

var property_key = "ADMIN";
var rpCountryAbbrevs = graphdata.map(c => c.CountryAbbrev);
var rpCountryGeoJson = {
  "type": "FeatureCollection",
  "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } }
};
rpCountryGeoJson.features = countriesGeoJson.features.filter(c => {
  if (rpCountryAbbrevs.indexOf(c.properties.SOV_A3) > -1) {
    return true;
  } else {
    return false;
  }
});


// set up map events

map.on('load', function () {
  map.addSource("countries", {
    "type": "geojson",
    "data": countriesGeoJson
  });
  map.addSource("rpCountries", {
    "type": "geojson",
    "data": rpCountryGeoJson
  });
  map.addLayer({
    "id": "country-fills",
    "type": "fill",
    "source": "countries",
    "layout": {},
    "paint": {
      "fill-color": "#AAAAAA",
      "fill-opacity": 1
    }
  });
  map.addLayer({
    "id": "rp-country-fills",
    "type": "fill",
    "source": "rpCountries",
    "layout": {},
    "paint": {
      "fill-color": "#F3F3F3",
      "fill-opacity": 1
    }
  });
  map.addLayer({
    "id": "country-borders",
    "type": "line",
    "source": "countries",
    "layout": {},
    "paint": {
        "line-color": "#3388FF",
        "line-width": 1
    }
  });
  map.addLayer({
    "id": "rp-country-fills-hover",
    "type": "fill",
    "source": "countries",
    "layout": {},
    "paint": {
        "fill-color": "#44AAFF",
        "fill-opacity": 1
    },
    "filter": ["==", property_key, ""]
  });

  map.on("mousemove", "rp-country-fills", function(e) {
    map.setFilter("rp-country-fills-hover", ["==", property_key, e.features[0].properties[property_key]]);
    var markup = "<p>"+e.features[0].properties.ADMIN+"</p>";
    showInfoBox(e.point, markup);
  });

  map.on("mouseleave", "rp-country-fills-hover", function() {
    map.setFilter("rp-country-fills-hover", ["==", property_key, ""]);
    hideInfoBox();
  });

  map.on("click", "rp-country-fills", function(e) {
    map.setFilter("rp-country-fills-hover", ["==", property_key, e.features[0].properties[property_key]]);
    var markup = "<p>"+e.features[0].properties.ADMIN+"</p>";
    showInfoBox(e.point, markup);
  });
});


var years = ["2007","2008","2009","2010","2011","2012","2013","2014","2015","2016","2017"];
var $years = document.getElementById('years');
years.forEach(y => {
  var el = document.createElement('li');
  el.innerHTML = y;
  $years.appendChild(el);
});

var $infobox = document.getElementById('infobox');
var showInfoBox = function(point, markup) {
  $infobox.style.display = "table";
  $infobox.style.top = (point.y+5)+"px";
  $infobox.style.left = (point.x+5)+"px";
  $infobox.innerHTML = markup;
};
var hideInfoBox = function() {
  $infobox.style.display = "none";
};
