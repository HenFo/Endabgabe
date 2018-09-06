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
        this.institute = [];
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
    //sammeln der Informationen
    var name = document.getElementById("fachbereichName").value;
    //abkuerzung wird wie Primaerschluessel behandelt
    var abk = document.getElementById("fachbereichAbkuerzung").value;
    var web = document.getElementById("fachbereichWebseite").value;

    //Fehleranalyse
    if (name == "") { alert("bitte einen Namen eingeben"); }
    else if (abk == "") { alert("bitte Abkürzung wählen"); }
    else if (!isURL(web)) { alert("bitte korrekte URL angeben"); }
    else {
        var hFachb = new Fachbereich(name, abk, web);

        document.getElementById("fachbereichName").value = "";
        document.getElementById("fachbereichAbkuerzung").value = "";
        document.getElementById("fachbereichWebseite").value = "";

        //zur Datenbank hinzufuegen
        addToDatabase(hFachb.toJSON());
    }
}

/**
 * fügt das Institut zur Datenbank hinzu
 * @param {JSON} object Institut was hinzugefuegt werden soll
 */
function addToDatabase(object) {
    $.ajax({
        type: 'POST',
        data: object,
        url: "/addFachbereich",
        success: function () {
            alert('Fachbereich gespeichert');
        },
        error: function () {
            alert('Speichern fehlgeschlagen');
        }
    });
}

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