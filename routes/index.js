var express = require('express');
var router = express.Router();

var JL = require('jsnlog').JL;
var jsnlog_nodejs = require('jsnlog-nodejs').jsnlog_nodejs;

 //GET home page. 
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Startseite' });
});

//GET Karte page
router.get('/karte', function (req, res, next) {
    res.render('karte', { title: 'Karte der WWU' });
});

//GET Mensa page
router.get('/Mensen/index', function (req, res) {
    res.render('Mensen', { title: 'Mensen in Muenster' });
})

//GET fachbereiche page
router.get('/fachbereich/index', function (req, res) {
    var db = req.db;
    var collection = db.get("fachbereiche");
    collection.find({}, {}, function (e, docs) {
        res.render('fachbereich', { title: 'Fachbereiche', "fachbereiche": docs });
    })
})

//GET institute page
router.get('/institute/index', function (req, res) {
    res.render('institute', { title: 'Institute' });
})

//GET impressum page
router.get('/impressum/index', function (req, res) {
    res.render('impressum', { title: 'Impressum' });
})

//GET Fachbereich erstellen 
router.get('/createFachbereich/fachbereich', function (req, res) {
    res.render('createFachbereich', { title: 'Erstelle ein Fachbereich' });
})

//GET Institut erstellen
router.get('/createInstitut/institute', function (req, res) {
    var db = req.db;
    var collection = db.get('fachbereiche');
    collection.find({}, {}, function (e, docs) {
        if (e) { res.render('createInstitut', { title: 'Erstelle ein Institut' }); } else {
            res.render('createInstitut', { title: 'Erstelle ein Institut', "fachbereiche": docs });
        }
    });

})

//GET Fachbereich bearbeiten
router.get('/editFachbereich/fachbereich', function (req, res) {
    res.render('editFachbereich', { title: 'Bearbeite ein Fachbereich' });
})

//GET Institut bearbeiten
router.get('/editInstitut/institute', function (req, res) {
    var db = req.db;
    var collection = db.get('fachbereiche');
    collection.find({}, {}, function (e, docs) {
        if (e) { res.render('editInstitut', { title: 'Bearbeite ein Institut' }); } else {
            res.render('editInstitut', { title: 'Bearbeite ein Institut', "fachbereiche": docs });
        }
    });})

//GET alle gespeicherten Fachbereiche
router.get('/getAllFachbereiche', function (req, res) {
    var db = req.db;
    var collection = db.get('fachbereiche');
    collection.find({}, {}, function (e, docs) {
        res.send(docs);
    });
})

//GET alle gespeicherten Institute
router.get('/getAllInstitutes', function (req, res) {
    var db = req.db;
    var collection = db.get('institute');
    collection.find({}, {}, function (e, docs) {
        res.send(docs);
    });
})

//GET alle Routen
router.get('/getAllRoutes', function (req, res) {
    var db = req.db;
    var collection = db.get('routen');
    collection.find({}, {}, function (e, docs) {
        res.send(docs);
    });
})

//POST Fachbereich in die DB einfuegen
router.post('/addFachbereich', function (req, res) {
    var db = req.db;
    var document = req.body;
    db.collection('fachbereiche').insert(document, function (err, result) {
        if (err) {
            JL().fatal(err);
        } else {
            res.send(document);
        }
    });
})

//POST Institut in die DB einfuegen
router.post('/addInstitut', function (req, res) {
    var db = req.db;
    var document = req.body;
    var ID = document.ObjectID;
    var data = JSON.parse(document.data);
    document = { "ObjectID": ID, "data": data };
    db.collection('institute').insert(document, function (err, result) {
        if (err) {
            JL().fatal(err);
        } else {
            JL().info("Institut in DB eingefuegt");
            res.send(document);
        }
    });
})


//POST Route in die DB einfuegen
router.post('/addRoute', function (req, res) {
    var db = req.db;
    var document = req.body;
    var ID = document.ObjectID;
    document = JSON.parse(document.data);
    db.collection('routen').insert({ "ObjectID": ID, "name": document.name, "start": document.start, "ziel": document.ziel }, function (err, result) {
        if (err) {
            JL().fatal(err);
        } else {
            JL().info("Route in DB eingefuegt");
            res.send(document);
        }
    });
})


