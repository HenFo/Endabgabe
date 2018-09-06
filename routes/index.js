var express = require('express');
var router = express.Router();

var JL = require('jsnlog').JL;
var jsnlog_nodejs = require('jsnlog-nodejs').jsnlog_nodejs;

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Karte der WWU' });
});

router.get('/Mensen/index', function (req, res) {
    res.render('Mensen', { title: 'Mensen in Muenster' });
})

router.get('/fachbereich/index', function (req, res) {
    var db = req.db;
    var collection = db.get("fachbereiche");
    collection.find({}, {}, function (e, docs) {
        res.render('fachbereich', { title: 'Fachbereiche', "fachbereiche": docs });
    })
})

router.get('/institute/index', function (req, res) {
    res.render('institute', { title: 'Institute' });
})

router.get('/editMap/index', function (req, res) {
    res.render('editMap', { title: 'Karte bearbeiten' });
})

router.get('/createFachbereich/fachbereich', function (req, res) {
    res.render('createFachbereich', { title: 'Erstelle ein Fachbereich' });
})

router.get('/createInstitut/institute', function (req, res) {
    var db = req.db;
    var collection = db.get('fachbereiche');
    collection.find({}, {}, function (e, docs) {
        if (e) { res.render('createInstitut', { title: 'Erstelle ein Institut' }); } else {
            res.render('createInstitut', { title: 'Erstelle ein Institut', "fachbereiche": docs });
        }
    });

})

router.get('/editFachbereich/fachbereich', function (req, res) {
    res.render('editFachbereich', { title: 'Bearbeite ein Fachbereich' });
})

router.get('/editInstitut/institute', function (req, res) {
    var db = req.db;
    var collection = db.get('fachbereiche');
    collection.find({}, {}, function (e, docs) {
        if (e) { res.render('editInstitut', { title: 'Bearbeite ein Institut' }); } else {
            res.render('editInstitut', { title: 'Bearbeite ein Institut', "fachbereiche": docs });
        }
    });})

router.get('/getAllFachbereiche', function (req, res) {
    var db = req.db;
    var collection = db.get('fachbereiche');
    collection.find({}, {}, function (e, docs) {
        res.send(docs);
    });
})

router.get('/getAllInstitutes', function (req, res) {
    var db = req.db;
    var collection = db.get('institute');
    collection.find({}, {}, function (e, docs) {
        res.send(docs);
    });
})

router.get('/getAllRoutes', function (req, res) {
    var db = req.db;
    var collection = db.get('routen');
    collection.find({}, {}, function (e, docs) {
        res.send(docs);
    });
})

router.post('/addFachbereich', function (req, res) {
    var db = req.db;
    var document = req.body;
    db.collection('fachbereiche').insert(document, function (err, result) {
        if (err) {

        } else {
            res.send(document);
        }
    });
})

router.post('/addInstitut', function (req, res) {
    var db = req.db;
    var document = req.body;
    var ID = document.ObjectID;
    var data = JSON.parse(document.data);
    document = { "ObjectID": ID, "data": data };
    db.collection('institute').insert(document, function (err, result) {
        if (err) {
            JL().debug(err);
        } else {
            res.send(document);
        }
    });
})

router.post('/saveInstitut', function (req, res) {
    var db = req.db;
    var document = req.body;;
    var ID = document.ObjectID;
    var data = JSON.parse(document.data);
    db.collection('institute').update({ "ObjectID": ID }, {
        $set: { "ObjectID": ID, "data": data }} , function (err, result) {
        if (err) {
            JL().debug(err);
        } else {
            res.send(result);
        }
    });
})

router.post('/addInstitutInFachbereich', function (req, res) {
    var db = req.db;
    var document = req.body;
    var data = JSON.parse(document.data).features[0].properties;
    JL().debug("1");
    JL().debug(data);
    var hFachbereich = data.fachbereich;
    JL().debug("2");
    JL().debug(hFachbereich);
    db.collection('fachbereiche').find({ "abkuerzung": hFachbereich }, {}, function (e, docs) {
        if (e) { JL().debug(e); } else {
            JL().debug("3");
            JL().debug(docs[0]);
            if (typeof docs[0].institute !== "undefined") {
                var institute = docs[0].institute;
            } else {
                var institute = [];
            }
            JL().debug("4");
            JL().debug(institute);
            institute.push(data);
            JL().debug(institute);
            db.collection('fachbereiche').update({ "abkuerzung": hFachbereich }, {
                $set: { "institute": institute }, function(err, result) {
                    if (err) {
                        JL().debug("4.5");
                        JL().debug(err);
                    } else {
                        JL().debug("5");
                        res.send(result);
                    }
                }
            });
            res.send(docs);
        }
    });
})

