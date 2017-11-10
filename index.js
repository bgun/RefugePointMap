/**
 *  index.js
 */

'use strict';

mapboxgl.accessToken = 'pk.eyJ1IjoiYmVuLWNpdHltYXBzIiwiYSI6Imt2SVhSa3MifQ.7Llc31vHrYdpHRj9RTOfFQ';
let map = new mapboxgl.Map({
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

const ALL_YEARS_LABEL = "All";

const colors = {
  "COUNTRY_INACTIVE": "#358",
  "COUNTRY_ACTIVE"  : "#f3f3f3",
  "COUNTRY_BORDER"  : "#00b5cc",
  "COUNTRY_HOVER"   : "#00b5cc",
  "COUNTRY_BORDER_HOVER": "#f8971d"
}

const PROPERTY_KEY = "ADMIN";
let rpCountryGeoJson = {
  type: "FeatureCollection",
  crs: { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } }
};
rpCountryGeoJson.features = graphdata.map(rp => {
  let feature = countriesGeoJson.features.filter(c => c.properties.SOV_A3 === rp.CountryAbbrev)[0];
  if (feature) {
    feature.properties = Object.assign({}, feature.properties, rp);
    return feature;
  } else {
    throw new Error("Could not find %s in country data", rp.CountryAbbrev);
    return null;
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
    "id": "country-fills-inactive",
    "type": "fill",
    "source": "countries",
    "layout": {},
    "paint": {
      "fill-color": colors.COUNTRY_INACTIVE,
      "fill-opacity": 1
    }
  });
  map.addLayer({
    "id": "rp-country-fills",
    "type": "fill",
    "source": "rpCountries",
    "layout": {},
    "paint": {
      "fill-color": colors.COUNTRY_ACTIVE,
      "fill-opacity": 1
    }
  });
  map.addLayer({
    "id": "country-borders",
    "type": "line",
    "source": "countries",
    "layout": {},
    "paint": {
        "line-color": colors.COUNTRY_BORDER,
        "line-width": 1
    }
  });
  map.addLayer({
    "id": "rp-country-fills-hover",
    "type": "fill",
    "source": "rpCountries",
    "layout": {},
    "paint": {
        "fill-color": colors.COUNTRY_HOVER,
        "fill-opacity": 1
    },
    "filter": ["==", PROPERTY_KEY, ""]
  });
  map.addLayer({
    "id": "rp-country-borders-hover",
    "type": "line",
    "source": "rpCountries",
    "layout": {},
    "paint": {
        "line-color": colors.COUNTRY_BORDER_HOVER,
        "line-width": 3
    },
    "filter": ["==", PROPERTY_KEY, ""]
  });

  let popup = new mapboxgl.Popup({
    closeButton: false,
    offset: [0,-20]
  });

  function setActive(e) {
    map.setFilter("rp-country-fills-hover", ["==", PROPERTY_KEY, e.features[0].properties[PROPERTY_KEY]]);
    map.setFilter("rp-country-borders-hover", ["==", PROPERTY_KEY, e.features[0].properties[PROPERTY_KEY]]);
    popup.setLngLat(e.lngLat)
      .setHTML('<div id="infobox">'+e.features[0].properties.ADMIN+'</div>')
      .addTo(map);
  }

  map.on("mousemove", "rp-country-fills", setActive);

  map.on("mouseleave", "rp-country-fills-hover", function() {
    map.setFilter("rp-country-fills-hover", ["==", PROPERTY_KEY, ""]);
    map.setFilter("rp-country-borders-hover", ["==", PROPERTY_KEY, ""]);
    popup.remove();
  });

  map.on("click", "rp-country-fills", setActive);

  let years = ["2007","2008","2009","2010","2011","2012","2013","2014","2015","2016","2017",ALL_YEARS_LABEL];
  let $years = document.getElementById('years');
  years.forEach(y => {
    let el = document.createElement('li');
    el.innerHTML = y;
    if (y === ALL_YEARS_LABEL) {
      el.className = 'year active';
    } else {
      el.className = 'year';
    }
    el.addEventListener('click', (e) => {
      Array.prototype.forEach.call(document.getElementsByClassName('year'), (yearEl => yearEl.className = 'year'));
      el.className = 'year active';
      map.getSource('rpCountries').setData({
        type: rpCountryGeoJson.type,
        crs: rpCountryGeoJson.crs,
        features: (y === ALL_YEARS_LABEL) ?
          rpCountryGeoJson.features :
          rpCountryGeoJson.features.filter(c => c.properties.AnnualData[y] === 1)
      });
    });
    $years.appendChild(el);
  });
});


