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
    createdAt: { type: Date, default: Date.now },
    author: { id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
            username: String },
    comments:    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'Comment'
        }]
});
var Farm = mongoose.model('farm', farmSchema);


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

router.get('/campgrounds/admin/dump', function(req, res) {
    Campground.find({}, { _id: 0, __v: 0}, function(err, campgrounds) {
        if (err) {
            console.log("Couldn't fetch campgrounds from DB!!")
            console.log(err);
        } else {
            campgrounds.forEach(function(campground) {
                var xx = new Date().getTime() - 1000*getRandomInt(10000, 12*86400);
                var cg2 = {
                    "name": campground.name,
                    "price": campground.price,
                    "image": campground.image,
                    "description": campground.description,
                    "createdAt" : new Date(xx),
                    "comments": [],
                    "author": {
                        "id": new mongoose.mongo.ObjectID(campground.author.id),
                        "username": campground.author.username
                    }
                };

                campground.comments.forEach(function(cm){
                    cg2.comments.push(new mongoose.mongo.ObjectID(cm));
                });
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


var remarkSchema = mongoose.Schema(
    {
        text  : String,
        createdAt : { type: Date, default: Date.now },
        author: { id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
                username: String }
    }
);
var Remark = mongoose.model('Remark', remarkSchema);

router.get('/comments/admin/dump', function(req, res) {
    Comment.find({}, { _id: 0, __v: 0}, function(err, comments) {
        if (err) {
            console.log("Couldn't fetch comments from DB!!")
            console.log(err);
        } else {
            comments.forEach(function(comment) {
                var xx = new Date().getTime() - 1000*getRandomInt(50000, 16*86400); 
                var cm2 = {
                    "text": comment.text,
                    "createdAt" : new Date(xx),
                    "author": new mongoose.mongo.ObjectID(comment.author.id),
                };
                // console.log(JSON.stringify(cm2, null, '\t'));

                Remark.create(cm2, function(err, remark) {
                    if (err) {
                        console.log("Shit's gone totally haywire!!\n"+err.message);
                    } else {
                        console.log("Created new remark!");
                        console.log(JSON.stringify(remark, null,'\t'));
                    }
                });
            });
            res.redirect('/campgrounds');
        }
    });
});

module.exports = router;
