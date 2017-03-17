
var express    = require('express'),
    validUrl   = require('valid-url'),
    auth       = require('../middlewares/auth'),
    router     = express.Router();

var ensureAuthenticated = auth.ensureAuthenticated;

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
        // We're saving this stuff in a database (MongoDB).
        Campground.create(newCampground, function(err, campground) {
            if (err) {
                console.log(err);
            } else {
                console.log("Created new campground!");
                console.log(campground);
            }
        });        
    } else {
        req.flash("error", "The campground URL looks wrong. NOT accepting new campground.");
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

// EDIT route
router.get('/:id/edit', function(req, res) {
    // let's just find out if the user is even logged in before
    // we start doing any updates
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to be logged in before editing a campground.");
        res.redirect('/campgrounds/' + req.params.id);
    } else {
        Campground.findById(req.params.id).populate('comments').exec(function(err, campground) {
            if (err) {
                req.flash("error", "could not find campground by id: "+ err.message);
                res.redirect('/campgrounds')
            } else if (!campground.author.id || (campground.author.id && 
                        campground.author.id.equals(req.user._id))) {
                // we should only be allowing owners of the campground to
                // make edits. what about a strange state where no owner
                // is defined? This is definitely possible in early dev rounds
                // during testing. 
                // in this case, let the first editor "claim" the campground.
                if (!campground.author.id) {
                    campground.author.id = req.user._id;
                    campground.author.username = req.user.username;
                    campground.save();
                }
                res.render('campground.edit.ejs', {campground: campground});
            } else {
                req.flash("error", 
                "You are not authorized to edit this campground.<" + req.user.username +">");
                res.redirect('/campgrounds/' + req.params.id);
            }
        });
    }
});

// UPDATE route
router.put('/:id', function(req, res) {
    var redirectPage = "/campgrounds";
    if (validUrl.isWebUri(req.body.campground.image)){
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground) {
            if (err) {
                req.flash("error", "Could not find/update campground: "+ err.message);
            } else {
                // console.log("Updated campground!\n"+campground);
                redirectPage += "/" + req.params.id;
            }
        });
    } else {
        req.flash("error", "The campground URL looks wrong. Please try again.\n "+
                    req.body.campground.image);
    }
    res.redirect(redirectPage);                
});

// DELETE route
router.delete('/:id', function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err, campground) {
        if (err) {
            req.flash("error", "could not remove campground: "+ err.message);
        } 
        res.redirect('/campgrounds')
    });
});

module.exports = router;
