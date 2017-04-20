// MONGOOSE STUFF
var mongoose   = require('../../config/mongoose')();
var Campground = require('../../models/campground.model');
var Comment    = require('../../models/comment.model');
var User       = require('../../models/user.model');

// misc packages
var config     = require('../../config/env/yelpcamp.config');
var fs         = require('fs'),
    path       = require('path'),
    async      = require('async');

// authentication packages and related set up
var passport   = require('../../config/passport')(),
    session    = require('express-session'),
    auth       = require('../../middlewares/auth'),
    ensureAuthenticated   = auth.ensureAuthenticated,
    checkCommentOwnership = auth.checkCommentOwnership;
session({
        secret: "great$%^divide!@890claymore12-+/]",
        resave: false,
        saveUninitialized: false
});
passport.initialize();
passport.session();
// end authentication setup

var fname = path.join(path.resolve(__dirname), config.usersJsonFile);
function dropDbCollections() {
    return function(callback) {
        // we are replacing any data in the mongo db with what we'll
        // load from the users.json and campground.json files.
        // so, if there are already collections in the db we're 
        // going to drop them.
        var dbconn = mongoose.connection.db;
        mongoose.connection.once('connected', () => {
            dbconn.listCollections().toArray(function (err, collObjs) {
                if (err) {
                    console.log(err);
                    callback(err);
                } else {
                    async.eachSeries(collObjs, function(collObj, done) {
                        collName = collObj.name;
                        dbconn.dropCollection(collName, function(err) { 
                            if (err) {
                                console.error("-E-There was an error dropping \
                                    the collection: " + collName);
                                callback(err);
                            } else {
                                console.log("-I-Dropping db collection " + collName);
                                done(null);
                            }
                        });
                    }, function(err, results) { 
                        if (err) {
                            callback(err);
                        } else {
                            callback(null,fname);
                        }
                    });
                }
            });
        });
    }
}

function readUserData(fname, callback) {
    // read the users.json file and get all the usernames as
    // json objects.
    console.log("-I-About to read users from json file.");
    fs.readFile(fname, 'utf-8', function (err, data) {
        if (err) {
            console.error("-E-Could not read user json file: "+err);
            callback(err);
        } else {
            callback(null, data);
        }
    });
}

function createDbUsers(users, callback) {
    console.log("-I-Number of users = " + JSON.parse(users).length);
    async.eachSeries(JSON.parse(users), function(user, done) {
        // console.log("User: " + JSON.stringify(user));
        var newUser = new User({ username: user.username });
        var passWord = 'ubuntu';
        User.register(newUser, passWord, function (err, _user) {
            if (err) {
                console.error("-E-Failed to create new user, " + user.username);
                console.error("-E-Error = " + err);
                done(err);
            } else {
                console.log("-I-Created new user: " + user.username);
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
}

function constructAuthorsArr(callback) {
    // user names should have been created already in the mongo db.
    // query the db to get those names and create author objects
    // that are of the form
    //    author: { 
    //        id: { 
    //            type: mongoose.Schema.Types.ObjectId, ref: 'User' 
    //        }, 
    //        username: String 
    //    }
    console.log("-I-About to fetch user names from DB.");
    User.find({}, {username : 1, _id : 1}, function(err, users) {
        if (err) {
            console.error("-E-Could not execute mongoose find operation for \
                        users:" + err);
            callback(err);
        } else {
            console.log("-I-creating author objects from user names.");
            var authors = {};
            users.forEach(function(u){
                authors[u.username] = {
                    id : mongoose.mongo.ObjectID(u._id),
                    username: u.username
                }
            });
            console.log("author objects: " + JSON.stringify(authors,null,'\t'));
            callback(null, authors);
        }
    });
}

function readCampgroundData(authors, callback) {
    // read the campground json file
    // if it barfs then bail out of this async chain.
    // otherwise, carry-on.
    var fname = path.join(path.resolve(__dirname),config.campgroundsJsonFile);
    console.log("-I-About to read campground.json");
    fs.readFile(fname, 'utf-8', function(err, data) {
        if (err) {
            console.error("-E-Could not read campground json file: "+err);            
            callback(err);
        } else {
            callback(null, authors, data);
        }
    });
}

function cleanAndCreateCampgroundObjs(authors, data, callback) {
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
}

function cleanComments(authors, campgrounds, callback) {
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
}

function createCampgroundComments(authors, campground, cb) {
    // campground documents contain references to their comments,
    // which are documents themselves in a separate mongo collection.
    // the references are via the comment mongo _ids.
    //
    // we use the map fn here because it will return an array at the 
    // end of all of the mongo _ids created for each comment.
    // this array is exactly what we'll assign to the campground.comments
    // variable.
    comments = campground.comments;
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
            console.log("-I-" + campground.name + ": created " + 
                    comment_array.length + " comments.")
            // console.log("final comment array: "+comment_array);
            campground.comments = comment_array; 
            cb(null, comment_array);
        }
    });
}

function createDbComments(authors, campgrounds, callback) {
    // for each campground iterate through its comments and create a mongo 
    // document. assemble all the document ids and assign that array
    // to the campground.comments variable. 
    // this is handled in the fn createDbCampgrounds.
    console.log("-I-creating campground comments...")
    async.eachSeries(campgrounds, function(campground, cb) {
        createCampgroundComments(authors, campground, function( data ) {
            cb(null, data);
        });
    }, function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, campgrounds);
        }
    });
}

function createDbCampgrounds(campgrounds, callback) {
    console.log("-I-creating campgrounds...")
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

function disconnectDb() {
    mongoose.disconnect(
        function(err) {
            if (err) {
                console.error("There was a problem disconnecting from MongoDB.");
            } else {
                console.log("Disconnected from Mongo DB.");
            }
        });
}

function initDB() {
    async.waterfall([
        dropDbCollections(),
        readUserData,
        createDbUsers,
        constructAuthorsArr,
        readCampgroundData,
        cleanAndCreateCampgroundObjs,
        cleanComments,
        createDbComments,
        createDbCampgrounds,
    ], function(error, campgrounds) {
        if (error) {
            console.error("-E-Error detected during db construction flow: " + error);
        } else {
            console.log("-I-Wrapping up ...");
            console.log("-I-Campgrounds created: " + JSON.stringify(campgrounds,null,'\t'));
        }
        disconnectDb();
    });
}

initDB();