router.post('/saveInstitutInFachbereich', function (req, res) {
    var db = req.db;
    var document = req.body;
    var data = JSON.parse(document.data).features[0].properties;
    var hFachbereich = data.fachbereich;
    db.collection('fachbereiche').find({ "abkuerzung": hFachbereich }, {}, function (e, docs) {
        if (e) { JL().debug(e); } else {
            JL().debug("3");
            JL().debug(docs[0]);
            if (typeof docs[0].institute !== "undefined") {
                var institute = docs[0].institute;
            } else {
                var institute = [];
            }
            var i = 0, flag = false;
            while (i < institute.length && !flag) {
                flag = institute[i].name == data.name;
                i++
            }
            institute.splice(i - 1, 1, data);
            JL().debug("4");
            db.collection('fachbereiche').update({ "abkuerzung": hFachbereich }, {
                $set: { "institute": institute }, function(err, result) {
                    if (err) {
                        JL().debug("4.5");
                        JL().debug(err);
                    } else {
                        JL().debug("5");
                        res.send(result);
                    }
                }
            });
            res.send(docs);
        }
    });
})

router.post('/deleteInstitut', function (req, res) {
    var db = req.db;
    var document = req.body;
    JL().debug(document);
    db.collection('institute').remove(document, function (err, result) {
        if (err) {

        } else {
            res.send(document);
        }
    });
})

router.post('/deleteInstitutFromFachbereich', function (req, res) {
    var db = req.db;
    var document = req.body;
    db.collection('fachbereiche').find({ "abkuerzung": document.fachbereich }, {}, function (e, docs) {
        if (e) { JL().debug(e); } else {
            var i = 0, flag = false, institute = docs[0].institute;
            while (i < institute.length && !flag) {
                flag = institute[i].name == document.name;
                i++
            }
            institute.splice(i - 1, 1);
            db.collection('fachbereiche').update({ "abkuerzung": document.fachbereich }, {
                $set: { "institute": institute }, function(err, result) {
                    if (err) {
                        JL().debug(err);
                    } else {
                        res.send(result);
                    }
                }
            });
            res.send(docs);
        }
    });
})

router.post('/clearInstitut', function (req, res) {
    var db = req.db;
    db.collection('institute').remove({}, function (err, result) {
        if (err) {

        } else {
            res.send(result);
        }
    });
})

router.post('/clearFachbereiche', function (req, res) {
    var db = req.db;
    db.collection('fachbereiche').remove({}, function (err, result) {
        if (err) {

        } else {
            res.send(result);
        }
    });
})

router.post('/clearRouten', function (req, res) {
    var db = req.db;
    db.collection('routen').remove({}, function (err, result) {
        if (err) {

        } else {
            res.send(result);
        }
    });
})

router.post('/addRoute', function (req, res) {
    var db = req.db;
    var document = req.body;
    var ID = document.ObjectID;
    document = JSON.parse(document.data);
    JL().debug(document);
    db.collection('routen').insert({ "ObjectID": ID, "name":document.name, "start":document.start, "ziel":document.ziel }, function (err, result) {
        if (err) {

        } else {
            res.send(document);
        }
    });
})

router.post('/deleteRoute', function (req, res) {
    var db = req.db;
    var document = req.body;
    JL().debug(document);
    db.collection('routen').remove(document, function(err, result) {
        if (err) {

        } else {
            res.send(document);
        }
    });
})

router.post('/editRoute', function (req, res) {
    var db = req.db;
    var document = req.body;
    JL().debug(document);
    var ID = document.ObjectID;
    JL().debug(ID);
    document = JSON.parse(document.data);
    JL().debug(document);
    db.collection('routen').update({ "ObjectID": ID }, { $set: document }, function (err, result) {
        if (err) {

        } else {
            res.send(document);
        }
    });
})

router.post('/editFachbereich', function (req, res) {
    var db = req.db;
    var document = req.body;
    JL().debug(document);
    var ID = document.id;
    document = JSON.parse(document.object);
    JL().debug(document);
    db.collection('fachbereiche').update({ "abkuerzung": ID }, { $set: { "name": document.name, "webseite": document.webseite } }, function (err, result) {
        if (err) {

        } else {
            res.send(document);
        }
    });
})

router.post('/deleteFachbereich', function (req, res) {
    var db = req.db;
    var document = req.body;
    db.collection('fachbereiche').remove(document, function (err, result) {
        if (err) {

        } else {
            res.send(document);
        }
    });
})

router.post('/deleteInstituteInFachbereich', function (req, res) {
    var db = req.db;
    var document = req.body;
    db.collection('institute').remove(document, function (err, result) {
        if (err) {

        } else {
            res.send(document);
        }
    });
})

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

router.post('/findFachbereich', function (req, res) {
    var db = req.db;
    var document = req.body;
    JL().debug(document);
    var collection = db.get('fachbereiche');
    collection.find(document, {}, function (e, docs) {
        if (e) JL().fatal(e); else {
            JL().debug(docs);
            res.send(docs);
        }
    });
})

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