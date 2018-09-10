"use strict";
class Fachbereich {
    /**
     * Erstellt ein Objekt der Klasse Fachbereich
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
 * Startet sobald die Seite aufgerufen wird
 */
window.onload = function () {
    getFachbereiche();
}

var autoArr = []; //Array fuer die Autocompletefunktion
var fachbereichArr = []; //Array mit allen Fachbereichen
var fachID = ""; //ID des zu bearbeitenden Fachbereichs

/**
 * Sammeln aller Fachbereiche
 */
function getFachbereiche() {
    $.ajax({
        url: "/getAllFachbereiche",
        type: "GET",
        success: function (data) {
            for (var x in data) {
                autoArr.push(data[x].name, data[x].abkuerzung);
                fachbereichArr.push(data[x]);
            }
        },
        error: function (xhr) {
            alert(xhr.statusText);
        }
    });
}

//getriggert wenn suche aktiviert wird
$(document).ready(function () {
    $("#submitSearch").click(function () {
        var hName = document.getElementById("searchInput").value;
        if (hName != "") {
            //suchen des gesuchten Fachbereichs
            var i = 0, flag = false;
            while (i < fachbereichArr.length && !flag) {
                flag = fachbereichArr[i].name == hName || fachbereichArr[i].abkuerzung == hName;
                i++;
            }
            //abfangen, dass Fachbereich nicht gefunden wurde
            if (i <= fachbereichArr.length) {
                i--;
                //einfuegen aller Informationen
                $("#fachbereichName").val(fachbereichArr[i].name);
                //abkuerzung laesst sich nicht bearbeiten
                $("#fachbereichAbkuerzung").val(fachbereichArr[i].abkuerzung);
                $("#fachbereichWebseite").val(fachbereichArr[i].webseite);
                //setzen der ID
                fachID = fachbereichArr[i].abkuerzung;
                //oeffnen des loeschen buttons
                $("#deleteInst").slideDown();
            } else {
                alert("Fachbereich nicht vorhanden");
            }
        }
    })
});

/**
 * erstellt das Institut aus den gegebenen Angaben
 */
function addFachbereich() {
    //sammeln aller Informationen
    var name = document.getElementById("fachbereichName").value;
    var abk = document.getElementById("fachbereichAbkuerzung").value;
    var web = document.getElementById("fachbereichWebseite").value;

    //Fehleranalyse
    if (name == "") { alert("bitte einen Namen eingeben"); }
    else if (abk == "") { alert("bitte Abkürzung wählen"); }
    else if (!isURL(web)) { alert("bitte korrekte URL angeben"); }
    else {
        var hFachb = new Fachbereich(name, abk, web);
        editInDatabase(hFachb.toJSON());
    }
}

/**
 * updatet den Fachbereich in der Datenbank
 * @param {JSON} object aktualisierter Fachbereich
 */
function editInDatabase(pObject) {
    var object = JSON.stringify(pObject);
    $.ajax({
        type: 'POST',
        data: {"object": object, "id": fachID},
        url: "/editFachbereich",
        success: function () {
            alert('Fachbereich gespeichert');
            location.reload();
        },
        error: function () {
            alert('Speichern fehlgeschlagen');
        }
    });
}

//getriggert wenn Fachbereich geloescht werden soll
$(document).ready(function () {
    $("#deleteInst").click(function () {
        if (confirm("Fachbereich wirklich loeschen?")) {
            var object = { "abkuerzung": fachID };
            //loeschen des Fachbereichs
            $.ajax({
                type: 'POST',
                data: object,
                url: "/deleteFachbereich",
                success: function () {
                    //sammeln aller Institute
                    $.ajax({
                        type: 'GET',
                        url: "/getAllInstitutes",
                        success: function (data) {
                            //suchen der Institute, die zu dem Fachbereich gehoeren
                            var institute = [];
                            for (var x in data) {
                                if (data[x].data.features[0].properties.fachbereich == fachID)
                                    institute.push(data[x].ObjectID);
                            }
                            //loeschen jeder Institute aus dem geloeschten Fachbereich
                            for (var x in institute) {
                                $.ajax({
                                    type: 'POST',
                                    data: { "ObjectID": institute[x] },
                                    url: "/deleteInstitut",
                                    success: function () {
                                        

                                    },
                                    error: function () {
                                        alert('Institute loeschen fehlgeschlagen');
                                    }
                                });
                            }
                            location.reload();
                        },
                        error: function () {
                            alert('Institute sammeln fehlgeschlagen');
                        }
                    })
                    alert("Fachbereich geloescht");
                },
                error: function () {
                    alert('Fachbereich loeschen fehlgeschlagen');
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