var mongoose = require('mongoose');
var Campground = require('./models/campground.model');

var seedData = require('./seed_camps');
function initDBwithCampgrounds() {
    Campground.remove({}, function(err, rmResult) {
        if (err) {
            console.log(err);
        } else {
            console.log("Removed " + rmResult.result.n + " campgrounds from the DB.");
            seedData.campsData.forEach(function(item) {
                Campground.create(item, function(err, campground) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Created new campground!");
                        console.log(campground);
                    }
                });
            });
        }
    });
}

module.exports = initDBwithCampgrounds;
