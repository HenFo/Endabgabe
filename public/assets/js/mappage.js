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
}, { position: 'topleft', collapsed: false }).addTo(map);

//Fullscreen Option
map.addControl(new L.Control.Fullscreen().setPosition("topright"));
L.control.layers({
    "outdoor": outdor.addTo(map),
    "satellite": satellite,
}, null, { position: 'topright' }).addTo(map);

var control = L.Routing.control({
    router: L.routing.mapbox(accessToken),
    waypoints: [
        "undefined", "undefined"
    ],
    language: "de",
    routeWhileDragging: true,
    geocoder: L.Control.Geocoder.nominatim()
}).on('routingerror', function (e) {
    try {
        map.getCenter();
    } catch (e) {
        map.fitBounds(L.latLngBounds(control1.getWaypoints().map(function (wp) { return wp.latLng; })));
    }
    //handleError(e);
}).addTo(map);
//control.hide(); //manchmal Probleme, dass die minimierte Version nicht angezeigt wird. Dann die Seite neu laden.
//error control
L.Routing.errorControl(control).addTo(map);


class Route {
    constructor(pName, pStart, pZiel) {
        this.zName = pName;
        this.zStart = pStart;
        this.zZiel = pZiel;
    }

    toJSON() {
        var json = {
            "name": this.zName,
            "start": this.zStart,
            "ziel": this.zZiel
        };
        return json;
    }
}


var instituteArr = [];
var institutPopups = [];

var autoArr = [];
var autoArrDist = {
    "institute": 0,
    "routen": 0,
    "fachbereiche": 0,
    "mensen": 0,
};

/**
 * Startet sobald die Seite aufgerufen wird
 */
window.onload = function () {
    $.ajax({
        type: 'GET',
        url: "/getAllInstitutes",
        success: function (data) {
            for (var x in data) {
                instituteArr.push(data[x].data);
                autoArr.push(data[x].data.features[0].properties.name);
                var name = data[x].data.features[0].properties.name;
                var fach = data[x].data.features[0].properties.fachbereich;
                var img = data[x].data.features[0].properties.image;
                var coord = data[x].data.features[0].geometry.coordinates;
                var polygon = L.polygon(coord, {}).addTo(map).bindPopup(createPopup(name, fach, img, coord[0]));
                Institute.addLayer(polygon);
                institutPopups.push(polygon);
            }
            autoArrDist.institute = data.length;

            $.ajax({
                type: 'GET',
                url: "/getAllRoutes",
                success: function (data) {
                    for (var x in data) {
                        autoArr.push(data[x].name);
                    }
                    autoArrDist.routen = data.length + autoArrDist.institute;

                    $.ajax({
                        type: 'GET',
                        url: "/getAllFachbereiche",
                        success: function (data) {
                            for (var x in data) {
                                autoArr.push(data[x].name);
                                autoArr.push(data[x].abkuerzung);
                            }
                            autoArrDist.fachbereiche = data.length * 2 + autoArrDist.routen;

                            getMensen();
                        },
                        error: function (xhr) {

                        }
                    });
                },
                error: function (xhr) {

                }
            });
        },
        error: function (xhr) {

        }
    });

}

//$(document).ajaxStop(function () {
//    console.log(autoArrDist);
//    console.log(autoArr);
//    console.log(mensenPopup);
//    mensenPopup[4].openPopup();
//});

$(document).ready(function () {
    $("#submitSearch").click(function () {
        $("#searchTable").show();
        document.getElementById("searchTable").innerHTML = "";
        var search = document.getElementById("searchInput").value.toLowerCase();
        if (search != "") {
            var i = 0, res = [];
            while (i < autoArr.length) {
                if (autoArr[i].toLowerCase().includes(search)) {
                    res.push({ "index": i, "data": autoArr[i] });
                }
                i++;
            }
            for (var x in res) {
                if (res[x].index >= autoArrDist.institute) {
                    if (res[x].index >= autoArrDist.routen) {
                        if (res[x].index >= autoArrDist.fachbereiche) {
                            if (res[x].index >= autoArrDist.mensen) {
                                alert("Fehler bei der Suche: Kein Ergebnis");
                            } else {
                                findMensa(res[x].data);
                            }
                        } else {
                            findFachbereich(res[x].data);
                        }
                    } else {
                        findRoute(res[x].data);
                    }
                } else {
                    findInstitut(res[x].data);
                }
            }
        }
    })
})

