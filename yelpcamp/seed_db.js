var mongoose = require('mongoose');
var Campground = require('./models/campground.model');
var Comment    = require('./models/comment.model');

var seedData = require('./seed_data');
function initDBwithCampgrounds() {
    Campground.remove({}, function(err, rmResult) {
        if (err) {
            console.log(err);
        } else {
            console.log("Removed " + rmResult.result.n + " campgrounds from the DB.");
            var ii = 0;
            seedData.campsData.forEach(function(item) {
                Campground.create(item, function(err, campground) {
                    if (err) {
                        console.log(err);
                    } else {
                        Comment.create({
                            text: seedData.campsComments[ii++],
                            author: "Homer"
                        }, function(err, _comment) {
                            if (err) {
                                console.error("Couldn't create Comment.");
                            } else {
                                campground.comments.push(_comment._id);
                                campground.save();
                                console.log("(" + ii + ") Created new campground!");
                                console.log(_comment);
                            }
                        });
                    }
                });
            });
        }
    });
}

module.exports = initDBwithCampgrounds;
