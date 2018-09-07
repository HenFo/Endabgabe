"use strict";
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
}, null, { position: 'topright' }).addTo(map);

var Institute = L.featureGroup().addTo(map);
var drawnItems = L.featureGroup().addTo(map);
L.control.layers(null, {
    'Institute': Institute,
}, { position: 'topleft', collapsed: false }).addTo(map);

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

//layer in der die gezeichneten features abgespeichert werden.
//ACHTUNG: Nur das zuerst gezeichnete Feature wird bearbeitet
var geoJsonLayers = {
    "type": "FeatureCollection",
    "features": []
};

/**
 * Speichert, je nachdem welches feature bearbeitet wird, dieses ab
 */
map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    var layerSwitch = layer.toGeoJSON();
    layerSwitch.geometry.coordinates = switchCoordinates(layerSwitch);
    //layer vorne einfuegen, damit die aenderung uebernommen wird
    geoJsonLayers.features.unshift(layerSwitch);
    console.log(geoJsonLayers);
    Institute.addLayer(layer);
});

/**
 * tauscht die Coordinaten in die richtige Reihenfolge
 * @param {any} pLayer
 */
function switchCoordinates(pLayer) {
    var hCoor = pLayer.geometry.coordinates;
    var arr = [];
    for (var p in hCoor[0]) {
        var point = hCoor[0][p];
        point = [point[1], point[0]];
        arr.push(point);
    }
    return arr;
}

/**
 * oeffnet/schliesst eine Liste mit der uebergebenen ID
 * @param {any} listID Teil der Liste welches geoeffnet/geschlossen werden soll
 */
function toggleList(listID) {
    $("#" + listID).toggle();
}



///////////////////////////////////////////////////////////////////////



class Institut {
    /**
     * Erstellt ein Objekt der Klasse Institut
     * @param {String} pName
     * @param {String} pFachbereich
     * @param {String} pBildURL
     * @param {JSON} pGeometry
     */
    constructor(pName, pFachbereich, pBildURL, pGeometry) {
        this.zName = pName;
        this.zFachbereich = pFachbereich;
        this.zBildURL = pBildURL;
        this.zGeometry = pGeometry;
    }

    /**
     * Macht aus sich selbst ein valides GeoJSON Objekt
     * @returns Ein Institut als GeoJSON
     */
    toGeoJSON() {
        var geoJSON = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                            "name": this.zName,
                            "fachbereich": this.zFachbereich,
                            "image": this.zBildURL
                        },
                    "geometry": this.zGeometry
                }
            ]
        };
        return geoJSON;
    }
}

var autoArr = []; //Array fuer Autocomplete
var instituteArr = []; //Array fuer die Institute
var instID = ""; //ID des aktuell bearbeiteten Instituts
var fach = ""; //ueberpruefen ob Fachbereich geaendert wurde

/**
 * Startet sobald die Seite aufgerufen wird
 */
window.onload = function () {
    $.ajax({
        type: 'GET',
        url: "/getAllInstitutes",
        success: function (data) {
            for (var x in data) {
                instituteArr.push(data[x]);
                autoArr.push(data[x].data.features[0].properties.name);
            }
        },
        error: function (xhr) {
            alert(xhr.statusText);
        }
    });
}

//wird getriggert soblad der submit Button gedrueckt wird
$(document).ready(function () {
    $("#submitSearch").click(function () {
        var hName = document.getElementById("searchInput").value;
        if (hName != "") {
            //sucht nach dem geschten Institut
            var i = 0, flag = false;
            while (i < instituteArr.length && !flag) {
                flag = instituteArr[i].data.features[0].properties.name == hName;
                i++;
            }
            //abfangen, dass das Institut nicht gefunden wurde
            if (i <= instituteArr.length) {
                i--;
                $("#deleteInst").slideDown();
                //setzen der Attribute des zu bearbeitenden Instituts
                $("#InstitutName").val(instituteArr[i].data.features[0].properties.name);
                $("#fachbereichSelect").val(instituteArr[i].data.features[0].properties.fachbereich);
                $("#InstitutBildURL").val(instituteArr[i].data.features[0].properties.image);
                //Geometrie auf Karte anzeigen
                var polygon = L.polygon(instituteArr[i].data.features[0].geometry.coordinates, {}).addTo(map);
                Institute.addLayer(polygon);
                geoJsonLayers.features.push(instituteArr[i].data.features[0]);
                //zoomen zur geometrie
                map.fitBounds(polygon.getBounds());
                instID = instituteArr[i].ObjectID;
                fach = $("#fachbereichSelect").val();
            } else {
                alert("Institut nicht vorhanden");
            }
        }
    })
});


var hGeometryInput = 0; //Art der Geometrieeingabe
/**
 * bearbeitetes Institut der Datenbank hinzufuegen
 */
function addInstitut() {
    if (confirm("Aenderungen speichern?")) {
        var name = document.getElementById("InstitutName").value;
        var fachbereich = document.getElementById("fachbereichSelect").value;
        var img = document.getElementById("InstitutBildURL").value;

        if (fachbereich == "wähle Fachbereich") { alert("bitte Fachbereich auswählen"); }
        else if (name == "") { alert("bitte Namen eingeben"); }
        else if (!isURL(img)) { alert("bitte korrekte URL angeben"); }
        else {
            //waehlt die passende Verarbeitung der Geometrie
            switch (hGeometryInput) {
                case 0://bei manueller Eingabe
                    try {
                        if (geoJsonLayers.features.length > 0) {
                            var institut = new Institut(name, fachbereich, img, geoJsonLayers.features[0].geometry);
                            //Hinzufuegen zur Datenbank
                            saveToDatabase(institut.toGeoJSON());
                        } else { alert("bitte Geometrie zeichnen"); }
                    } catch (e) { alert(e) };
                    break;
                case 1://bei Eingabe ueber URL oder GeoJSON
                    try {
                        //eingabe auswerten
                        var json = loadDoc();
                        //gibt die passende Geometrie wieder, unabhaengig des GeoJSON Objekts
                        var geometry = returnGeometry(json);
                        var institut = new Institut(name, fachbereich, img, geometry);
                        //zur DB hinzufuegen
                        addToDatabase(institut.toGeoJSON());
                    } catch (e) { alert(e) }
                    break;
                default:
                    alert("Geometrie eingeben");
                    break;
            }
        }
    }
}

