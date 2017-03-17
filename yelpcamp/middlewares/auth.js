
Campground = require("../models/campground.model");

function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("info","You must be logged in to see this page.");
        res.redirect('/login');
    }
}

function checkCampgroundOwnership(req, res, next) {
    // let's just find out if the user is even logged in before
    // we start doing any updates
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to be logged in before editing a campground.");
        res.redirect("back");
    } else {
        Campground.findById(req.params.id, function(err, campground) {
            if (err) {
                req.flash("error", "Could not find campground by id: "+ err.message);
                res.redirect("back");
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
                next();
            } else {
                req.flash("error", 
                "You are not authorized to edit this campground.<" + req.user.username +">");
                res.redirect("back");
            }
        });
    }    
}

module.exports = { ensureAuthenticated, checkCampgroundOwnership }
