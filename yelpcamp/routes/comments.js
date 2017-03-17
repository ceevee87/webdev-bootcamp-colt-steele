var express    = require('express'),
    auth       = require('../middlewares/auth'),
    router     = express.Router({mergeParams:true});

var ensureAuthenticated   = auth.ensureAuthenticated,
    checkCommentOwnership = auth.checkCommentOwnership;

var Campground = require('../models/campground.model');
var Comment    = require('../models/comment.model');

// ===============================================
// ******       COMMENTS ROUTES          *********
// ===============================================
// RESTful routes for campground comments
// NEW     /campgrounds/:id/comments/new  GET
// CREATE  /campgrounds/:id/comments      POST

// INDEX    N/A
// SHOW     N/A
 
// EDIT    /campgrounds/:id/comments/:comment_id/edit
// UPDATE  /campgrounds/:id/comments/:comment_id
// DESTROY /campgrounds/:id/comments/:comment_id


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

// comments CREATE (post)
router.post('/', ensureAuthenticated, function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if (err) {
            req.flash("error", "Could not find campground with id: "+req.params.id);        
            res.redirect('/');
        } else {
            var newComment             = new Comment();
            newComment.text            = req.body.comment.text;
            newComment.author.id       = req.user._id;
            newComment.author.username = req.user.username;
            Comment.create(newComment, function(err2, _comment) {
                if (err2) {
                    req.flash("error", "Could not create new comment: "+err2);        
                } else {
                    campground.comments.push(_comment._id);
                    campground.save();
                }
            });
            res.redirect('/campgrounds/' + campground._id);
        }
    });
});

// comments EDIT 
router.get('/:comment_id/edit', checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, comment){
        if (err) {
            req.flash("error", "Could not find comment: "+err.message);
            console.error("lookup comment: could not findById: "+err);
        } else {
            res.render('comment.edit.ejs', {campground_id: req.params.id, comment: comment});
        }
    });
});

// comments UPDATE (post)
router.put('/:comment_id', checkCommentOwnership, function(req, res) {
    // res.send("Caught update comment route. Updated comment = \n"+JSON.stringify(req.body.comment));
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, resComment){
        if (err) {
            req.flash("error", "Could not update comment: "+err.message);
        } 
        res.redirect('/campgrounds/' + req.params.id);
    });
});

// comments DESTOY (delete)
router.delete('/:comment_id', checkCommentOwnership, function(req, res) {
    // ugh. this initial version removes the comment from the 
    // comments collection. but, what about references to this comment 
    // in the campgrounds collection? Each collection contains an array 
    // of comments and one of the campgrounds will have the following comment
    // in its comment array.
    // I'll come back to this later and deal with removing it.
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if (err) {
            req.flash("error", "Could not remove comment: "+err.message);
        } 
        res.redirect('/campgrounds/' + req.params.id);
    });
});

module.exports = router;