/**
 * gibt die Geometrie eines GeoJSON Objekts wieder
 * @param {JSON} pGeoJSON GeoJSON
 * @returns Geometrie
 */
function returnGeometry(pGeoJSON) {
    if (pGeoJSON.type == "FeatureCollection") {
        return pGeoJSON.features[0].geometry;
    } else {
        return pGeoJSON.geometry;
    }
}

/**
 * takes the input from the html page an if it is a 
 * valide GeoJSON Object, it adds the features to the map.
 */
function loadDoc() {
    if (isURL(document.getElementById("geoJSON").value)) {
        var xhttp = new XMLHttpRequest();
        var geoJsonObject;
        xhttp.onreadystatechange = function () {
            if (this.status == 200 && this.readyState == 4) {
                try {
                    geoJsonObject = JSON.parse(this.responseText);
                    console.log(geoJsonObject);
                    return geoJsonObject;
                } catch (e) { alert(e) };
            }
        };

        var link = "" + document.getElementById("geoJSON").value;
        console.log(link);
        xhttp.open("GET", link, true);
        xhttp.send();
    } else {
        try {
            geoJsonObject = JSON.parse("" + document.getElementById("geoJSON").value);
            return geoJsonObject;
        } catch (e) { alert(e) };
        
    }
}

/**
 * updatet das Institut in der Datenbank
 * @param {JSON} pObject bearbeitetes Institut
 */
function saveToDatabase(pObject) {
    if (pObject.features[0].properties.fachbereich == fach) {
        var object = JSON.stringify(pObject);
        $.ajax({
            type: 'POST',
            data: { "ObjectID": instID, "data": object },
            url: "/saveInstitut",
            success: function () {
                //Institut in seinem Fachbereich aendern
                $.ajax({
                    type: 'POST',
                    data: { "ObjectID": instID, "data": object },
                    url: "/saveInstitutInFachbereich",
                    success: function () {
                        location.reload();
                    },
                    error: function () {
                        alert('Institut speichern fehlgeschlagen');
                    }
                });
            },
            error: function () {
                alert('Speichern fehlgeschlagen');
            }
        });
    } else {
        var object = JSON.stringify(pObject);
        $.ajax({
            type: 'POST',
            data: { "ObjectID": instID, "data": object },
            url: "/saveInstitut",
            success: function () {
                //Institut in seinem Fachbereich aendern
                object = { "ObjectID": instID, "fachbereich": fach };
                $.ajax({
                    type: 'POST',
                    data: object,
                    url: "/deleteInstitutFromFachbereich",
                    success: function () {
                        object = JSON.stringify(pObject);
                        $.ajax({
                            type: 'POST',
                            data: { "ObjectID": instID, "data": object },
                            url: "/addInstitutInFachbereich",
                            success: function () {
                                alert('Institut gespeichert');
                                //Seite neu laden
                                location.reload();
                            },
                            error: function () {
                                alert('Institut speichern fehlgeschlagen');
                            }
                        })
                    },
                    error: function () {
                        alert('Institut speichern fehlgeschlagen');
                    }
                });
            },
            error: function () {
                alert('Speichern fehlgeschlagen');
            }
        });
    }
}

//tauscht die Eingabemethoden
$(document).ready(function () {
    $("#Bzeichnen").click(function () {
        $("#geoJSON").hide();
        $("#mapEdit").show(1000);
        $(this).prop("disabled", true);
        $("#Bcopy").prop("disabled", false);
        hGeometryInput = 0;
    });
});

//tauscht die Eingabemethoden
$(document).ready(function () {
    $("#Bcopy").click(function () {
        $("#mapEdit").hide();
        $("#geoJSON").show(1000);
        $(this).prop("disabled", true);
        $("#Bzeichnen").prop("disabled", false);
        hGeometryInput = 1;
    });
});


//loescht das zu bearbeitende Institut
$(document).ready(function () {
    $("#deleteInst").click(function () {
        if (confirm("Institut wirklich loeschen?")) {
            var object = { "ObjectID": instID };
            //Intstitut loeschen
            $.ajax({
                type: 'POST',
                data: object,
                url: "/deleteInstitut",
                success: function () {
                    //hinzufuegen von mehr Informationen fuer weitere loeschaktionen
                    object = {
                        "ID": instID,
                        "name": $("#InstitutName").val(),
                        "fachbereich": $("#fachbereichSelect").val(),
                    };
                    //loeschen des Instituts aus seinem Fachbereich
                    $.ajax({
                        type: 'POST',
                        data: object,
                        url: "/deleteInstitutFromFachbereich",
                        success: function () {
                            alert('Institut geloescht');
                            location.reload();
                        },
                        error: function () {
                            alert('Institut loeschen fehlgeschlagen');
                        }
                    });
                },
                error: function () {
                    alert('Institut loeschen fehlgeschlagen');
                }
            });
        }
    });
});


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
 * takes a string and checks if it is an url
 * @param {String} str checks whether it is an URL or not
 * @returns true if String is URL, otherwise false
 * @see https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
 */
function isURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return pattern.test(str);
}