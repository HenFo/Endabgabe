"use strict";

class Mensa {
    /**
     * erstellt die Klasse Mensa
     * @param {String} pId
     * @param {String} pName
     * @param {any} pPunkt
     */
    constructor(pId, pName, pPunkt) {
        this.zId = pId;
        this.zName = pName;
        this.zPunkt = pPunkt;
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
}

class Gericht {

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
}

var mensen = [];
var gerichte = [];
var mensenPopup = [];
function getMensen() {
    $.ajax({
        type: "GET",
        url: "https://openmensa.org/api/v2/canteens/?near[lat]=51.96&near[lng]=7.63",
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                mensen.push(new Mensa(data[i].id, data[i].name, data[i].coordinates));
                autoArr.push(data[i].name);
            }
            //console.log(mensen);
            for (var i = 0; i < mensen.length; i++) {
                getMeal(mensen[i]);
            }
            //console.log(mensen);
            autoArrDist.mensen = data.length + autoArrDist.fachbereiche;

        },
        error: function (xhr) {
            alert(xhr.statusText);
        }
    });
}


function getMeal(pMensa) {
    //aktuelles Datum
    var hHeute = new Date(),
        hMonat = hHeute.getMonth() + 1,
        hTag = hHeute.getDate();
    if (hMonat < 10)
        hMonat = "0" + hMonat;
    if (hTag < 10)
        hTag = "0" + hTag;
    hHeute = hHeute.getFullYear() + "-" + hMonat + "-" + hTag;

    var hGerichte = [];
    $.ajax({
        type: "GET",
        url: "https://openmensa.org/api/v2/canteens/" + pMensa.id + "/days/" + hHeute + "/meals",
        success: function (data) {
            for (var j = 0; j < data.length; j++) {
                var gericht = new Gericht(data[j].id, pMensa.name, data[j].name, data[j].prices);
                hGerichte.push(gericht);
                gerichte.push(gericht);
            }
            //console.log(hGerichte);
            var popUp = generatePopUp(hGerichte);
            var marker = L.marker(pMensa.coordinaten).addTo(map).bindPopup("<h5>" + pMensa.name + "</h5>" + popUp + "<br/><button class='btn popup' onclick='toDestination(" + pMensa.coordinaten + ")'>Zu dieser Mensa navigieren</button>");
            Mensen.addLayer(marker);
            mensenPopup.push(marker);

            console.log(pMensa.name);
        },
        error: function (xhr) {
            var marker = L.marker(pMensa.coordinaten).addTo(map).bindPopup("<h5>" + pMensa.name + "</h5><table><tr><td>Keine Daten zu den Gerichten</td></tr></table> <br/><button class='btn popup' onclick='toDestination(" + pMensa.coordinaten + ")'>Zu dieser Mensa navigieren</button>");
            Mensen.addLayer(marker);
            mensenPopup.push(marker);
            console.log(pMensa.name);
            //console.log("kein Gericht gefunden");
        }
    });
}

function openMensaPopup(pID) {
    mensenPopup[pID].openPopup();
}

/**
 * Erstellt ein passendes PopUp
 * @param {Gericht[]} pGericht
 */
function generatePopUp(pGericht) { //navigation hinzufuegen
    var str = "";
    for (var i = 0; i < pGericht.length; i++) {
        str = str + "<tr><td>" + pGericht[i].name + "</td><td><table><tr><th>Studenten</th><th>Angestellte</th><th>Sonstige</th></tr><tr><td>" + pGericht[i].preise.students + "&euro;</td><td>" + pGericht[i].preise.employees + "&euro;</td><td>" + pGericht[i].preise.others + "&euro;</td></tr></table></td></tr>";

    }
    return "<table><tr><th>Gericht</th><th>Preis</th></tr>" + str + "</table>";
}




