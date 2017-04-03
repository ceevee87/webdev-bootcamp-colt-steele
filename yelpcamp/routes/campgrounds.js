
var express    = require('express'),
    validUrl   = require('valid-url'),
    auth       = require('../middlewares/auth'),
    router     = express.Router();

var ensureAuthenticated      = auth.ensureAuthenticated,
    checkCampgroundOwnership = auth.checkCampgroundOwnership;

var Campground = require('../models/campground.model');
var Comment    = require('../models/comment.model');

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
    // add in new entry to campgrounds array assuming the input was valid.
    if (validUrl.isWebUri(req.body.campground.image)){
        var newCampground = req.body.campground;
        newCampground.createdAt = new Date();
        var newAuthor = { id: req.user._id, username: req.user.username}
        newCampground.author = newAuthor;
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
router.get('/:id/edit', checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            req.flash("error", "could not find campground by id: "+ err.message);
            res.redirect('/campgrounds')
        } else {
            res.render('campground.edit.ejs', {campground: campground});
        }; 
    });
});

// UPDATE route
router.put('/:id', checkCampgroundOwnership, function(req, res) {
    var redirectPage = "/campgrounds";
    if (validUrl.isWebUri(req.body.campground.image)){
        var newCampground = req.body.campground;
        newCampground.createdAt = new Date();
        Campground.findByIdAndUpdate(req.params.id, newCampground, function(err, campground) {
            if (err) {
                req.flash("error", "Could not find/update campground: "+ err.message);
            } else {
                // console.log("Updated campground!\n"+campground);
                redirectPage += "/" + req.params.id;
            }
            res.redirect(redirectPage);                
        });
    } else {
        req.flash("error", "The campground URL looks wrong. Please try again.\n "+
                    newCampground.image);
        res.redirect(redirectPage);                
    }
});

// DELETE route
router.delete('/:id', checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err, campground) {
        if (err) {
            req.flash("error", "could not remove campground: "+ err.message);
            res.redirect('/campgrounds')
        } else {
            Comment.remove({_id: {$in: campground.comments}}, function(err2, comments) {
                if (err2) {
                    req.flash("error", "could not remove comments: "+ err2.message);
                } else {
                    res.redirect('/campgrounds')
                }
            });
        }
    });
});

module.exports = router;