//POST Institut aktualisieren
router.post('/saveInstitut', function (req, res) {
    var db = req.db;
    var document = req.body;
    var ID = document.ObjectID;
    var data = JSON.parse(document.data);
    db.collection('institute').update({ "ObjectID": ID }, {
        $set: { "ObjectID": ID, "data": data }} , function (err, result) {
        if (err) {
            JL().fatal(err);
        } else {
            JL().info("Institut in DB aktualisiert");
            res.send(result);
        }
    });
})


//POST Fachbereich aktualisieren
router.post('/editFachbereich', function (req, res) {
    var db = req.db;
    var document = req.body;
    var ID = document.id;
    document = JSON.parse(document.object);
    db.collection('fachbereiche').update({ "abkuerzung": ID }, { $set: { "name": document.name, "webseite": document.webseite } }, function (err, result) {
        if (err) {
            JL().fatal(err);
        } else {
            JL().info("Fachbereich bearbeitet");
            res.send(document);
        }
    });
})


//POST Route aktualisieren
router.post('/editRoute', function (req, res) {
    var db = req.db;
    var document = req.body;
    var ID = document.ObjectID;
    document = JSON.parse(document.data);
    JL().debug(ID);
    JL().debug(document);
    db.collection('routen').update({ "ObjectID": ID }, { $set: document }, function (err, result) {
        if (err) {
            JL().fatal(err);
        } else {
            JL().info("Route bearbeitet");
            res.send(document);
        }
    });
})


//POST Fuegt ein Institut in seinen Fachbereich ein
router.post('/addInstitutInFachbereich', function (req, res) {
    var db = req.db;
    var document = req.body;
    var data = JSON.parse(document.data).features[0].properties;
    data = { "ObjectID": document.ObjectID, "name": data.name, "fachbereich": data.fachbereich, "image": data.image };
    var hFachbereich = data.fachbereich;
    //Fachbereich finden
    db.collection('fachbereiche').find({ "abkuerzung": hFachbereich }, {}, function (err, docs) {
        if (err) { JL().fatal(err); } else {
            //checken ob kein Institut vorhanden ist
            if (typeof docs[0].institute !== "undefined") {
                var institute = docs[0].institute;
            } else {
                var institute = [];
            }
            institute.push(data);
            //Fachbereich aktualisieren
            db.collection('fachbereiche').update({ "abkuerzung": hFachbereich }, {
                $set: { "institute": institute }, function(err, result) {
                    if (err) {
                        JL().fatal(err);
                    } else {
                        JL().info("Institut im Fachbereich eingefuegt");
                        res.send(result);
                    }
                }
            });
            res.send(docs);
        }
    });
})


//POST aktualisiert ein Institut in den Fachbereichen
router.post('/saveInstitutInFachbereich', function (req, res) {
    var db = req.db;
    var document = req.body;
    var data = JSON.parse(document.data).features[0].properties;
    data = { "ObjectID": document.ObjectID, "name": data.name, "fachbereich": data.fachbereich, "image": data.image };
    var hFachbereich = data.fachbereich;
    db.collection('fachbereiche').find({ "abkuerzung": hFachbereich }, {}, function (err, docs) {
        if (err) { JL().debug(err); } else {
            //finde betroffenes Institut
            var i = 0, flag = false, institute = docs[0].institute;
            while (i < institute.length && !flag) {
                flag = institute[i].ObjetID == data.ObjectID;
                i++
            }
            //Institut ersetzen
            institute.splice(i - 1, 1, data);
            db.collection('fachbereiche').update({ "abkuerzung": hFachbereich }, {
                $set: { "institute": institute }, function(err, result) {
                    if (err) {
                        JL().fatal(err);
                    } else {
                        JL().info("Institut aktualisiert");
                        res.send(result);
                    }
                }
            });
            res.send(docs);
        }
    });
})


