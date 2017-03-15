var express = require('express'),
    router  = express.Router({mergeParams:true});

var Campground = require('../models/campground.model');
var Comment    = require('../models/comment.model');

// ===============================================
// ******       COMMENTS ROUTES          *********
// ===============================================
// RESTful routes for campground comments
// NEW     /campgrounds/:id/comments/new  GET
// CREATE  /campgrounds/:id/comments      POST

// comments NEW
router.get('/new', function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if (err) {
            console.error("/campground/:id/comments/new - could not findById: "+err);
        } else {
            res.render('comment.new.ejs', {campground: campground});
        }
    });
});

// comments CREATE
router.post('/', function(req, res) {
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

module.exports = router;