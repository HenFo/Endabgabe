"use strict";
/**
 * Startet sobald die Seite aufgerufen wird
 */
//var fachbereichArr = [{
//    "name": "GEOWISSENSCHAFTEN",
//    "abkuerzung": "FB14",
//    "webseite": "https://www.uni-muenster.de/Geowissenschaften/",
//    "institute": [{"name": "Geoinformartik", "fachbereich": "FB14", "image": "hallo"}]
//}];

var fachbereichArr = [];
function getFachbereiche() {
    $.ajax({
        url: "/getAllFachbereiche",
        type: "GET",
        success: function (data) {
            for (var x in data) {
                fachbereichArr.push(data[x]);
            }
        },
        error: function (xhr) {
            alert(xhr.statusText);
        }
    });
}

window.onload = function () {
    getFachbereiche();
}

$(document).ajaxStop(function () {
    var html = "<thead><tr><th>Bereich</th><th>Kuerzel</th><th>Webseite</th><th></th></thead>";
    for (var i = 0; i < fachbereichArr.length; i++) {
        html += generateHtml(fachbereichArr[i]);
    }
    document.getElementById("Fachbereiche").innerHTML = html;
});

/**
 * Generiert die Tabelle auf der Fachbereiche-Seite
 * @param {JSON} pFachbereich Mensa für die das Angebot in HTML uebertragen wird
 */
var ids = 0;
function generateHtml(pFachbereich) {
    var str = "<tr ><td>" + pFachbereich.name + "</td>" + "<td>" + pFachbereich.abkuerzung + "</td><td><a href='url'>" + pFachbereich.webseite + "</a></td><td><button class='btn scrollDown' onclick='showTable(" + ids + ")'><span class='iconPos'><i class='fa fa-arrow-right'></i></span></button></tr>";
    str += "<tbody id='" + ids + "' class='tableFachInst'><tr><th colspan='2'>Institute</th><th colspan='2'>Bild</th></tr>"
    for (var x in pFachbereich.institute) {
        str += "<tr><td colspan='2'>" + pFachbereich.institute[x].name + "</td><td colspan='2'><img src='" + pFachbereich.institute[x].image + "'/></td></tr>"
    }
    ids++;
    return str += "</tbody>";
}

function showTable(id) {
    $("#"+id).slideToggle();
}

