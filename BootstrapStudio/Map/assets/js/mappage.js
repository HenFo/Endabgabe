/**
 * @see https://stackoverflow.com/questions/37166172/mapbox-tiles-and-leafletjs
 */
var mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
var accessToken = 'pk.eyJ1IjoiZGltYm9kdW1ibyIsImEiOiJjamplN2t4dXYxaDY2M2twOTQzMXNocjc2In0.g9BJj267dR8RBxBBgi2fyQ';
var attribution = "<i class='fa fa-copyright'></i> <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> <i class='fa fa-copyright'> <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>";

var satellite = L.tileLayer(mapboxUrl, { id: 'satellite-streets-v10', attribution: attribution, maxZoom: 20, accessToken: accessToken }),
    outdor = L.tileLayer(mapboxUrl, { id: 'outdoors-v10', attribution: attribution, maxZoom: 20, accessToken: accessToken });

var map = new L.Map('map', { center: new L.LatLng(51.9606649, 7.6261347), zoomControl: false, zoom: 13 });
L.control.zoom({
    position: 'topright'
}).addTo(map);

///**
// * @see https://github.com/8to5Developer/leaflet-custom-searchbox
// */
//$(document).ready(function () {
//    var searchboxControl = createSearchboxControl();
//    var control = new searchboxControl({
//        sidebarTitleText: 'Header',
//        sidebarMenuItems: {
//            Items: [
//                { type: "link", name: "Link 1 (github.com)", href: "http://github.com", icon: "icon-local-carwash" },
//                { type: "link", name: "Link 2 (google.com)", href: "http://google.com", icon: "icon-cloudy" },
//                { type: "button", name: "Button 1", onclick: "alert('button 1 clicked !')", icon: "icon-potrait" },
//                { type: "button", name: "Button 2", onclick: "button2_click();", icon: "icon-local-dining" },
//                { type: "link", name: "Link 3 (stackoverflow.com)", href: 'http://stackoverflow.com', icon: "icon-bike" },
//            ]
//        }
//    });
//    control._searchfunctionCallBack = function (searchkeywords) {
//        if (!searchkeywords) {
//            searchkeywords = "The search call back is clicked !!"
//        }
//        alert(searchkeywords);
//    }
//    map.addControl(control);
//});

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

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}
map.on('locationfound', onLocationFound);