function findInstitut(pName) {
    var i = 0, flag = false, hInst = { "institut": null, "index": null };
    while (i < instituteArr.length && !flag) {
        flag = instituteArr[i].features[0].properties.name == pName;
        i++
    }
    hInst.institut = instituteArr[i-1];
    hInst.index = i-1;
    generateList(hInst, 0);
}

function findFachbereich(pName) {
    if (pName.includes("FB"))
        var data = { "abkuerzung": pName };
    else
        var data = { "name": pName };
    $.ajax({
        type: 'POST',
        data: data,
        url: "/findFachbereich",
        success: function (data) {
            generateList(data, 1);
        },
        error: function (xhr) {

        }
    });
}

function findRoute(pName) {
    $.ajax({
        type: 'POST',
        data: { "name": pName },
        url: "/findRoute",
        success: function (data) {
            generateList(data, 2);
        },
        error: function (xhr) {

        }
    });
}

function findMensa(pName) {
    var i = 0, flag = false;
    while (i < mensen.length && !flag) {
        flag = mensen[i].name === pName;
        i++
    }
    generateList({ "mensa": mensen[i-1], "index": i-1 }, 3);
}

function openInformation(pID) {
    institutPopups[pID].openPopup();
}

function showOnMap(pData) {
    $("#routeButtons").slideDown();
    control.spliceWaypoints(0, 1, pData.start);
    control.spliceWaypoints(control.getWaypoints().length - 1, 1, pData.ziel);
}

function generateList(data, type) {
    var html = "";
    switch (type) {
        case 0: //institute
            html += "<li class='lists' onclick='openInformation(" + data.index + ")'>" + data.institut.features[0].properties.name + " aus " + data.institut.features[0].properties.fachbereich + "</li>";
            document.getElementById("searchTable").innerHTML += html;
            break;
        case 1: //fachbereiche
            html += "<li class='fachSearchList'>" + data[0].name + "<ul>";
            for (var x in data[0].institute) {
                html += "<li>" + data[0].institute[x].name + "</li>";
            }
            html += "</ul>";
            document.getElementById("searchTable").innerHTML += html + "</li>";
            break;
        case 2: //routen
            var waypoints = { "start": data[0].start, "ziel": data[0].ziel };
            var name = { "name": data[0].name };
            name = JSON.stringify(name);
            waypoints = JSON.stringify(waypoints);
            html += "<li class='lists' onclick='showOnMap(" + waypoints + ")'>" + data[0].name + "<button class='routeEdit' onclick='deleteRoute(" + name + ")'><i class='fa fa-trash-o'></i></button><button class='routeEdit' onclick='editRoute(" + name+")'><i class='fa fa-pencil'></i></button></li>";
            document.getElementById("searchTable").innerHTML += html;
            break;
        case 3: //mensen
            html += "<li class='lists' onclick='openMensaPopup(" + data.index + ")'>" + data.mensa.name + "</li>";
            document.getElementById("searchTable").innerHTML += html;

    }
}

function deleteRoute(pRoutenName) {
    if (confirm("Route sicher loeschen?!")) {
        $.ajax({
            type: 'POST',
            data: pRoutenName,
            url: "/deleteRoute",
            success: function (data) {
                alert("Route " + pRoutenName.name + " wurde geloescht!");
                location.reload();
            },
            error: function (xhr) {
                alert("Fehler beim loeschen der Route");
            }
        });
    }
}

/**
 * erstellt ein Popup fuer die Institute
 * @param {String} pName
 * @param {String} pFach
 * @param {URL} pBild
 * @param {JSON} pPos
 */
function createPopup(pName, pFach, pBild, pPos) {
    var str = "<table class='table'><tr><td>" + pName + "</td><td>" + pFach + "</td><td><img src='" + pBild + "' height=60 /></td></tr><table><br/><button class='btn popup' onclick='routeToNextMensaFromInst(" + pPos + ")'>Zur naechsten Mensa navigieren</button>";
    return str;
}

