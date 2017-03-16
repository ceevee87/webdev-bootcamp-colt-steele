
var express    = require('express'),
    validUrl   = require('valid-url'),
    myUtilsFns = require('../util/myutils'),
    router     = express.Router();

var ensureAuthenticated = myUtilsFns.ensureAuthenticated;

var Campground = require('../models/campground.model');

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
// INDEX route
router.get('/', function(req, res) {
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
router.get('/new', ensureAuthenticated, function(req, res) {
    res.render("campground.new.ejs");    
});

// CREATE route
router.post('/', ensureAuthenticated, function(req,res) {
    var cgname = req.body.cgname;
    var cgurl  = req.body.cgurl;
    var cgdesc = req.body.cgdesc;
    // add in new entry to campgrounds array assuming the input was valid.
    if (validUrl.isWebUri(cgurl)){
        var newAuthor = { id: req.user._id, username: req.user.username}
        var newCampground = {
            name: cgname, 
            image: cgurl, 
            description: cgdesc, 
            author: newAuthor
        };
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
router.get('/:id', function(req, res) {
    Campground.findById(req.params.id).populate('comments').exec(function(err, campground) {
        if (err) {
            console.log("app.get-campground/id, err: " + err);
        } else {
            res.render('campground.show.ejs', {campground: campground});
        }
    });
});

module.exports = router;
