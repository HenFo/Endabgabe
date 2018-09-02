"use strict";

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
//L.control.layers(null, {
//    'Institute': Institute,
//}, { position: 'topleft', collapsed: false }).addTo(map);

//Fullscreen Option
map.addControl(new L.Control.Fullscreen().setPosition("topright"));
L.control.layers(null, {
    "outdoor": outdor.addTo(map),
    "satellite": satellite,
}, { position: 'topright' }).addTo(map);

/////////////////////////////////////////////////////////////////////////////////////
//aus der Code-Review von Nr. 7 Buttons to create start and end points of the route
function createButton(label, container) {
    var btn = L.DomUtil.create('button', '', container);
    btn.setAttribute('type', 'button');
    btn.setAttribute('class', 'btn popup navigation')
    btn.innerHTML = label;
    return btn;
}
map.on('click', function (e) {
    var container = L.DomUtil.create('div'),
        startBtn = createButton('Hier starten', container),
        destBtn = createButton('Hier hin', container);

    L.popup()
        .setContent(container)
        .setLatLng(e.latlng)
        .openOn(map);

    L.DomEvent.on(startBtn, 'click', function () {
        control.spliceWaypoints(0, 1, e.latlng);
        map.closePopup();
    });

    L.DomEvent.on(destBtn, 'click', function () {
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
        map.closePopup();
    });
});
/////////////////////////////////////////////////////////////////////////////////////






//////////////////////////////////////////////////////////////


var instituteArr = [{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Geo1",
                "fachbereich": "FB14",
                "image": "https://www.eternit.de/referenzen/media/catalog/product/cache/2/image/890x520/9df78eab33525d08d6e5fb8d27136e95/g/e/geo1_institut_muenster_01.jpg"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            51.96966694957956,
                            7.5955116748809814
                        ],
                        [
                            51.969290189054426,
                            7.595369517803192
                        ],
                        [
                            51.96921252311378,
                            7.595951557159424
                        ],
                        [
                            51.969587631837484,
                            7.5960856676101685
                        ],
                        [
                            51.96966694957956,
                            7.5955116748809814
                        ]
                    ]
                ]
            }
        }
    ]
}];

var institutPopups = [];

/**
 * Startet sobald die Seite aufgerufen wird
 */
window.onload = function () {
    var html = "";
    for (var i = 0; i < instituteArr.length; i++) {
        var name = instituteArr[i].features[0].properties.name;
        var fach = instituteArr[i].features[0].properties.fachbereich;
        var img = instituteArr[i].features[0].properties.image;
        var polygon = L.polygon(instituteArr[i].features[0].geometry.coordinates, {}).addTo(map).bindPopup(createPopup(name, fach, img));
        //console.log(polygon._leaflet_id);
        Institute.addLayer(polygon);
        institutPopups.push(polygon);
        //map.fitBounds(polygon.getBounds());
        html += generateHtml(instituteArr[i], i);
    }
    document.getElementById("InstituteTable").innerHTML = html;
}

function openInformation(pID) {
    institutPopups[pID].openPopup();
}

function createPopup(pName, pFach, pBild) {
    var str = "<table class='table'><tr><td>" + pName + "</td><td>" + pFach + "</td><td><img src='" + pBild + "' height=60 /></td></tr><table>";
    return str;
}

///**
// * Startet sobald alle ajax anfragen geendet haben
// */
//$(document).ajaxStop(function () {
//    var html = "";
//    for (var i = 0; i < instituteArr.length; i++) {
//        html += generateHtml(instituteArr[i])
//    }
//    document.getElementById("InstituteTable").innerHTML = html;
//});

/////**
//// * holt sich alle Mensen in einem Umkreis von 10km ums Stadtzentrum 
//// */
////function getMensen() {
////    $.ajax({
////        url: "https://openmensa.org/api/v2/canteens/?near[lat]=51.96&near[lng]=7.63",
////        type: "GET",
////        success: function (data) {
////            for (var i = 0; i < data.length; i++) {
////                mensen.push(new Mensa(data[i].id, data[i].name, data[i].coordinates));
////            }
////            //console.log(mensen);
////            for (var i = 0; i < mensen.length; i++) {
////                getMeal(mensen[i], i);
////                //console.log(mensen[i].gerichte);
////            }

////        },
////        error: function (xhr) {
////            alert(xhr.statusText);
////        }
////    });
////}

///**
// * holt sich das Essens-Angebot aller Mensen 
// * @param {Mensa} pMensa Mensa für díe das Angebot gesucht wird
// * @param {Number} i position im Array an der sich die Mensa befindet
// */
//function getMeal(pMensa, i) {
//    //aktuelles Datum umschreiben, damit es fuer die Mensa API verwendet werden kann
//    var hHeute = new Date(),
//        hMonat = hHeute.getMonth() + 1,
//        hTag = hHeute.getDate();
//    if (hMonat < 10)
//        hMonat = "0" + hMonat;
//    if (hTag < 10)
//        hTag = "0" + hTag;
//    hHeute = hHeute.getFullYear() + "-" + hMonat + "-" + hTag;

//    var hGerichte = [];
//    $.ajax({
//        url: "https://openmensa.org/api/v2/canteens/" + pMensa.id + "/days/" + hHeute + "/meals",
//        type: "GET",
//        success: function (data) {
//            //Gerichte werden abgefragt und dann in der Mensa gespeichert
//            for (var j = 0; j < data.length; j++) {
//                var gericht = new Gericht(data[j].id, pMensa.name, data[j].name, data[j].prices);
//                hGerichte.push(gericht);
//            }
//            //console.log(hGerichte);
//            mensen[i].setGerichte(hGerichte);

//        },
//        error: function (xhr) {
//            console.log("kein Gericht gefunden");
//        }
//    });

//}

/**
 * Generiert die Tabelle auf der Mensa-Seite
 * @param {JSON} pInstitut Institut, dessen Informationen in eine Tabelle uebertragen werden
 */
function generateHtml(pInstitut, pID) {
    var str = "<li class='instList' onclick='openInformation(" +pID+ ")'>" + pInstitut.features[0].properties.name + " aus " + pInstitut.features[0].properties.fachbereich + "</li>";
    return str;
}




