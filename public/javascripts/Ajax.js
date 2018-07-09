/**
 * @Author Tandik (42909)
 * @Author Fock (443068)
 */

"use strict";

var consoleAppender=JL.createConsoleAppender('consoleAppender');
var mylogger = JL("mylogger");
mylogger.setOptions({"appenders": [consoleAppender]});

/**
 * takes the input from the html page an if it is a
 * valide GeoJSON Object, it adds the features to the map.
 */
function loadDoc() {
    if (isURL(document.getElementById("urlToGeoJSON").value)) {
      JL("mylogger").info("Getting GeoJSON object from URL");
        var xhttp = new XMLHttpRequest();
        var geoJsonObject;
        xhttp.onreadystatechange = function () {
            if (this.status == 200 && this.readyState == 4) {
                geoJsonObject = JSON.parse(this.responseText);
                L.geoJson(geoJsonObject).addTo(map);
            }
        };

        var link = "" + document.getElementById("urlToGeoJSON").value;
        xhttp.open("GET", link, true);
        xhttp.send();
    } else {
        geoJsonObject = JSON.parse(""+ document.getElementById("urlToGeoJSON").value);
        console.log(geoJsonObject);
        L.geoJson(geoJsonObject).addTo(map);
        JL("mylogger").info("GeoJSON object parsed");
    }
}

/**
 * takes a string an checks if it is a url
 * @param {String} str checks whether it is a URL or not
 * @returns true if String is URL, otherwise false
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
