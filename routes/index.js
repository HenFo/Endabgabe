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
    res.render('createFachbereich', { title: 'Bearbeite ein Fachbereich' });
})

router.get('/editInstitut/institute', function (req, res) {
    res.render('createInstitut', { title: 'Bearbeite ein Institut' });
})

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
    var type = document.ObjectType;
    var data = JSON.parse(document.data);
    document = { "ObjectType": type, "data": data };
    db.collection('institute').insert(document, function (err, result) {
        if (err) {
            JL().debug(err);
        } else {
            res.send(document);
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

router.post('/addRoute', function (req, res) {
    var db = req.db;
    var document = req.body;
    db.collection('routen').insert(document, function (err, result) {
        if (err) {

        } else {
            res.send(document);
        }
    });
})

router.post('/findInstitut', function (req, res) {
    var db = req.db;
    var document = req.body;
    var hInst = document.name;
    var collection = db.get('institute');
    collection.find({ hInst }, {}, function (e, docs) {
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
    var hRoute = document.name;
    var collection = db.get('routen');
    collection.find({ hRoute }, {}, function (e, docs) {
        if (e) JL().fatal(e); else {
            res.send(docs);
        }
    });
})



module.exports = router;