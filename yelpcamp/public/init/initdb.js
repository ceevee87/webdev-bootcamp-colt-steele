// MONGOOSE STUFF
var mongoose   = require('../../config/mongoose')();
var Campground = require('../../models/campground.model');
var Comment    = require('../../models/comment.model');
var User       = require('../../models/user.model');
var auth       = require('../../middlewares/auth');
var ensureAuthenticated   = auth.ensureAuthenticated,
    checkCommentOwnership = auth.checkCommentOwnership;

var fs         = require('fs'),
    async      = require('async');

var passport   = require('../../config/passport')(),
    session    = require('express-session');
session({
        secret: "great$%^divide!@890claymore12-+/]",
        resave: false,
        saveUninitialized: false
});
passport.initialize();
passport.session();

function crUsersAsync(callback) {
    var fname = './users.json';
    fs.readFile(fname, 'utf-8', function (err, data) {
        if (err) {
            console.error(">>>>>>>>>>>>>>> YIKES!!!! ERROR!!! <<<<<<<<<<<<<<< ");
            callback(err,data);
        } else {
            // console.log("Data from file:\n", data);
            var obj = JSON.parse(data);
            console.log("Number of users = " + obj.length);
            async.eachSeries(Object.getOwnPropertyNames(obj).sort(), 
                function(val, callback) {
                    if (!isNaN(val)) {
                        // console.log("val = " + val);
                        var username = obj[val].username;
                        var newUser = new User({ username: username });
                        var passWord = 'ubuntu';
                        User.register(newUser, passWord, function (err, user) {
                            if (err) {
                                console.error("Failed to create new user, " + username);
                                console.error("Error = " + err);
                                callback(err, user);
                            } else {
                                console.log("Created new user: " + username);
                                callback(null, true);
                            }
                        });
                    } else {
                        callback(null, true);
                    } 
                },  
                function(err){
                    if (err) {
                        // console.error("All messed up!!!")
                        callback(err, "All messed up!!!");
                    } else {
                        // console.log("All done processing users.");
                        callback(null, "All done processing users.");
                    }
                });
        }
    });
}

function dbDisconnect(callback) {
    mongoose.disconnect(
        function(err) {
            if (err) {
                callback(err,"There was a problem disconnecting from MongoDB.");
            } else {
                callback(null,"Disconnected from Mongo DB.");
            }
        });
}

function initCG() {
    async.series([crUsersAsync, dbDisconnect], function(err, results){
        if (err) {
            console.error("async series final error: "+err);
            // attempt hard disconnect to bail out.
            mongoose.disconnect();
        } else {
            results.forEach(function(res){
                console.log(res);
            });
        }
    });
}

function createCampgroundComments(authors, campground, cb) {
    comments = campground.comments;
    console.log("-I-entering create campground comments procedure.");
    async.map(comments, function(comment, done) {
        var newComm = {
            _id : mongoose.mongo.ObjectID(),
            text : comment.text,
            createdAt : comment.createdAt,
            author: authors[comment.author.username]
        };
        Comment.create(newComm, function(err, _comment) {
            if (err) {
                done(err);
            } else {
                done(null, _comment._id);
            }
        });
    }, function(err, comment_array) {
        if (err) {
            console.log("error somewhere in the map: "+err);
            cb(err, comment_array);
        } else { 
            console.log("final comment array: "+comment_array);
            campground.comments = comment_array; 
            cb(null, comment_array);
        }
    });
}

