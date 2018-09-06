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
    /**
     * Erstellt ein Objekt dr Klasse Gericht
     * @param {any} pId
     * @param {any} pMensa
     * @param {String} pName
     * @param {JSON} pPreise
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
}

var mensen = []; //Array mit allen Mensen
var gerichte = []; //Array mit allen Gerichten
var mensenPopup = []; //Array mit den Popups 

/**
 * holt sich alle Mensen im 10km Radius um Muenster von der Mensa API und speichert diese m Array
 */
function getMensen() {
    $.ajax({
        type: "GET",
        url: "https://openmensa.org/api/v2/canteens/?near[lat]=51.96&near[lng]=7.63",
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                var hMensa = new Mensa(data[i].id, data[i].name, data[i].coordinates);
                //gericht zur Mensa
                getMeal(hMensa);
            }
            //fuer die Verteilung im Autocomplete Array
            autoArrDist.mensen = data.length + autoArrDist.fachbereiche;

        },
        error: function (xhr) {
            alert(xhr.statusText);
        }
    });
}

/**
 * Holt die Gerichte, die in der uebergebenen Mensa angeboten
 * @param {Mensa} pMensa Mensa, fuer dei die Gerichte gesammelt werden sollen
 */
function getMeal(pMensa) {
    //aktuelles Datum
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
        type: "GET",
        url: "https://openmensa.org/api/v2/canteens/" + pMensa.id + "/days/" + hHeute + "/meals",
        success: function (data) {
            for (var j = 0; j < data.length; j++) {
                var gericht = new Gericht(data[j].id, pMensa.name, data[j].name, data[j].prices);
                hGerichte.push(gericht);
            }
            //popup fuer die Karte
            var popUp = generatePopUp(hGerichte);
            //marker fuer die Karte
            var marker = L.marker(pMensa.coordinaten).addTo(map).bindPopup("<h5>" + pMensa.name + "</h5>" + popUp + "<br/><button class='btn popup' onclick='toDestination(" + pMensa.coordinaten + ")'>Zu dieser Mensa navigieren</button>");
            Mensen.addLayer(marker);
            mensenPopup.push(marker);
            mensen.push(pMensa);
            //Name der Mensa ins Autocomplete Array
            autoArr.push(pMensa.name);
        },
        error: function (xhr) {
            //marker fuer die Karte
            var marker = L.marker(pMensa.coordinaten).addTo(map).bindPopup("<h5>" + pMensa.name + "</h5><table><tr><td>Keine Daten zu den Gerichten</td></tr></table> <br/><button class='btn popup' onclick='toDestination(" + pMensa.coordinaten + ")'>Zu dieser Mensa navigieren</button>");
            Mensen.addLayer(marker);
            mensenPopup.push(marker);
            mensen.push(pMensa);
            //Name der Mensa ins Autocomplete Array
            autoArr.push(pMensa.name);
        }
    });
}

/**
 * oeffnet das Popup der uebergebenen MensaID
 * @param {any} pID ID der Mensa, dessen Popup geoeffnet werden soll
 */
function openMensaPopup(pID) {
    mensenPopup[pID].openPopup();
}

/**
 * Erstellt ein passendes PopUp
 * @param {Gericht} pGericht
 * @returns Popup mit Gerichten der zugehoerigen Mensan als Inhalt 
 */
function generatePopUp(pGericht) { //navigation hinzufuegen
    var str = "";
    for (var i = 0; i < pGericht.length; i++) {
        str = str + "<tr><td>" + pGericht[i].name + "</td><td><table><tr><th>Studenten</th><th>Angestellte</th><th>Sonstige</th></tr><tr><td>" + pGericht[i].preise.students + "&euro;</td><td>" + pGericht[i].preise.employees + "&euro;</td><td>" + pGericht[i].preise.others + "&euro;</td></tr></table></td></tr>";
    }
    return "<table><tr><th>Gericht</th><th>Preis</th></tr>" + str + "</table>";
}