//POST loescht ein Institut
router.post('/deleteInstitut', function (req, res) {
    var db = req.db;
    var document = req.body;
    JL().debug(document);
    db.collection('institute').remove(document, function (err, result) {
        if (err) {
            JL().fatal(err);
        } else {
            JL().info("Institut geloescht");
            res.send(document);
        }
    });
})


//POST loescht ein Institut aus den Fachbereichen
router.post('/deleteInstitutFromFachbereich', function (req, res) {
    var db = req.db;
    var document = req.body;
    db.collection('fachbereiche').find({ "abkuerzung": document.fachbereich }, {}, function (err, docs) {
        if (err) { JL().fatal(err); } else {
            //suche nach betroffenen Instituten
            var i = 0, flag = false, institute = docs[0].institute;
            while (i < institute.length && !flag) {
                flag = institute[i].ObjectID == document.ObjectID;
                i++
            }
            //institut loeschen
            institute.splice(i - 1, 1);
            db.collection('fachbereiche').update({ "abkuerzung": document.fachbereich }, {
                $set: { "institute": institute }, function(err, result) {
                    if (err) {
                        JL().fatal(err);
                    } else {
                        JL().info("Institut aus Fachbereich geloescht");
                        res.send(result);
                    }
                }
            });
            res.send(docs);
        }
    });
})


//POST loescht alle Institute
router.post('/clearInstitut', function (req, res) {
    var db = req.db;
    db.collection('institute').remove({}, function (err, result) {
        if (err) {

        } else {
            res.send(result);
        }
    });
})


//POST loescht alle Fachbereiche
router.post('/clearFachbereiche', function (req, res) {
    var db = req.db;
    db.collection('fachbereiche').remove({}, function (err, result) {
        if (err) {

        } else {
            res.send(result);
        }
    });
})


//POST loescht alle Routen
router.post('/clearRouten', function (req, res) {
    var db = req.db;
    db.collection('routen').remove({}, function (err, result) {
        if (err) {

        } else {
            res.send(result);
        }
    });
})


//POST loescht eine Route
router.post('/deleteRoute', function (req, res) {
    var db = req.db;
    var document = req.body;
    JL().debug(document);
    db.collection('routen').remove(document, function(err, result) {
        if (err) {
            JL().fatal(err);
        } else {
            JL().info("Route geloescht");
            res.send(document);
        }
    });
})


//POST loescht ein Fachbereich
router.post('/deleteFachbereich', function (req, res) {
    var db = req.db;
    var document = req.body;
    db.collection('fachbereiche').remove(document, function (err, result) {
        if (err) {
            JL().fatal(err);
        } else {
            JL().info("Fachbereich geloescht");
            res.send(document);
        }
    });
})


////POST
//router.post('/deleteInstituteInFachbereich', function (req, res) {
//    var db = req.db;
//    var document = req.body;
//    db.collection('institute').remove(document, function (err, result) {
//        if (err) {

//        } else {
//            res.send(document);
//        }
//    });
//})


//POST selektiert ein Institut aus der DB
router.post('/findInstitut', function (req, res) {
    var db = req.db;
    var document = req.body;
    var collection = db.get('institute');
    collection.find(document, {}, function (e, docs) {
        if (e) JL().fatal(e); else {
            res.send(docs);
        }
    });
})


//POST selektiert ein Fachbereich aus der DB
router.post('/findFachbereich', function (req, res) {
    var db = req.db;
    var document = req.body;
    var collection = db.get('fachbereiche');
    collection.find(document, {}, function (e, docs) {
        if (e) JL().fatal(e); else {
            res.send(docs);
        }
    });
})


//POST selektiert ein Route aus der DB
router.post('/findRoute', function (req, res) {
    var db = req.db;
    var document = req.body;
    var collection = db.get('routen');
    collection.find(document, {}, function (e, docs) {
        if (e) JL().fatal(e); else {
            res.send(docs);
        }
    });
})


//POST loescht eine Route
router.post('/deleteRoute', function (req, res) {
    var db = req.db;
    var document = req.body;
    var collection = db.get('routen');
    collection.remove(document, function (err, obj) {
        if (err) JL().fatal(err); else {
            JL().debug(document);
            res.send(obj);
            db.close();
        }
    });
})



module.exports = router;