var mongoose = require('mongoose');
var Campground = require('./models/campground.model');
var Comment    = require('./models/comment.model');
var async      = require('async');

var seedData = require('./seed_data');

function rmCampgroundsFromDB(callback) {
    Campground.remove({}, function(err, rmResult) {
        callback(err, {item: "campgrounds removed: " + rmResult.result.n});
    });
}

function rmCommentsFromDB(callback) {
    Comment.remove({}, function(err, rmResult) { 
        callback(err, {item: "comments removed: " + rmResult.result.n}); 
    });
}

function addCampgroundData(callback) {
    var ii = 0;
    var dbOps = 0;
    async.eachSeries(seedData.campsData, function(item, cb){
        Campground.create(item, function(err, campground) {
            if (err) {
                cb(err);
            } else {
                Comment.create({
                    text: seedData.campsComments[ii++],
                    author: "Homer"
                }, function(err2, _comment) {
                    if (err2) {
                        console.error("Couldn't create Comment.");
                        cb(err2);
                    } else {
                        campground.comments.push(_comment._id);
                        campground.save();
                        // console.log("(" + ii + ") Created new campground!");
                        // console.log(_comment);
                    }
                });
            }
        });
        cb(null);
        dbOps++;
    }, function(err){
            if (err) {
                console.error("All messed up!!!")
            } else {
                console.log("All done processing campgrounds and comments.");
            }
        });
    // scoping for ii results in ii below always being 0. I added
    // a new variable to deal with this.
    callback(null, {item: "comments/campgrounds created: " + dbOps});
}

function initDBwithCampgrounds() {
    async.series([rmCampgroundsFromDB, rmCommentsFromDB, addCampgroundData], function(err, results){
        if (err) {
            console.error("async series final error: "+err);
        }
        results.forEach(function(res){
            console.log(res.item);
            // console.log("async series result: "+ JSON.stringify(res,null,'\t'));
        })
    });
}

module.exports = initDBwithCampgrounds;
