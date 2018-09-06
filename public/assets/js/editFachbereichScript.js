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

window.onload = function () {
    getFachbereiche();
}

var autoArr = [];
var fachbereichArr = [];
var fachID = "";

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


$(document).ready(function () {
    $("#submitSearch").click(function () {
        var hName = document.getElementById("searchInput").value;
        if (hName != "") {
            var i = 0, flag = false;
            while (i < fachbereichArr.length && !flag) {
                flag = fachbereichArr[i].name == hName || fachbereichArr[i].abkuerzung == hName;
                i++;
            }
            if (i <= fachbereichArr.length) {
                i--;
                $("#fachbereichName").val(fachbereichArr[i].name);
                $("#fachbereichAbkuerzung").val(fachbereichArr[i].abkuerzung);
                $("#fachbereichWebseite").val(fachbereichArr[i].webseite);
                fachID = fachbereichArr[i].abkuerzung;
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
    var name = document.getElementById("fachbereichName").value;
    var abk = document.getElementById("fachbereichAbkuerzung").value;
    var web = document.getElementById("fachbereichWebseite").value;

    if (name == "") { alert("bitte einen Namen eingeben"); }
    else if (abk == "") { alert("bitte Abkürzung wählen"); }
    else if (!isURL(web)) { alert("bitte korrekte URL angeben"); }
    else {
        var hFachb = new Fachbereich(name, abk, web);
        editInDatabase(hFachb.toJSON());
    }
}

/**
 * fügt das Institut zur Datenbank hinzu
 * @param {JSON} object
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

$(document).ready(function () {
    $("#deleteInst").click(function () {
        if (confirm("Fachbereich wirklich loeschen?")) {
            var object = { "abkuerzung": fachID };
            $.ajax({
                type: 'POST',
                data: object,
                url: "/deleteFachbereich",
                success: function () {
                    alert("Fachbereich geloescht");
                    $.ajax({
                        type: 'GET',
                        url: "/getAllInstitutes",
                        success: function (data) {
                            var institute = [];
                            for (var x in data) {
                                if (data[x].data.features[0].properties.fachbereich == fachID)
                                    institute.push(data[x].ObjectID);
                            }
                            for (var x in institute) {
                                $.ajax({
                                    type: 'POST',
                                    data: { "ObjectID": institute[x] },
                                    url: "/deleteInstitut",
                                    success: function () {
                                        console.log(institute[x]);

                                    },
                                    error: function () {
                                        alert('Institute loeschen fehlgeschlagen');
                                    }
                                });
                            }
                        },
                        error: function () {
                            alert('Institute sammeln fehlgeschlagen');
                        }
                    })
                },
                error: function () {
                    alert('Fachbereich loeschen fehlgeschlagen');
                }
            });
        }
    });
});

$(document).ready(function () {
    $("#submitSearch").click(function () {
        if (document.getElementById("searchInput").value != "") {
            $("#deleteInst").slideDown();
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