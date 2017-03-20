var express    = require('express'),
    auth       = require('../middlewares/auth'),
    router     = express.Router();

var mongoose = require('mongoose');

var ensureAuthenticated   = auth.ensureAuthenticated,
    checkCommentOwnership = auth.checkCommentOwnership;

var Campground = require('../models/campground.model');
var Comment    = require('../models/comment.model');

// made up schema for testing purposes
var farmSchema = mongoose.Schema({
    name:        String,
    price:       String,
    image:       String,
    description: String,
    author: { id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
            username: String },
    comments:    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'Comment'
        }]
});
var Farm = mongoose.model('farm', farmSchema);


router.get('/campgrounds/admin/dump', function(req, res) {
    Campground.find({}, { _id: 0, __v: 0}, function(err, campgrounds) {
        if (err) {
            console.log("Couldn't fetch campgrounds from DB!!")
            console.log(err);
        } else {
            campgrounds.forEach(function(campground) {
                var cg2 = {
                    "name": campground.name,
                    "price": campground.price,
                    "image": campground.image,
                    "description": campground.description,
                    "comments": [],
                    "author": {
                        "id": new mongoose.mongo.ObjectID(campground.author.id),
                        "username": campground.author.username
                    }
                };

                campground.comments.forEach(function(cm){
                    cg2.comments.push(new mongoose.mongo.ObjectID(cm));
                });

                console.log(JSON.stringify(cg2,null,'\t'));
                Farm.create(cg2, function(err, farm) {
                    if (err) {
                        console.log("Shit's gone totally haywire!!\n"+err.message);
                    } else {
                        console.log("Created new farm!");
                        console.log(JSON.stringify(farm,null,'\t'));
                    }
                });
            });
            res.render('campground.index.ejs', { campgrounds: campgrounds});
        }
    });
});

module.exports = router;
