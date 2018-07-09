var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/impressum', function (req, res) {
    res.render('impressum', { title: 'Impressum' });
})

router.get('/mappage', function (req, res) {
    res.render('mappage', { title: 'Mappage' });
})

/* POST to GeoJson Service */
router.post('/GeoJson', function (req, res) {
    // Set our internal DB variable
    var db = req.db;
    // Get our form values. These rely on the "name" attributes
    var GeoObject = JSON.parse( req.body.geoJSON);
    console.log(GeoObject);
    var GeoName = req.body.name;
    // Set our collection
    var collection = db.get("GeoCollection");
    // Submit to the DB
    collection.insert({
        "GeoJsonName": GeoName,
        "GeoObject": GeoObject,
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            //JL("mylogger").info("erfolgreich zur Datenbank hinzugefügt!");
            res.redirect("mappage");
        }
    });
});

/* GET Geo Data. */
router.get('/addToMap', function (req, res) {
    var db = req.db;
    var collection = db.get('GeoCollection');
    console.log(req.query.name);
    var layerName = req.query.name;
    collection.find({ GeoJsonName: layerName }, {}, function (e, docs) {
        console.log(docs);
        res.send(docs);
    });
});


module.exports = router;