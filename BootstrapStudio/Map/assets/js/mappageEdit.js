/**
 * @see https://stackoverflow.com/questions/37166172/mapbox-tiles-and-leafletjs
 */
var mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
var accessToken = 'pk.eyJ1IjoiZGltYm9kdW1ibyIsImEiOiJjamplN2t4dXYxaDY2M2twOTQzMXNocjc2In0.g9BJj267dR8RBxBBgi2fyQ';
var attribution = "<i class='fa fa-copyright'></i> <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> <i class='fa fa-copyright'> <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>";

var satellite = L.tileLayer(mapboxUrl, { id: 'satellite-streets-v10', attribution: attribution, maxZoom: 20, accessToken: accessToken }),
    outdor = L.tileLayer(mapboxUrl, { id: 'outdoors-v10', attribution: attribution, maxZoom: 20, accessToken: accessToken });

var map = new L.Map('mapEdit', { center: new L.LatLng(51.9606649, 7.6261347), zoomControl: false, zoom: 13 });
L.control.zoom({
    position: 'topright'
}).addTo(map);

L.control.layers({
    "vector": outdor.addTo(map),
    "satellite": satellite,
},null, { position: 'topright' }).addTo(map);

var Institute = L.featureGroup().addTo(map);
var Mensen = L.featureGroup().addTo(map);
var Fachbereiche = L.featureGroup().addTo(map);
var drawnItems = L.featureGroup().addTo(map);
L.control.layers(null, {
    'Institute': Institute,
    'Mensen': Mensen,
    'Fachbereiche': Fachbereiche
}, { position: 'topleft', collapsed: false }).addTo(map);

var hActiv = -1;

function addInstitut() {
    hActiv = 0;
    map.addControl(new L.Control.Draw({
        edit: {
            featureGroup: Institute,
            poly: {
                allowIntersection: false
            }
        },
        draw: {
            polygon: {
                allowIntersection: false,
                showArea: true
            }
        }
    }));
}

var geoJsonLayers = {
    "type": "FeatureCollection",
    "features": []
};

/**
 * Speichert, je nachdem welches feature bearbeitet wird, dieses ab
 */
map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    switch (hActiv) {
        case 0:
            geoJsonLayers.features.push(layer.toGeoJSON());
            Institute.addLayer(layer);
            hActiv = -1;
            console.log(Institute);
            break;
        case 1:
            geoJsonLayers.features.push(layer.toGeoJSON());
            Mensen.addLayer(layer);
            hActiv = -1;
            break;
        case 2:
            geoJsonLayers.features.push(layer.toGeoJSON());
            Fachbereiche.addLayer(layer);
            hActiv = -1;
            break;
        default:
            hActiv = -1;
            break;
    }
});

function openList(listID) {
    $("#" + listID).show();
}