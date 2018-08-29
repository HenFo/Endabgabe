/**
 * @see https://stackoverflow.com/questions/37166172/mapbox-tiles-and-leafletjs
 */
var mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
var accessToken = 'pk.eyJ1IjoiZGltYm9kdW1ibyIsImEiOiJjamplN2t4dXYxaDY2M2twOTQzMXNocjc2In0.g9BJj267dR8RBxBBgi2fyQ';
var attribution = "<i class='fa fa-copyright'></i> <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> <i class='fa fa-copyright'> <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>";

//die verschiedenen Kartentypen werden eingelesen
var satellite = L.tileLayer(mapboxUrl, { id: 'satellite-streets-v10', attribution: attribution, maxZoom: 20, accessToken: accessToken }),
    outdor = L.tileLayer(mapboxUrl, { id: 'outdoors-v10', attribution: attribution, maxZoom: 20, accessToken: accessToken });

//trennen von allgemeinen Controlls und der Layercontrol
var map = new L.Map('map', { center: new L.LatLng(51.9606649, 7.6261347), zoomControl: false, zoom: 13 });
L.control.zoom({
    position: 'topright'
}).addTo(map);

//erstellen der Featuregroups, damit man Filtern kann was man sehen will
var Institute = L.featureGroup().addTo(map);
var Mensen = L.featureGroup().addTo(map);
var Fachbereiche = L.featureGroup().addTo(map);
L.control.layers(null, {
    'Institute': Institute,
    'Mensen': Mensen,
    'Fachbereiche': Fachbereiche
}, { position: 'topleft', collapsed: false }).addTo(map);

//Fullscreen Option
map.addControl(new L.Control.Fullscreen().setPosition("topright"));
L.control.layers(null,{
    "outdoor": outdor.addTo(map),
    "satellite": satellite,
}, { position: 'topright' }).addTo(map);

/**
 * GPS
 */
function getPosition() {
    map.locate({ setView: true, maxZoom: 16 });
}

/**
 * wird getriggert wenn ein GPS Signal empfangen wurde.
 * Dann wird die am naechsten liegende Mensa ermittelt und die Routedahin berechnet
 * @param {any} e
 */
function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.circle(e.latlng, radius).addTo(map);

    var mensa = nextMensa(e.latlng); //sammeln der noetigen Informationen
    var control = L.Routing.control({
        router: L.routing.mapbox(accessToken),
        waypoints: [
            e.latlng,
            { lat: mensa.lat, lng: mensa.lng }
        ],
        //routeWhileDragging: true,
        //geocoder: L.Control.Geocoder.nominatim(),
    }).addTo(map);
    control.hide(); //um das nervig groﬂe Fenster zu schlieﬂen

    //error control
    L.Routing.errorControl(control).addTo(map);

    var dist = Math.floor(100 * mensa.dist) / 100; //abrunden der Entfernung auf 2 Nachkommeastellen
    L.marker(e.latlng).addTo(map)
        .bindPopup("Du bist in einem " + radius + "m Radius von diesem Punkt <br/> Die naechste Mensa ist " + mensa.mensa + " mit " + dist+"km entfernung ").openPopup();
}
map.on('locationfound', onLocationFound);

/////////////////////////////////////////////////////////////////////////////////////
//aus der Code-Review von Nr. 7 Buttons to create start and end points of the route
function createButton(label, container) {
    var btn = L.DomUtil.create('button', '', container);
    btn.setAttribute('type', 'button');
    btn.innerHTML = label;
    return btn;
}
map.on('click', function (e) {
    var container = L.DomUtil.create('div'),
        startBtn = createButton('Start from this location', container),
        destBtn = createButton('Go to this location', container);

    L.popup()
        .setContent(container)
        .setLatLng(e.latlng)
        .openOn(map);


    L.DomEvent.on(startBtn, 'click', function () {
        control.spliceWaypoints(0, 1, e.latlng);
        map1.closePopup();
    });

    L.DomEvent.on(destBtn, 'click', function () {
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
        map1.closePopup();
    });
});
/////////////////////////////////////////////////////////////////////////////////////

/**
 * berechnet auf Grundlage eines Ausgangsortes die naechste Mensa
 * @param {JSON} latlng Ausgangsort
 * @returns {JSON} {dist: Entfernung, mensa: name der Mensa, lat: Laengengrad, lng: Breitengrad der Mensa}
 */
function nextMensa(latlng) {
    var dist = getDistance(latlng, mensen[0].coordinaten);
    var hMensa = null;
    //linearer Vergleich, welche Mensa am naechsten ist
    for (var i = 1; i < mensen.length; i++) {
        var verg = getDistance(latlng, mensen[i].coordinaten);
        if (dist > verg) {
            dist = verg;
            hMensa = mensen[i];
        }
    }
    return {
        dist:dist, mensa:hMensa.name, lat: hMensa.coordinaten[0], lng: hMensa.coordinaten[1]
    }
}

/**
* claculates the distance between start- and endpoint of two given coordinates
* @return returns the distance between start and end
* @see http://www.movable-type.co.uk/scripts/latlong.html
*/
function getDistance(start, end) {
    var radius = 6371; //Radius of earth
    var radLat1 = (start.lat * Math.PI) / 180; //converting the latitude to radial value
    var radLat2 = (end[0] * Math.PI) / 180;
    var deltLat = ((end[0] - start.lat) * Math.PI) / 180;
    var deltLon = ((end[1] - start.lng) * Math.PI) / 180;
    //doing some magic
    var a = Math.sin(deltLat / 2) * Math.sin(deltLat / 2) +
        Math.cos(radLat1) * Math.cos(radLat2) *
        Math.sin(deltLon / 2) * Math.sin(deltLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    //from Rad to km
    var d;
    return d = radius * c;
}


