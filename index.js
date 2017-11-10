/**
 *  index.js
 */

'use strict';

const ALL_YEARS_LABEL = "All";
const YEAR_KEYS = ["2007","2008","2009","2010","2011","2012","2013","2014","2015","2016","2017",ALL_YEARS_LABEL];
const $years = document.getElementById('years');

// build RefugePoint data


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


// Set up Mapbox map.
// Access token is under Ben's Citymaps account

mapboxgl.accessToken = 'pk.eyJ1IjoiYmVuLWNpdHltYXBzIiwiYSI6Imt2SVhSa3MifQ.7Llc31vHrYdpHRj9RTOfFQ';
const colors = {
  "COUNTRY_INACTIVE": "#358",
  "COUNTRY_ACTIVE"  : "#f3f3f3",
  "COUNTRY_BORDER"  : "#00b5cc",
  "COUNTRY_HOVER"   : "#00b5cc",
  "COUNTRY_BORDER_HOVER": "#f8971d"
}

let map = new mapboxgl.Map({
  container: 'map-container',
  style: 'mapbox://styles/ben-citymaps/cj9tdnhko2vhq2rnybxftd6ob',
  center: [0, 12],

  maxBounds: [[-180, -65], [180, 72]],

  zoom: 2,
  minZoom: 1,
  maxZoom: 4,
 
  // No keyboard rotation or 3D pitch
  dragRotate: false,
  pitchWithRotate: false,

  attributionControl: false,
});

// Leave pinch-to-zoom enabled, but disable rotation
map.touchZoomRotate.disableRotation();

map.on('load', () => {

  // Set up data sources and styles

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
    "paint": {
      "fill-color": colors.COUNTRY_INACTIVE,
      "fill-opacity": 1
    }
  });
  map.addLayer({
    "id": "rp-country-fills",
    "type": "fill",
    "source": "rpCountries",
    "paint": {
      "fill-color": colors.COUNTRY_ACTIVE,
      "fill-opacity": 1
    }
  });
  map.addLayer({
    "id": "country-borders",
    "type": "line",
    "source": "countries",
    "paint": {
        "line-color": colors.COUNTRY_BORDER,
        "line-width": 1
    }
  });
  map.addLayer({
    "id": "rp-country-fills-hover",
    "type": "fill",
    "source": "rpCountries",
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

  let changeActiveCountry = function(e) {
    map.setFilter("rp-country-fills-hover", ["==", PROPERTY_KEY, e.features[0].properties[PROPERTY_KEY]]);
    map.setFilter("rp-country-borders-hover", ["==", PROPERTY_KEY, e.features[0].properties[PROPERTY_KEY]]);
    popup.setLngLat(e.lngLat)
      .setHTML('<div id="infobox">'+e.features[0].properties.ADMIN+'</div>')
      .addTo(map);
  }

  let onClickYear = function(year, el, e) {
    Array.prototype.forEach.call(document.getElementsByClassName('year'), (yearEl => yearEl.className = 'year'));
    el.className = 'year active';
    map.getSource('rpCountries').setData({
      type: rpCountryGeoJson.type,
      crs: rpCountryGeoJson.crs,
      features: (year === ALL_YEARS_LABEL) ?
        rpCountryGeoJson.features :
        rpCountryGeoJson.features.filter(c => c.properties.AnnualData[year] === 1)
    });
  }

  map.on("mousemove", "rp-country-fills", changeActiveCountry);
  // Adding click event for mobile taps
  map.on("click",     "rp-country-fills", changeActiveCountry);

  map.on("mouseleave", "rp-country-fills-hover", () => {
    map.setFilter("rp-country-fills-hover", ["==", PROPERTY_KEY, ""]);
    map.setFilter("rp-country-borders-hover", ["==", PROPERTY_KEY, ""]);
    popup.remove();
  });


  // Build clickable labels to show data by year

  YEAR_KEYS.forEach(y => {
    let el = document.createElement('li');
    el.innerHTML = y;

    // Ignore annual data if "ALL" is active, just show all countries we have any data for
    if (y === ALL_YEARS_LABEL) {
      el.className = 'year active';
    } else {
      el.className = 'year';
    }

    el.addEventListener('click', onClickYear.bind(this, y, el));
    $years.appendChild(el);
  });
});


