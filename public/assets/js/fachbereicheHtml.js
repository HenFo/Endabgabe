"use strict";

/**
 * Startet sobald die Seite aufgerufen wird
 */
window.onload = function () {
    getFachbereiche();
}


/**
 * holt alle Fachbereiche aus der DB
 */
var fachbereichArr = []; //Array mit allen Fachbereichen
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

//Wird ausgefuert wenn alle AJAX-Anfragen abgeschlossen wurden
$(document).ajaxStop(function () {
    //HTML Tabelle erstellen
    var html = "<thead><tr><th>Bereich</th><th>Kuerzel</th><th>Webseite</th><th></th></thead>";
    for (var i = 0; i < fachbereichArr.length; i++) {
        html += generateHtml(fachbereichArr[i]);
    }
    document.getElementById("Fachbereiche").innerHTML = html;
});

/**
 * Generiert die Tabelle auf der Fachbereiche-Seite
 * @param {JSON} pFachbereich Fachbereich, fuer welches der Tabellenabschnitt erstellt wird
 */
//IDs fuer die Tabellen der Institute
var ids = 0;
function generateHtml(pFachbereich) {
    var str = "<tr ><td>" + pFachbereich.name + "</td>" + "<td>" + pFachbereich.abkuerzung + "</td><td><a href='url'>" + pFachbereich.webseite + "</a></td><td><button class='btn scrollDown' onclick='showTable(" + ids + ")'><span class='iconPos'><i class='fa fa-arrow-right'></i></span></button></tr>";
    str += "<tbody id='" + ids + "' class='tableFachInst'><tr><th colspan='2'>Institute</th><th colspan='2'>Bild</th></tr>";
    //Institutetabelle
    for (var x in pFachbereich.institute) {
        str += "<tr><td colspan='2'>" + pFachbereich.institute[x].name + "</td><td colspan='2'><img class='fachImage' src='" + pFachbereich.institute[x].image + "'/></td></tr>"
    }
    ids++;
    return str += "</tbody>";
}

/**
 * oeffnet/schliesst die Institutetabelle auf der Seite
 * @param {any} id
 */
function showTable(id) {
    $("#" + id).slideToggle();
}

