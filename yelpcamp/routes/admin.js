var express    = require('express'),
    auth       = require('../middlewares/auth'),
    fs         = require('fs'),
    router     = express.Router();

var mongoose = require('mongoose');
var async      = require('async');

var ensureAuthenticated   = auth.ensureAuthenticated,
    checkCommentOwnership = auth.checkCommentOwnership;

var Campground = require('../models/campground.model');
var Comment    = require('../models/comment.model');
var User       = require('../models/user.model');
var passport = require('../config/passport')();

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}


router.get('/campgrounds/admin/dump', function(req, res) {
    var fname = './campgrounds.json';
    Campground.find({}, { _id: 0, __v: 0, 'author.id': 0})
    .populate('comments', {_id:0, __v:0, 'author.id' : 0 })
    .exec(function(err, campgrounds) {
        if (err) {
            console.log("Couldn't fetch campgrounds from DB!!")
        } else {
            fs.writeFileSync(fname, JSON.stringify(campgrounds,null,'\t'));
        }
        res.redirect('/campgrounds');
    });
});

router.get('/campgrounds/admin/dumpusers', function(req, res) {
    var fname = './users.json';
    User.find({}, { salt: 0, hash:0, __v:0, _id:0 }, function(err, users) {
        if (err) {
            console.log("Couldn't fetch users from DB!!")
        } else {
            fs.writeFileSync(fname, JSON.stringify(users,null,'\t'));
        }
        res.redirect('/campgrounds');
    });
});


router.get('/comments/admin/crusers', function(req, res) {
    var fname   = './users.json';
    fs.readFile(fname, 'utf-8', function(err, data) {
        if (err) {
            console.error(">>>>>>>>>>>>>>> YIKES!!!! ERROR!!! <<<<<<<<<<<<<<< ");
        } else {
            // console.log("Data from file:\n", data);
            var obj = JSON.parse(data);
            console.log("Number of users = "+obj.length);
            Object.getOwnPropertyNames(obj).sort().forEach(
                function (val, idx, array) {
                    if (!isNaN(val)) { 
                        var username = obj[val].username;
                        console.log("username = " + username);
                        var newUser = new User({username: username});
                        var passWord = 'ubuntu';
                        User.register(newUser, passWord, function(err, user){
                            if (err) {
                                req.flash("error", "Could not register new user: "+err.message);
                                res.redirect('/register');
                            } else {
                                console.log("Created new user: "+user);
                                // req.flash("success", "Created new user: "+newUser);
                                // res.redirect('/campgrounds');
                            }
                        });
                    }
                }
            );
            res.redirect('/campgrounds');            
        }
    });
});


router.get('/comments/admin/crdb', function(req, res) {
    var fname   = './campgrounds.json';
    User.find({}, {username : 1, _id : 1}, function(err, users) {
        if (err) {
            console.error(">>>>>>>>>>>>>>> USER LOOKUP ERROR <<<<<<<<<<<<<<< ");
        } else {
            var authors = {};
            users.forEach(function(u){
                authors[u.username] = {
                    id : mongoose.mongo.ObjectID(u._id),
                    username: u.username
                }
            });
            fs.readFile(fname, 'utf-8', function(err, data) {
                if (err) {
                    console.error(">>>>>>>>>>>>>>> YIKES!!!! ERROR!!! <<<<<<<<<<<<<<< ");
                } else {
                    // console.log("Data from file:\n", data);
                    var obj = JSON.parse(data);
                    console.log("Number of campgrounds = "+obj.length);
                    Object.getOwnPropertyNames(obj).sort().forEach(
                        function (val, idx, array) {
                            if (isNaN(val)) { return; } 
                            var campground = obj[val];

                            if (!campground.author || !campground.author.username 
                                || !authors[campground.author.username]) { return ; }

                            // console.log("campground author = " + 
                            //     JSON.stringify(authors[campground.author.username]));
                            
                            var newCg = {
                                name : campground.name,
                                price : campground.price,
                                image: campground.image,
                                description : campground.description,
                                comments : [],
                                author : authors[campground.author.username],
                                createdAt : campground.createdAt
                            };

                            campground.comments.forEach(function(comment){
                                if (!comment.author || !comment.author.username) { return ; }
                                if (authors[comment.author.username]) {
                                    var newComm = {
                                        _id : mongoose.mongo.ObjectID(),
                                        text : comment.text,
                                        createdAt : comment.createdAt,
                                        author: authors[comment.author.username]
                                    };
                                    var commList = [];
                                    Comment.create(newComm, function(err, _comment) {
                                        if (err) {
                                            // do nothing
                                        }
                                    });

                                    newCg.comments.push(newComm._id);
                                }
                            });
                            // console.log("NEW CAMPGROUND TO CREATE: " + JSON.stringify(newCg,null,'\t') + '\n');
                            Campground.create(newCg, function(err, newcampground) {
                                if (err) {
                                    console.error(">>>>>####### WHOOOOPS !!! ########## <<<<<<<<<<<");
                                } else {
                                    console.log("created new cg: "+newcampground+'\n');
                                }
                            });
                        }
                    );
                    res.redirect('/campgrounds');            
                }
            });
        }
    });
});


module.exports = router;
