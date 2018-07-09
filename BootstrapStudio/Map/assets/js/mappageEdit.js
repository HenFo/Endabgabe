var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    osm = L.tileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib }),
    map = new L.Map('mapEdit', { center: new L.LatLng(51.961, 7.618), zoom: 13 }),
    drawnItems = L.featureGroup().addTo(map);
L.control.layers({
    'osm': osm.addTo(map),
    "google": L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
        attribution: 'google'
    })
}, { 'drawlayer': drawnItems }, { position: 'topleft', collapsed: true }).addTo(map);
map.addControl(new L.Control.Draw({
    edit: {
        featureGroup: drawnItems,
        poly: {
            allowIntersection: true
        }
    },
    draw: {
        polygon: {
            allowIntersection: true,
            showArea: true
        }
    }
}));


var geoJsonLayers = {
    "type": "FeatureCollection",
    "features": []
};

map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;

    geoJsonLayers.features.push(layer.toGeoJSON());
    drawnItems.addLayer(layer);
});