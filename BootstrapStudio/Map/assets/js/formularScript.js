"use strict";

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


var hGeometryInput = null;
function addInstitut() {
    var name = document.getElementById("InstitutName").value;
    var fachbereich = document.getElementById("fachbereichSelect").value;
    var img = document.getElementById("InstitutBildURL").value;

    if (name.length < 5) { alert("Name ist zu kurz"); }
    else if (fachbereich == "wähle Fachbereich") { alert("bitte Fachbereich auswählen"); }
    else if (!isURL(img)) { alert("bitte korrekte URL angeben"); }
    else {

        switch (hGeometryInput) {
            case 0:
                break;
            case 1:
                try {
                    var json = loadDoc();
                    var geometry = returnGeometry(json);
                    var institut = new Institut(name, fachbereich, img, geometry);
                    console.log(institut.toGeoJSON());
                    addToDatabase(institut.toGeoJSON());
                } catch (e) {alert(e)}
                break;
            default:
                alert("Geometrie eingeben");
                break;
        }
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



$(document).ready(function () {
    $("#Bzeichnen").click(function () {
        $("#geoJSON").hide();
        $("#mapEdit").show(1000);
        hGeometryInput = 0;
    });
});

$(document).ready(function () {
    $("#Bcopy").click(function () {
        $("#mapEdit").hide();
        $("#geoJSON").show(1000);
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