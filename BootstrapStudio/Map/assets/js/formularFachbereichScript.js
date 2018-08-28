"use strict";
class Fachbereich {
    /**
     * Erstellt die Klasse Fachbereich
     * @param {String} pName
     * @param {String} pAbk
     * @param {URL} pWebseite
     */
    constructor(pName, pAbk, pWebseite) {
        this.zName = pName;
        this.zAbk = pAbk;
        this.zWebseite = pWebseite;
        this.zInstitute = [];
    }

    toJSON() {
        var json = {
            "name": this.zName,
            "abkuerzung": this.zAbk,
            "webseite": this.zWebseite,
            "institute": []
        }
        return json;
    }
}

/**
 * erstellt das Institut aus den gegebenen Angaben
 */
function addFachbereich() {
    var name = document.getElementById("fachbereichName").value;
    var abk = document.getElementById("fachbereichAbkuerzung").value;
    var web = document.getElementById("fachbereichWebseite").value;

    if (name == "") { alert("bitte einen Namen eingeben"); }
    else if (abk == "") { alert("bitte Abkürzung wählen"); }
    else if (!isURL(web)) { alert("bitte korrekte URL angeben"); }
    else {
        var hFachb = new Fachbereich(name, abk, web);

        document.getElementById("fachbereichName").value = "";
        document.getElementById("fachbereichAbkuerzung").value = "";
        document.getElementById("fachbereichWebseite").value = "";

        addToDatabase(hFachb);
    }
}

/**
 * entscheidet ob das GeoJSON Objekt eine Featurecollection ist oder nicht 
 * und gibt dem entsprechend passend die Geometrie zurueck
 * @param {JSON} pGeoJSON GeoJSON Objekt
 * @returns Geometrie des ersten Feature aus der Featurecollection oder Geometrie eines einzelnen Features
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
 * fügt das Institut zur Datenbank hinzu
 * @param {JSON} object
 */
function addToDatabase(object) {
    console.log(object);
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