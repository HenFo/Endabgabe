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
var Mensen = L.featureGroup().addTo(map);
var drawnItems = L.featureGroup().addTo(map);
L.control.layers(null, {
    'Institute': Institute,
    //'Mensen': Mensen,
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
    geoJsonLayers.features.push(layerSwitch);
    console.log(geoJsonLayers);
    Institute.addLayer(layer);
});

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

function toggleList(listID) {
    $("#" + listID).toggle();
}



///////////////////////////////////////////////////////////////////////



class Institut {
    /**
     * Erstellt die Klasse Institut
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



window.onload = function () {
    $.ajax({
        type: 'GET',
        url: "/getAllInstitutes",
        success: function (data) {
            for (var x in data) {
                var polygon = L.polygon(data[x].data.features[0].geometry.coordinates, {}).addTo(map);
                Institute.addLayer(polygon);
            }
        },
        error: function (xhr) {
            alert(xhr.statusText);
        }
    });
}


var hGeometryInput = 0;
function addInstitut() {
    var name = document.getElementById("InstitutName").value;
    var fachbereich = document.getElementById("fachbereichSelect").value;
    var img = document.getElementById("InstitutBildURL").value;

    if (fachbereich == "wähle Fachbereich") { alert("bitte Fachbereich auswählen"); }
    else if (!isURL(img)) { alert("bitte korrekte URL angeben"); }
    else {

        switch (hGeometryInput) {
            case 0:
                try {
                    if (geoJsonLayers.features.length > 0) {
                        var institut = new Institut(name, fachbereich, img, geoJsonLayers.features[0].geometry);
                        addToDatabase(institut.toGeoJSON());
                    } else { alert("bitte Geometrie zeichnen"); }
                } catch (e) { alert(e) };
                break;
            case 1:
                try {
                    var json = loadDoc();
                    var geometry = returnGeometry(json);
                    var institut = new Institut(name, fachbereich, img, geometry);
                    //console.log(institut.toGeoJSON());
                    addToDatabase(institut.toGeoJSON());
                } catch (e) {alert(e)}
                break;
            default:
                alert("Geometrie eingeben");
                break;
        }
        //document.getElementById("InstitutName").value = "";
        //document.getElementById("fachbereichSelect").value = 1;
        //document.getElementById("InstitutBildURL").value = "";
    }
}

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

function addToDatabase(pObject) {
    var object = JSON.stringify(pObject);
    //console.log(object);
    console.log(pObject);
    $.ajax({
        type: 'POST',
        data: { "ObjectType": "Institut", "data": object },
        url: "/addInstitut",
        success: function () {
            alert('Institut gespeichert');
            
        },
        error: function () {
            alert('Speichern fehlgeschlagen');
        }
    });

    $.ajax({
        type: 'POST',
        data: {"data": object},
        url: "/addInstitutInFachbereich",
        success: function () {
            alert('Institut in Fachbereich gespeichert');
        },
        error: function () {
            alert('Institut speichern fehlgeschlagen');
        }
    });
}

$(document).ready(function () {
    $("#Bzeichnen").click(function () {
        $("#geoJSON").hide();
        $("#mapEdit").show(1000);
        $(this).prop("disabled", true);
        $("#Bcopy").prop("disabled", false);
        hGeometryInput = 0;
    });
});

$(document).ready(function () {
    $("#Bcopy").click(function () {
        $("#mapEdit").hide();
        $("#geoJSON").show(1000);
        $(this).prop("disabled", true);
        $("#Bzeichnen").prop("disabled", false);
        hGeometryInput = 1;
    });
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