var request = require('supertest');
var assertion = require("assert");
var app = require('../app');
var monk = require('monk');
var db = monk('localhost:27017/GeoCollection');
var JL = require('jsnlog').JL;


describe("Teste alle gebrauchten Funktionen", function () {
    it("erflogreiches Einfuegen von Fachbereichen", function (done) {
        var collectionFach = db.get("fachbereiche");
        var fachbereich = { "name": "test", "abkuerzung": "FB/7", "webseite": "www", "institute": [] };
        collectionFach.find({}, {}, function (err, data) {
            var anzahlFachbereiche = data.length;
            request(app)
                .post("/addFachbereich")
                .send(fachbereich)
                .end(function (err, res) {
                    collectionFach.find({}, {}, function (err, data) {
                        assertion.notEqual(anzahlFachbereiche, data.length);
                        done();
                    });
                });
        });

    });

    it("erfolgreiches editieren con Fachbereichen", function (done) {
        var collectionFach = db.get("fachbereiche");
        var newObject = {
            "name": "Geowissenschaften", "abkuerzung": "FB/7", "webseite": "https://www.uni-muenster.de/Geowissenschaften/", "institute": []
        };
        newObject = JSON.stringify(newObject);
        var newFachbereich = { "id": "FB/7", "object": newObject };

        collectionFach.find({}, {}, function (err, data) {
            var FachbereicheVorher = data.length;
            request(app)
                .post("/editFachbereich")
                .send(newFachbereich)
                .end(function (err, res) {
                    collectionFach.find({}, {}, function (err, data) {
                        assertion.equal(FachbereicheVorher, data.length);
                        assertion.deepEqual({ "name": "Geowissenschaften", "abkuerzung": "FB/7", "webseite": "https://www.uni-muenster.de/Geowissenschaften/" }, { "name": data[0].name, "abkuerzung": data[0].abkuerzung, "webseite": data[0].webseite });
                        done();
                    });
                });
        });
    });

    it("erfolgreich einfuegen von Instituten", function (done) {
        var collectionInst = db.get("institute");
        var collectionFach = db.get("fachbereiche");
        var institut = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties":
                        {
                            "name": "Institut für Geoiformatik",
                            "fachbereich": "FB/7",
                            "image": "https://www.uni-muenster.de/imperia/md/images/zdmgeo/_v/banner1_761x381.png"
                        },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [51.96966694957956, 7.5955089926719666],
                                [51.96929514645031, 7.595372200012207],
                                [51.96921748051828, 7.595951557159424],
                                [51.96958928429187, 7.596091032028197],
                                [51.96966694957956, 7.5955089926719666]
                            ]
                        ]
                    }
                }
            ]
        };

        institut = JSON.stringify(institut);
        institut = { "ObjectID": "GeoinformatikInstitut", "data": institut };
        collectionInst.find({}, {}, function (err, data) {
            var instituteVorher = data.length;
            request(app)
                .post("/addInstitut")
                .send(institut)
                .end(function (err, res) {
                    if (err) { done(err); } else {
                        collectionInst.find({}, {}, function (err, data) {
                            assertion.notEqual(instituteVorher, data.length);
                            request(app)
                                .post("/addInstitutInFachbereich")
                                .send(institut)
                                .end(function (err, res) {
                                    collectionFach.find({ "abkuerzung": "FB/7" }, {}, function (err, dataFach) {
                                        assertion.deepEqual(data[0].data.features[0].properties, { "name": dataFach[0].institute[0].name, "fachbereich": dataFach[0].institute[0].fachbereich, "image": dataFach[0].institute[0].image });
                                        done();
                                    });
                                });
                        });
                    }
                });
        });

    });

    it("Institut editieren", function (done) {
        var collectionInst = db.get("institute");
        var collectionFach = db.get("fachbereiche");

        var institut = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties":
                        {
                            "name": "Institut für Geo",
                            "fachbereich": "FB/7",
                            "image": "https://www.uni-muenster.de/imperia/md/images/zdmgeo/_v/banner1_761x381.png",
                        },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [51.96966694957956, 7.5955089926719666],
                                [51.96929514645031, 7.595372200012207],
                                [51.96921748051828, 7.595951557159424],
                                [51.96958928429187, 7.596091032028197],
                                [51.96966694957956, 7.5955089926719666]
                            ]
                        ]
                    }
                }
            ]
        };

        institut = { "ObjectID": "GeoinformatikInstitut", "data": JSON.stringify(institut) };
        collectionInst.find({}, {}, function (err, dataInst) {
            var instLength = dataInst.length;
            collectionFach.find({}, {}, function (err, dataFach) {
                var fachInstLength = dataFach[0].institute.length;
                request(app)
                    .post("/saveInstitut")
                    .send(institut)
                    .end(function (err, res) {
                        collectionInst.find({}, {}, function (err, dataInst) {
                            assertion.equal(instLength, dataInst.length);
                            assertion.deepEqual(dataInst[0].data.features[0].properties, { "name": "Institut für Geo", "fachbereich": "FB/7", "image": "https://www.uni-muenster.de/imperia/md/images/zdmgeo/_v/banner1_761x381.png" });
                            request(app)
                                .post("/saveInstitutInFachbereich")
                                .send(institut)
                                .end(function (err, res) {
                                    collectionFach.find({}, {}, function (err, dataFach) {
                                        assertion.deepEqual({ "name": dataFach[0].institute[0].name, "fachbereich": dataFach[0].institute[0].fachbereich, "image": dataFach[0].institute[0].image }, { "name": "Institut für Geo", "fachbereich": "FB/7", "image": "https://www.uni-muenster.de/imperia/md/images/zdmgeo/_v/banner1_761x381.png" });
                                        done();
                                    });
                                });
                        });
                    });
            });
        });
    });

    it("loeschen von Instituten", function (done) {
        var collectionInst = db.get("institute");
        var collectionFach = db.get("fachbereiche");

        var ID = { "ObjectID": "GeoinformatikInstitut" };
        collectionInst.find({}, {}, function (err, dataInst) {
            var instLength = dataInst.length;
            request(app)
                .post("/deleteInstitut")
                .send(ID)
                .end(function (err, res) {
                    collectionInst.find({}, {}, function (err, dataInst) {
                        assertion.equal(dataInst.length, instLength - 1);
                        collectionFach.find({}, {}, function (err, dataFach) {
                            instLength = dataFach[0].institute.length;
                            request(app)
                                .post("/deleteInstitutFromFachbereich")
                                .send({ "ID": "GeoinformatikInstitut", "fachbereich": "FB/7" })
                                .end(function (err, res) {
                                    collectionFach.find({}, {}, function (err, dataFach) {
                                        assertion.equal(dataFach[0].institute.length, instLength-1);
                                        done();
                                    });
                                });
                        });
                    });
                });
        });
    });

    it("loeschen von Fachbeeichen", function (done) {
        var collectionFach = db.get("fachbereiche");

        collectionFach.find({}, {}, function (err, dataFach) {
            var fachLength = dataFach.length;
            request(app)
                .post("/deleteFachbereich")
                .send({ "abkuerzung": "FB/7" })
                .end(function (err, res) {
                    collectionFach.find({}, {}, function (err, dataFach) {
                        assertion.equal(dataFach.length, fachLength - 1);
                        done();
                    })
                })
        })

    });

});

