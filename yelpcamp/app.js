
var app        = require('./config/express')(),
    validUrl   = require('valid-url'),
    config     = require('./config/env/yelpcamp.config');

// MONGOOSE STUFF
var mongoose   = require('./config/mongoose')();
var Campground = require('./models/campground.model');
var Comment    = require('./models/comment.model');

// Initial DB with seed database
var seedDB = require("./seed_db");
seedDB();


// Summary of RESTful routes
//
// name                         HTTP Verb
// ==========================================================================
// INDEX   /campgrounds           GET
// NEW     /campgrounds/new       GET
// CREATE  /campgrounds           POST
// SHOW    /campgrounds/:id       GET
// EDIT    /campgrounds/:id/edit  GET
// UPDATE  /campgrounds/:id       PUT
// DESTROY /campgrounds/:id       DELETE
//
//
app.get('/', function(req, res) {
    res.render('landing');
});

// INDEX route
app.get('/campgrounds', function(req, res) {
    Campground.find({}, function(err, campgrounds) {
        if (err) {
            console.log("Couldn't fetch campgrounds from DB!!")
            console.log(err);
        } else {
            res.render('campground.index.ejs', { campgrounds: campgrounds});
        }
    });
});

// NEW route
app.get('/campgrounds/new', function(req, res) {
    res.render("campground.new.ejs");    
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

// SHOW route
app.get('/campgrounds/:id', function(req, res) {
    Campground.findById(req.params.id).populate('comments').exec(function(err, campground) {
        if (err) {
            console.log("app.get-campground/id, err: " + err);
        } else {
            res.render('campground.show.ejs', {campground: campground});
        }
    });
});

// ===============================================
// ******       COMMENTS ROUTES          *********
// ===============================================
// RESTful routes for campground comments
// NEW     /campgrounds/:id/comments/new  GET
// CREATE  /campgrounds/:id/comments      POST

app.get('/campgrounds/:id/comments/new', function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if (err) {
            console.error("/campground/:id/comments/new - could not findById: "+err);
        } else {
            res.render('comment.new.ejs', {campground: campground});
        }
    });
});

app.post('/campgrounds/:id/comments', function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if (err) {
            console.error("/campground/:id/comments - could not findById: "+err);
            res.redirect('/');
        } else {
            Comment.create(req.body.comment, function(err2, _comment) {
                if (err2) {
                    console.error("Couldn't create Comment.");
                } else {
                    campground.comments.push(_comment._id);
                    campground.save();
                }
            });
            res.redirect('/campgrounds/' + campground._id);
        }
    });
});

app.listen(config.port, config.ip, function() {
   console.log("YelpCamp server starting up... " + config.ip); 
});
