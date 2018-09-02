"use strict";
/**
 * Startet sobald die Seite aufgerufen wird
 */
var fachbereichArr = [{
    "name": "GEOWISSENSCHAFTEN",
    "abkuerzung": "FB14",
    "webseite": "https://www.uni-muenster.de/Geowissenschaften/",
}];

window.onload = function () {
    var html = "<tr><th>Bereich</th><th>Kuerzel</th><th>Webseite</th>";
    for (var i = 0; i < fachbereichArr.length; i++) {
        html += generateHtml(fachbereichArr[i]);
    }
    document.getElementById("Fachbereiche").innerHTML = html;
}

/**
 * Generiert die Tabelle auf der Fachbereiche-Seite
 * @param {JSON} pFachbereich Mensa für die das Angebot in HTML uebertragen wird
 */
function generateHtml(pFachbereich) {
    var str = "<tr ><td>" + pFachbereich.name + "</td>" + "<td>" + pFachbereich.abkuerzung + "</td><td><a href='url'>" + pFachbereich.webseite + "</a></td></tr>"
    return str;
}


