
var app        = require('./config/express')(),
    validUrl   = require('valid-url'),
    config     = require('./config/env/yelpcamp.config');

// MONGOOSE STUFF
var mongoose   = require('./config/mongoose')();
var Campground = require('./models/campground.model');

// Initial DB with seed database
var seedDB = require("./seed_db");
seedDB();

app.get('/', function(req, res) {
    res.render('landing');
});

// NEW route
app.get('/campgrounds/new', function(req, res) {
    res.render("new");    
});

// INDEX route
app.get('/campgrounds', function(req, res) {
    Campground.find({}, function(err, campgrounds) {
        if (err) {
            console.log("Couldn't fetch campgrounds from DB!!")
            console.log(err);
        } else {
            res.render('campgrounds', { campgrounds: campgrounds});
        }
    });
});

// SHOW route
app.get('/campgrounds/:id', function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log("app.get-campground/id, err: " + err);
        } else {
            res.render('campground.details.ejs', {campground: campground});
        }
    })
});

// CREATE route
app.post('/campgrounds', function(req,res) {
    var cgname = req.body.cgname;
    var cgurl  = req.body.cgurl;
    var cgdesc = req.body.cgdesc;
    // add in new entry to campgrounds array assuming the input was valid.
    if (validUrl.isWebUri(cgurl)){
        console.log("New campground! : " + cgname + " : " + cgurl);
        var newCampground = {name: cgname, image: cgurl, description: cgdesc};

        // We're savning this stuff in a database (MongoDB).
        Campground.create(newCampground, function(err, campground) {
            if (err) {
                console.log(err);
            } else {
                console.log("Created new campground!");
                console.log(campground);
            }
        });        
    } else {
        console.log('The campgroung URL looks wrong. NOT accepting new campground.');
    }
    res.redirect('/campgrounds');
});
 
app.listen(config.port, config.ip, function() {
   console.log("YelpCamp server starting up... " + config.ip); 
});
