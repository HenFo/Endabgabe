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

//Fullscreen Option
map.addControl(new L.Control.Fullscreen().setPosition("topright"));
L.control.layers({
    "outdoor": outdor.addTo(map),
    "satellite": satellite,
}, null, { position: 'topright' }).addTo(map);

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

//Array mit allen Instituten
var instituteArr = [];
var institutPopups = [];
/**
 * Startet sobald die Seite aufgerufen wird
 */
window.onload = function () {
    var documentTitle = document.title;
    if (documentTitle === "Institute") {
        //Sammelt alle Institute
        $.ajax({
            type: 'GET',
            url: "/getAllInstitutes",
            success: function (data) {
                var html = "";
                for (var x in data) {
                    //sammeln der Daten fuer die HTML Seite
                    var name = data[x].data.features[0].properties.name;
                    var fach = data[x].data.features[0].properties.fachbereich;
                    var img = data[x].data.features[0].properties.image;
                    //erstellen der Geometrie fuer die Karte
                    var polygon = L.polygon(data[x].data.features[0].geometry.coordinates, {}).addTo(map).bindPopup(createPopup(name, fach, img));
                    Institute.addLayer(polygon);
                    institutPopups.push(polygon);
                    html += generateHtml(data[x].data, x);
                }
                //generierten HTML-String in die Seite einfuegen
                document.getElementById("InstituteTable").innerHTML = html;
            },
            error: function (xhr) {

            }
        });
    } else {
        $.ajax({
            type: 'POST',
            url: "/findInstitut",
            data: { "ObjectID": "Institut" + documentTitle },
            success: function (data) {
                var html = "";
                for (var x in data) {
                    //sammeln der Daten fuer die HTML Seite
                    var name = data[x].data.features[0].properties.name;
                    var fach = data[x].data.features[0].properties.fachbereich;
                    var img = data[x].data.features[0].properties.image;
                    //erstellen der Geometrie fuer die Karte
                    var polygon = L.polygon(data[x].data.features[0].geometry.coordinates, {}).addTo(map).bindPopup(createPopup(name, fach, img));
                    polygon.openPopup;
                    Institute.addLayer(polygon);
                    institutPopups.push(polygon);
                    html += generateHtml(data[x].data, x);
                }
                //generierten HTML-String in die Seite einfuegen
                document.getElementById("InstituteTable").innerHTML = html;
            }
        })
    }
}

/**
 * Oeffnet das Popup mit der zugehoerigen ID
 * @param {any} pID ID des zu oeffnenden Popups
 */
function openInformation(pID) {
    institutPopups[pID].openPopup();
}

/**
 * Erstellt ein Popup fuer ein Institut
 * @param {String} pName Name des Instituts
 * @param {String} pFach Name des Fachbereichs des Instituts
 * @param {image} pBild Bild des Instituts
 */
function createPopup(pName, pFach, pBild) {
    var str = "<table class='table'><tr><td>" + pName + "</td><td>" + pFach + "</td><td><img src='" + pBild + "' height=60 /></td></tr><table><br/><a class='btn popup' href='/institute/"+pName+"'>Permalink</a>";
    return str;
}


/**
 * Generiert die Tabelle auf der Mensa-Seite
 * @param {JSON} pInstitut Institut, dessen Informationen in eine Tabelle uebertragen werden
 */
function generateHtml(pInstitut, pID) {
    var str = "<li class='lists' onclick='openInformation(" + pID + ")'>" + pInstitut.features[0].properties.name + " aus " + pInstitut.features[0].properties.fachbereich + "</li>";
    return str;
}

function showPermalink(link) {
    alert("localhost:3000/institute/" + link);
}

/**
 * loescht alle Institute aus der DB
 */
function clearInstitutCollection() {
    $.ajax({
        type: 'POST',
        data: null,
        url: "/clearInstitut",
        success: function () {
            alert('alle Institute geloescht');
        },
        error: function () {
            alert('Fehler beim loeschen');
        }
    });
}