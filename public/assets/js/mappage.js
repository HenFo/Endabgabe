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

//Route initialisieren
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
L.Routing.errorControl(control).addTo(map);


class Route {
    /**
     * Erstellt ein Objekt der Klass Route
     * @param {String} pName
     * @param {any} pStart
     * @param {any} pZiel
     */
    constructor(pName, pStart, pZiel) {
        this.zName = pName;
        this.zStart = pStart;
        this.zZiel = pZiel;
    }

    /**
     * macht aus einem Routenobjekt ein JSON Objekt
     */
    toJSON() {
        var json = {
            "name": this.zName,
            "start": this.zStart,
            "ziel": this.zZiel
        };
        return json;
    }
}


var instituteArr = [];//Array mit allen Instituten
var institutPopups = [];//Array mit allen Popups fuer Institute

var autoArr = [];//Array fuer die Autocompletefunktion
//Verteilung der Inahlte im autoArr
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
    //sammelt alle Institute
    $.ajax({
        type: 'GET',
        url: "/getAllInstitutes",
        success: function (data) {
            for (var x in data) {
                //Institute zu den Arrays hinzufuegen
                instituteArr.push(data[x].data);
                autoArr.push(data[x].data.features[0].properties.name);
                //sammeln der Informationen zum erstellen eines Popups
                var name = data[x].data.features[0].properties.name;
                var fach = data[x].data.features[0].properties.fachbereich;
                var img = data[x].data.features[0].properties.image;
                var coord = data[x].data.features[0].geometry.coordinates;
                //Geometrie auf der Garte
                var polygon = L.polygon(coord, {}).addTo(map).bindPopup(createPopup(name, fach, img, coord[0]));
                Institute.addLayer(polygon);
                institutPopups.push(polygon);
            }
            //festlegen bis zu welchem Index Institute in autoArr sind
            autoArrDist.institute = data.length;

            //sammeln aller Routen
            $.ajax({
                type: 'GET',
                url: "/getAllRoutes",
                success: function (data) {
                    for (var x in data) {
                        autoArr.push(data[x].name);
                    }
                    //festlegen bis zu welchem Index Routen in autoArr sind
                    autoArrDist.routen = data.length + autoArrDist.institute;

                    //sammeln aller Fachbereiche
                    $.ajax({
                        type: 'GET',
                        url: "/getAllFachbereiche",
                        success: function (data) {
                            for (var x in data) {
                                autoArr.push(data[x].name);
                                autoArr.push(data[x].abkuerzung);
                            }
                            //festlegen bis zu welchem Index Fachbereiche in autoArr sind
                            autoArrDist.fachbereiche = data.length * 2 + autoArrDist.routen;
                            //sammeln aller Mensen
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

//getriggert wenn der suchbutton betaetigt wird
$(document).ready(function () {
    $("#submitSearch").click(function () {
        //tabelle oeffnen
        $("#searchTable").show();
        document.getElementById("searchTable").innerHTML = "";
        //suchbegriff
        var search = document.getElementById("searchInput").value.toLowerCase();
            //suchen aller Indizes, die auf die Eingabe passen
            var i = 0, res = [];
            while (i < autoArr.length) {
                if (autoArr[i].toLowerCase().includes(search)) {
                    res.push({ "index": i, "data": autoArr[i] });
                }
                i++;
            }
            //evaluieren der gesammelten indizes
            for (var x in res) {
                //false wenn im Bereich der Institute
                if (res[x].index >= autoArrDist.institute) {
                    //false wenn im Bereich der Routen
                    if (res[x].index >= autoArrDist.routen) {
                        //false wenn im Bereich der Fachbereiche
                        if (res[x].index >= autoArrDist.fachbereiche) {
                            //false wenn im Bereich der Mensen
                            if (res[x].index >= autoArrDist.mensen) {
                                //wenn es zu einem Fehler bei der Suche kam
                                alert("Fehler bei der Suche: Kein Ergebnis");
                            } else {
                                //findet die passende Mensa
                                findMensa(res[x].data);
                            }
                        } else {
                            //findet den passenden Fachbereich
                            findFachbereich(res[x].data);
                        }
                    } else {
                        //findet die passende Route
                        findRoute(res[x].data);
                    }
                } else {
                    //findet das passende Institut
                    findInstitut(res[x].data);
                }
            }
        }
    )
})

/**
 * Findet ein Institut anhand seines Namens
 * @param {String} pName Name des Instituts
 */
function findInstitut(pName) {
    //sucht das Institut
    var i = 0, flag = false, hInst = { "institut": null, "index": null };
    while (i < instituteArr.length && !flag) {
        flag = instituteArr[i].features[0].properties.name == pName;
        i++
    }
    hInst.institut = instituteArr[i - 1];
    //Index an dem das Institut sich befindet 
    hInst.index = i - 1;
    //generiert einen Teil der Ergebnisliste
    generateList(hInst, 0);
}

/**
 * sucht ein Fachbereich anhand des Namens oder der Abkuerzung
 * @param {any} pName Name oder Kuerzel des Fachbereiches
 */
function findFachbereich(pName) {
    //entscheiden, ob es ein Name oder ein Kuerzel ist
    if (pName.includes("FB"))
        var data = { "abkuerzung": pName };
    else
        var data = { "name": pName };
    //holt den gesuchten Fachbereich aus der DB
    $.ajax({
        type: 'POST',
        data: data,
        url: "/findFachbereich",
        success: function (data) {
            //generiert eine Teil der Ergebnisliste
            generateList(data, 1);
        },
        error: function (xhr) {

        }
    });
}

/**
 * sucht eine Route anhand dessen Namen in der DB
 * @param {String} pName Name der Route
 */
function findRoute(pName) {
    $.ajax({
        type: 'POST',
        data: { "name": pName },
        url: "/findRoute",
        success: function (data) {
            //generiert eine Teil der Ergebnisliste
            generateList(data, 2);
        },
        error: function (xhr) {

        }
    });
}

/**
 * sucht eine Mensa anhand dessen Namen
 * @param {String} pName Name der Mensa
 */
function findMensa(pName) {
    //suchen nach der Mensa
    var i = 0, flag = false;
    while (i < mensen.length && !flag) {
        flag = mensen[i].name === pName;
        i++
    }
    //generiert eine Teil der Ergebnisliste
    generateList({ "mensa": mensen[i-1], "index": i-1 }, 3);
}

/**
 * Oeffnet das Popup der Institute nach der ID
 * @param {any} pID ID fuer das zugehoerige Institut
 */
function openInformation(pID) {
    institutPopups[pID].openPopup();
}

/**
 * zeigt eine Route auf der Karte
 * @param {any} pData Daten der Route
 */
function showOnMap(pData) {
    $("#routeButtons").slideDown();
    control.spliceWaypoints(0, 1, pData.start);
    control.spliceWaypoints(control.getWaypoints().length - 1, 1, pData.ziel);
}

/**
 * generiert die Ergebnisliste
 * @param {any} data individuelle Daten zum erstellen der verschiedenen Arten der Liste
 * @param {number} type art der Eingabe 0:Institut 1:Fachbereich 2:routen 3:Mensen
 */
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
            var name = { "ID": data[0].ObjectID };
            name = JSON.stringify(name);
            waypoints = JSON.stringify(waypoints);
            html += "<li class='lists' onclick='showOnMap(" + waypoints + ")'>" + data[0].name + "<button class='routeEdit' onclick='deleteRoute(" + name + ")'><i class='fa fa-trash-o'></i></button><button class='routeEdit' onclick='editRoute(" + name +")'><i class='fa fa-pencil'></i></button></li>";
            document.getElementById("searchTable").innerHTML += html;
            break;
        case 3: //mensen
            html += "<li class='lists' onclick='openMensaPopup(" + data.index + ")'>" + data.mensa.name + "</li>";
            document.getElementById("searchTable").innerHTML += html;

    }
}

/**
 * loescht eine Route
 * @param {String} pRoutenName Name der zu loeschenden Route
 */
function deleteRoute(pRoutenName) {
    if (confirm("Route sicher loeschen?!")) {
        //loesche Route aus DB
        $.ajax({
            type: 'POST',
            data: { "ObjectID": pRoutenName.ID },
            url: "/deleteRoute",
            success: function (data) {
                alert("Route wurde geloescht!");
                //Seite neu laden
                location.reload();
            },
            error: function (xhr) {
                alert("Fehler beim loeschen der Route");
            }
        });
    }
}

/**
 * bearbeitet die Route
 * @param {String} pRoutenName Name der zu bearbeitenden Route
 */
function editRoute(pRoutenName) {
    if (confirm("Route sicher aendern?!")) {
        //Neue Werte sammeln
        var start = {
            "lat": control.getWaypoints()[0].latLng.lat, "lng": control.getWaypoints()[0].latLng.lng
        };
        var ziel = {
            "lat": control.getWaypoints()[control.getWaypoints().length - 1].latLng.lat, "lng": control.getWaypoints()[control.getWaypoints().length - 1].latLng.lng
        };
        //generieren einer neuen Route
        var object = new Route(pRoutenName.ID.substring(5), start, ziel);
        object = object.toJSON();
        object = JSON.stringify(object);
        object = { "ObjectID": pRoutenName.ID, "data": object };
        //aktualisieren der Route in der DB
        $.ajax({
            type: 'POST',
            data: object,
            url: "/editRoute",
            success: function (data) {
                document.getElementById("searchTable").innerHTML = "";
                //Route auf der Karte anzeigen
                showOnMap({ "start": start, "ziel": ziel });
                //aktualisierte Route in der Liste anzeigen
                findRoute(pRoutenName.ID.substring(5));
                alert("Route wurde bearbeitet!");
            },
            error: function (xhr) {
                alert("Fehler beim aendern der Route");
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

//getriggert wenn der Route Speichern Button gedrueckt wird
$(document).ready(function () {
    $("#routeButton").click(function () {
        //checkt ob Route vorhanden ist
        if (checkRoute()) {
            //Wenn das Attribut "name" im Button fehlt, so ist er in Zustand 1
            if (!document.getElementById("routeButton").hasAttribute("name")) {
                //aendern des Buttoninhalts
                $("#routeButton").html("<b>Speichern!</b>")
                $('#routeButton').attr('name', '');
                //oeffnen der Nameneingabe fuer die Route
                $("#routeName").slideDown();
            } else { //Wenn Button in Zustand 2
                //Wenn Routenname eingegeben
                if (document.getElementById("routeName").value != "") {
                    //route Speichern
                    saveRoute();
                    //Button zurueck auf Zustand 1
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

/**
 * Speichert eine Route ab
 */
function saveRoute() {
    //sammeln der Informationen
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
    //ObjectID zum ansorecchen der Route in der DB
    object = { "ObjectID": "route" + name, "data": object };
    //Route hinzufuegen
    $.ajax({
        type: 'POST',
        data: object,
        url: "/addRoute",
        success: function () {
            alert('Route gespeichert');
            //einfuegen der Route in alle Arrays, damit es nicht neu gesucht werden muss
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


var input = document.getElementById("searchInput");
input.addEventListener("keyup", function (event) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Trigger the button element with a click
        document.getElementById("submitSearch").click();
    }
});

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


