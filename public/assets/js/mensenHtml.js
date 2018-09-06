"use strict";


class Mensa {
    /**
     * erstellt die Klasse Mensa
     * @param {String} pId Mensa ID
     * @param {String} pName Name der Mensa
     * @param {any} pPunkt Coordinate an der sich die Mensa befindet
     */
    constructor(pId, pName, pPunkt) {
        this.zId = pId;
        this.zName = pName;
        this.zPunkt = pPunkt;
        this.zGerichte = [];
    }

    get id() {
        return this.zId;
    }

    get coordinaten() {
        return this.zPunkt;
    }

    get name() {
        return this.zName;
    }

    get gerichte() {
        return this.zGerichte;
    }

    /**
     * Speichert die Gerichte, welche in der Mensa angeboten werden
     * @param {Gericht} pGerichte
     */
    setGerichte(pGerichte) {
        this.zGerichte = pGerichte;
    }
}

class Gericht {
    /**
     * Erstellt die Klasse Gericht
     * @param {Number} pId ID des Gerichts
     * @param {String} pMensa Name der Mensa an der es angeboten wird
     * @param {String} pName Name des Gerichts
     * @param {JSON} pPreise Liste der Preise
     */
    constructor(pId, pMensa, pName, pPreise) {
        this.zId = pId;
        this.zMensa = pMensa;
        this.zName = pName;
        this.zPreise = pPreise;
    }

    get id() {
        return this.zId;
    }

    get name() {
        return this.zName;
    }

    get preise() {
        return this.zPreise;
    }

    get mensa() {
        return this.zMensa;
    }
}

/**
 * Startet sobald die Seite aufgerufen wird
 */
window.onload = function () {
    getMensen();
}

/**
 * Startet sobald alle ajax anfragen geendet haben
 */
$(document).ajaxStop(function () {
    var html = "<tr><th> Mensa</th ><th>Gerichte</th><th>Student</th><th>Angestellte</th><th>Sonstige</th></tr >"
    for (var i = 0; i < mensen.length; i++) {
        html += generateHtml(mensen[i])
    }
    document.getElementById("MensaGerichte").innerHTML = html;
});

var mensen = [];
/**
 * holt sich alle Mensen in einem Umkreis von 10km ums Stadtzentrum 
 */
function getMensen() {
    $.ajax({
        url: "https://openmensa.org/api/v2/canteens/?near[lat]=51.96&near[lng]=7.63",
        type: "GET",
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                mensen.push(new Mensa(data[i].id, data[i].name, data[i].coordinates));
            }
            for (var i = 0; i < mensen.length; i++) {
                getMeal(mensen[i], i);
            }

        },
        error: function (xhr) {
            alert(xhr.statusText);
        }
    });
}

/**
 * holt sich das Essens-Angebot aller Mensen 
 * @param {Mensa} pMensa Mensa für díe das Angebot gesucht wird
 * @param {Number} i position im Array an der sich die Mensa befindet
 */
function getMeal(pMensa, i) {
    //aktuelles Datum umschreiben, damit es fuer die Mensa API verwendet werden kann
    var hHeute = new Date(),
        hMonat = hHeute.getMonth() + 1,
        hTag = hHeute.getDate();
    if (hMonat < 10)
        hMonat = "0" + hMonat;
    if (hTag < 10)
        hTag = "0" + hTag;
    //erfuellen der MensaAPI anforderung fuer ein Datum
    hHeute = hHeute.getFullYear() + "-" + hMonat + "-" + hTag;

    var hGerichte = [];
    $.ajax({
        url: "https://openmensa.org/api/v2/canteens/" + pMensa.id + "/days/" + hHeute + "/meals",
        type: "GET",
        success: function (data) {
            //Gerichte werden abgefragt und dann in der Mensa gespeichert
            for (var j = 0; j < data.length; j++) {
                var gericht = new Gericht(data[j].id, pMensa.name, data[j].name, data[j].prices);
                hGerichte.push(gericht);
            }
            //console.log(hGerichte);
            mensen[i].setGerichte(hGerichte);

        },
        error: function (xhr) {
            console.log("kein Gericht gefunden");
        }
    });

}

/**
 * Generiert die Tabelle auf der Mensa-Seite
 * @param {Mensa} pMensa Mensa für die das Angebot in HTML uebertragen wird
 */
function generateHtml(pMensa) {
    if (pMensa.gerichte.length > 0) {
        var str = "<tr ><td>" + pMensa.name + "</td>" + "<td>" + pMensa.gerichte[0].name + "</td><td>" + pMensa.gerichte[0].preise.students + " &euro;</td><td>" + pMensa.gerichte[0].preise.employees + " &euro;</td><td>" + pMensa.gerichte[0].preise.others + " &euro;</td></tr>"
        for (var i = 1; i < pMensa.gerichte.length; i++) {
            str += "<tr><td></td>" + "<td>" + pMensa.gerichte[i].name + "</td><td>" + pMensa.gerichte[i].preise.students + " &euro;</td><td>" + pMensa.gerichte[i].preise.employees + " &euro;</td><td>" + pMensa.gerichte[i].preise.others + " &euro;</td></tr>";
        }
        return str + "</tr>";
    } else return "<tr  class='tableEmpty'><td>" + pMensa.name + "<td>keine Angaben</td><td></td><td></td><td></td></tr>";
}