$(document).ready(function () {
    $("#routeButton").click(function () {
        if (checkRoute()) {
            if (!document.getElementById("routeButton").hasAttribute("name")) {
                $("#routeButton").html("<b>Speichern!</b>")
                $('#routeButton').attr('name', '');
                $("#routeName").slideDown();
            } else {
                if (document.getElementById("routeName").value != "") {
                    saveRoute();
                    document.getElementById("routeName").value = ""
                    $("#routeButton").html("aktuelle Route speichern")
                    $('#routeButton').removeAttr("name");
                    $("#routeName").slideUp();
                } else {
                    alert("bitte Name eingeben");
                }
            }
        } else {
            alert("Keine Route vorhanden");
        }
    });
});


function saveRoute() {
    var name = document.getElementById("routeName").value;
    var start = {
        "lat": control.getWaypoints()[0].latLng.lat, "lng": control.getWaypoints()[0].latLng.lng
    };
    var ziel = {
        "lat": control.getWaypoints()[control.getWaypoints().length - 1].latLng.lat, "lng": control.getWaypoints()[control.getWaypoints().length - 1].latLng.lng
    };
    var object = new Route(name, start, ziel);
    object = object.toJSON();
    object = JSON.stringify(object);
    object = { "type": "route", "data": object };
    $.ajax({
        type: 'POST',
        data: object,
        url: "/addRoute",
        success: function () {
            alert('Route gespeichert');
            autoArr.splice(autoArrDist.routen, 0, name);
            autoArrDist.routen++;
            autoArrDist.fachbereiche++;
            autoArrDist.mensen++;
        },
        error: function () {
            alert('Speichern fehlgeschlagen');
        }
    });
}

//globaler Speicher fuer die aktuelle Position
var latestPosition = null;
/**
 * GPS
 */
function getPosition() {
    map.locate({ setView: false, maxZoom: 16 });
}

/**
 * wird getriggert wenn ein GPS Signal empfangen wurde.
 * Dann wird der Standort als Startpunkt fuer die Navigation ausgewaehlt
 * @param {any} e
 */
function onLocationFound(e) {
    latestPosition = e;
    var radius = latestPosition.accuracy / 2;
    L.circle(latestPosition.latlng, radius).addTo(map);
    L.marker(latestPosition.latlng).bindPopup("Du befindest dich in diesem " + radius + " Meter Radius").addTo(map).openPopup();
    control.spliceWaypoints(0, 1, latestPosition.latlng);
    control.show();
}
map.on('locationfound', onLocationFound);

/**
 * Navigiert dich zur naechstgelegenden Mensa
 */
function routeToNextMensa() {
    if (latestPosition != null) {
        var mensa = nextMensa(latestPosition.latlng); //sammeln der noetigen Informationen
        control.spliceWaypoints(0, 1, latestPosition.latlng);
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, { lat: mensa.lat, lng: mensa.lng });
        control.show();
    } else try {
        var mensa = nextMensa(control.getWaypoints()[0].latLng); //sammeln der noetigen Informationen
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, { lat: mensa.lat, lng: mensa.lng });
        control.show();
    } catch (e) {
        alert("Bitte Startpunkt auswaehlen indem Du auf die Karte klickst oder GPS starten unter 'Orte mich!'. Dann probier es nochmal");
    }
}

/**
 * Navigiert dich zur naechstgelegenden Mensa
 * 
 */
function routeToNextMensaFromInst(lat, lng) {
    var mensa = nextMensa({ "lat": lat, "lng": lng }); //sammeln der noetigen Informationen
    control.spliceWaypoints(control.getWaypoints().length - 1, 1, { lat: mensa.lat, lng: mensa.lng });
    control.spliceWaypoints(0, 1, { "lat": lat, "lng": lng });
    control.show();
}

function checkRoute() {
    var waypoints = control.getWaypoints();
    return waypoints[0].latLng !== null && waypoints[1].latLng !== null ? true : false;
}

/**
 * navigiert dich von deinem aktuellem Standort zu den naechsten Coordinaten.
 * Wenn kein Startort festgelegt ist, so werden die Koordinaten als 
 * naechstes Ziel in der Navigation gespeichert.
 * Funktion wird duch Button im Popup der Mensen ausgefuehrt.
 * @param {any} pLat
 * @param {any} pLng
 */
function toDestination(pLat, pLng) {
    if (latestPosition != null) {
        control.spliceWaypoints(0, 1, latestPosition.latlng);
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, { lat: pLat, lng: pLng });
        control.show();
    } else {
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, { lat: pLat, lng: pLng });
    }
}

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
        dist: dist, mensa: hMensa.name, lat: hMensa.coordinaten[0], lng: hMensa.coordinaten[1]
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


