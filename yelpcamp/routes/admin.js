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


router.get('/comments/admin/cruser', function(req, res) {
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

router.get('/campgrounds/admin/dump2db', function(req, res) {
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

router.get('/comments/admin/dump2db', function(req, res) {
    Comment.find({}, { __v: 0}, function(err, comments) {
        if (err) {
            console.log("Couldn't fetch comments from DB!!")
            console.log(err);
        } else {
            comments.forEach(function(comment) {
                var xx = new Date().getTime() - 1000*getRandomInt(50000, 16*86400);
                var cm2 = {
                    "_id" : new mongoose.mongo.ObjectID(comment._id),
                    "text": comment.text,
                    "createdAt" : new Date(xx),
                    "author": {
                        "id" : new mongoose.mongo.ObjectID(comment.author.id),
                        "username" : comment.author.username
                    }
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
