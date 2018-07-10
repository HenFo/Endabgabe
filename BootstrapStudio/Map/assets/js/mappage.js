//var osmurl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
//    osmattrib = '&copy; <a href="http://openstreetmap.org/copyright">openstreetmap</a> contributors',
//    osm = l.tilelayer(osmurl, { maxzoom: 18, attribution: osmattrib }),
//    map = new l.map('map', { center: new l.latlng(51.961, 7.618), zoom: 13 }),
//    drawnitems = l.featuregroup().addto(map);
//l.control.layers({
//    'osm': osm.addto(map),
//    "mapbox": l.tilelayer('pk.eyj1ijoizgltym9kdw1ibyisimeioijjampln2t4dxyxady2m2twotqzmxnocjc2in0.g9bjj267dr8rbxbbgi2fyq', {
//        attribution: 'mapbox'
//    })
//})

/**
 * @see https://stackoverflow.com/questions/37166172/mapbox-tiles-and-leafletjs
 */
var mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
var accessToken = 'pk.eyJ1IjoiZGltYm9kdW1ibyIsImEiOiJjamplN2t4dXYxaDY2M2twOTQzMXNocjc2In0.g9BJj267dR8RBxBBgi2fyQ';
var attribution = "<i class='fa fa-copyright'></i> <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> <i class='fa fa-copyright'> <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>";

var satellite = L.tileLayer(mapboxUrl, { id: 'satellite-streets-v9', attribution: attribution, maxZoom: 20, accessToken: accessToken }),
    outdor = L.tileLayer(mapboxUrl, { id: 'outdoors-v9', attribution: attribution, maxZoom: 20, accessToken: accessToken });

var map = new L.Map('map', { center: new L.LatLng(51.9606649, 7.6261347), zoom: 13 });
L.control.layers({
    "outdoor": outdor.addTo(map),
    "satellite": satellite,
}).addTo(map);