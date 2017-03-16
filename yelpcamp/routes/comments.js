var express    = require('express'),
    myUtilsFns = require('../util/myutils'),
    router     = express.Router({mergeParams:true});

var ensureAuthenticated = myUtilsFns.ensureAuthenticated;

var Campground = require('../models/campground.model');
var Comment    = require('../models/comment.model');

// ===============================================
// ******       COMMENTS ROUTES          *********
// ===============================================
// RESTful routes for campground comments
// NEW     /campgrounds/:id/comments/new  GET
// CREATE  /campgrounds/:id/comments      POST

// comments NEW
router.get('/new', ensureAuthenticated, function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if (err) {
            console.error("/campground/:id/comments/new - could not findById: "+err);
        } else {
            res.render('comment.new.ejs', {campground: campground});
        }
    });
});

// comments CREATE
router.post('/', ensureAuthenticated, function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if (err) {
            console.error("/campground/:id/comments - could not findById: "+err);
            res.redirect('/');
        } else {
            var newComment             = new Comment();
            newComment.text            = req.body.comment.text;
            newComment.author.id       = req.user._id;
            newComment.author.username = req.user.username;
            Comment.create(newComment, function(err2, _comment) {
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

// function ensureAuthenticated(req, res, next){
//     if (req.isAuthenticated()) {
//         next();
//     } else {
//         req.flash("info","You must be logged in to see this page.");
//         res.redirect('/login');
//     }
// }

module.exports = router;