function initDB() {
    async.waterfall([
        function(callback) {
            mongoose.connection.once('connected', () => {
                mongoose.connection.db.listCollections().toArray(function (err, names) {
                    if (err) {
                        console.log(err);
                        callback(err);
                    } else {
                        async.eachSeries(names, function(collObj, done) {
                            mongoose.connection.db.dropCollection(collObj.name, function(err) { 
                                if (err) {
                                    console.error("There was an error dropping the collection: " + collObj.name);
                                    callback(err);
                                } else {
                                    console.log("Dropping collection " + collObj.name);
                                    done(null);
                                }
                            });
                        }, function(err, results) { 
                            if (err) {
                                callback(err);
                            } else {
                                callback(null);
                            }
                        });
                    }
                });
            });                
        },
        function (callback) {
            // read the users.json file and get all the usernames as
            // json objects.
            var fname = './users.json';
            fs.readFile(fname, 'utf-8', function (err, data) {
                if (err) {
                    console.error(">>>>>>>>>>>>>>> YIKES!!!! ERROR!!! <<<<<<<<<<<<<<< ");
                    callback(err, data);
                } else {
                    callback(null, data);
                }
            });
        },
        function (users, callback) {
            console.log("Number of users = " + JSON.parse(users).length);
            async.eachSeries(JSON.parse(users), function(user, done) {
                // console.log("User: " + JSON.stringify(user));
                var newUser = new User({ username: user.username });
                var passWord = 'ubuntu';
                User.register(newUser, passWord, function (err, _user) {
                    if (err) {
                        console.error("Failed to create new user, " + user.username);
                        console.error("Error = " + err);
                        done(err);
                    } else {
                        console.log("Created new user: " + user.username);
                        done(null, _user);
                    }
                });
            }, function(err, results) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        },
    function(callback) {
        // user names should have been created already in the mongo db.
        // query the db to get those names and create author objects
        // that are of the form
        //    author: { 
        //        id: { 
        //            type: mongoose.Schema.Types.ObjectId, ref: 'User' 
        //        }, 
        //        username: String 
        //    }
        console.log("-I-About to fetch usernames.");
        User.find({}, {username : 1, _id : 1}, function(err, users) {
            if (err) {
                callback(err, ">>>>>>>>>>>>>>> USER LOOKUP ERROR <<<<<<<<<<<<<<< ");
            } else {
                console.log("-I-creating author objects.");
                var authors = {};
                users.forEach(function(u){
                    authors[u.username] = {
                        id : mongoose.mongo.ObjectID(u._id),
                        username: u.username
                    }
                });
                callback(null, authors);
            }
        });
    },
    function(authors, callback) {
        // read the campground json file
        // if it barfs then bail out of this async chain.
        // otherwise, carry-on.
        console.log("author objects: " + JSON.stringify(authors,null,'\t'));
        var fname   = './campgrounds.json';
        console.log("-I-About to read campground.json");
        fs.readFile(fname, 'utf-8', function(err, data) {
            if (err) {
                callback(err,">>>>>>>>>>>>>>> YIKES!!!! ERROR!!! <<<<<<<<<<<<<<< ");
            } else {
                callback(null, authors, data);
            }
        });
    },
    function(authors, data, callback) {
        // go through the campground objects and filter out those that don't have 
        // an author field, or author.username field, or the author name doesn't
        // appear in the mongo db (which we queried at the start of this async chain).
        // console.log("author objects: " + JSON.stringify(authors,null,'\t'));
        // var obj = JSON.parse(data);
        console.log("-I-about to iterate through campgrounds and create objects.")
        var newCampgrounds = [];
        JSON.parse(data).forEach(function(campground) {
            if (!campground.author || !campground.author.username || !authors[campground.author.username]) { 
                console.error("Skipping campground " + campground.name);
            } else {
                newCampgrounds.push({
                    name : campground.name,
                    price : campground.price,
                    image: campground.image,
                    description : campground.description,
                    comments : campground.comments,
                    author : authors[campground.author.username],
                    createdAt : campground.createdAt
                });
            }
        });
        // all the campgrounds we're passing on should be proper with respect to
        // author names. we'll still need to do some validation of the comments.
        callback(null, authors, newCampgrounds);
    },
    function(authors, campgrounds, callback) {
        // go through all the comments of each camground and determine if
        // there is a valid author listed. if not, then remove the entire
        // comment. 
        // the output will be a validated list of campgrounds all with 
        // comments that contain usernames in the mongo db.
        console.log("-I-iterating and validating all campground comments...")
        campgrounds.forEach(function(campground) {
            for (var ii = campground.comments.length-1; ii >=0; ii--) {
                var comment = campground.comments[ii];
                if (!comment.author || !comment.author.username || !authors[comment.author.username]) { 
                    // console.log("Skipping " + campground.name + " comment: " + JSON.stringify(comment));
                    console.log("Skipping " + campground.name + " comment:");
                    // remove this guy from the list of valid comments.
                    campground.comments.splice(ii, 1);
                }
            };        
            // console.log(">>>>" + JSON.stringify(campground,null,'\t'));
        });
        callback(null, authors, campgrounds);
    },
    function(authors, campgrounds, callback) {
        // for each campground iterate through its comments. for each comment 
        // create a comment document in the mongo db. if successfull, then 
        // replace the comment entry in the campground comment list with the 
        // the mongo object id.
        console.log("-I-creating campground comments...")
        async.eachSeries(campgrounds, function(campground, cb) {
            createCampgroundComments(authors, campground, function( data ) {
                cb(null, data);
            });
        }, function(err, results) {
            console.log("RESULTS = " + results);
            callback(null, campgrounds);
        });
    },
    function(campgrounds, callback) {
        async.eachSeries(campgrounds, function(campground, cb) {
            Campground.create(campground, function(err, _cg){
                if (err) {
                    cb(err)
                } else {
                    cb(null, _cg);
                }
            });
        }, function(err, results) {
            callback(null, campgrounds);
        });
    }
    ], function(error, campgrounds) {
        console.log("-I-Wrapping up ...");
        console.log("-I-campgrounds as of now: " + JSON.stringify(campgrounds,null,'\t'));
        mongoose.disconnect(
            function(err) {
                if (err) {
                    console.error("There was a problem disconnecting from MongoDB.");
                } else {
                    console.log("Disconnected from Mongo DB.");
                }
            });
        });
}

initDB();

