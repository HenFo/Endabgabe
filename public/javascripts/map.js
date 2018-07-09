var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    osm = L.tileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib }),
    map = new L.Map('mapid', { center: new L.LatLng(51.961, 7.618), zoom: 13 }),
    drawnItems = L.featureGroup().addTo(map);
L.control.layers({
    'osm': osm.addTo(map),
    "google": L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
        attribution: 'google'
    })
}, { 'drawlayer': drawnItems }, { position: 'topleft', collapsed: false }).addTo(map);
map.addControl(new L.Control.Draw({
    edit: {
        featureGroup: drawnItems,
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

var geoJsonLayers = {
    "type": "FeatureCollection",
    "features": []
};
map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    geoJsonLayers.features.push(layer.toGeoJSON());
    console.log(geoJsonLayers);
    drawnItems.addLayer(layer);
});
function getPosition() {
    map.locate({ setView: true, maxZoom: 16 });
}
function onLocationFound(e) {
    var radius = e.accuracy / 2;
    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();
    L.circle(e.latlng, radius).addTo(map);
}

//function getGeoJSON() {
//    var element = document.createElement('a');
//    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent("" + JSON.stringify(geoJsonLayers)));
//    element.setAttribute('download', document.getElementById("inputGeoJsonName").value + '.JSON');
//    element.style.display = 'none';
//    document.body.appendChild(element);
//    element.click();
//    document.body.removeChild(element);
//}

function toDatabase() {
    var name = document.getElementById("inputGeoJsonName").value;
    if (name != "") {
        if (geoJsonLayers.features.length > 0) {
            var geoObject = { 'name': name, 'geoJSON': JSON.stringify(geoJsonLayers) };
            console.log(geoObject);
            $.ajax({
                type: 'POST',
                data: geoObject,
                url: "./GeoJson",
            })
        } else {
            var geoObject = { 'name': name, 'geoJSON': JSON.stringify(geoJsonLayers) };
            console.log(geoObject);
            $.ajax({
                type: 'POST',
                data: geoObject,
                url: "./GeoJson",
            })
            JL("mylogger").warn("keine Features wurden gezeichnet");
        }
    } else {
        alert("bitte Name für die Collection einfügen");
        JL("mylogger").warn("Name für Collection fehlt");
    }
}

function fromDatabase() {
    var layer = { 'name': document.getElementById("inputGeoJsonName").value };
    $.ajax({
        type: 'GET',
        data: layer,
        url: "./addToMap",
        success: function (res) {
            console.log(res[0]);
            document.getElementById("urlToGeoJSON").value = JSON.stringify(res[0].GeoObject);
            loadDoc();
        }
    })
    
}

var markerA = L.marker([51.969371, 7.595696]).addTo(map);
markerA.bindPopup("Institut für Geoinformatik <br> Heisenbergstraße 2 <br> 48149 Münster <br> <image src='https://www.uni-muenster.de/imperia/md/images/geoinformatics/sliderimage_de_1492x746.png' width='150px'></image>").openPopup();
map.on('locationfound', onLocationFound);
