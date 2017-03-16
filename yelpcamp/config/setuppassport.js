var passport     = require('passport');
var User         = require('../models/user.model');

var LocalStrategy = require('passport-local').Strategy;

// var localStrategy = new LocalStrategy(function(username, password, done){
//     User.findOne({username: username}, function(err, user){
//         if (err) { return done(err);}
//         if (!user) {
//             return(done(null, false, {
//                 message: "No user has that username!"
//             }));
//         }
//         user.checkPassword(password, function(err, isMatch){
//             if (err) { return done(err);}
//             if (isMatch) {
//                 return(done(null, user));
//             } else {
//                 return(done(null, false, {
//                     message: "Invalid password!"
//                 }));
//             }
//         });
//     });
// });

module.exports = function() {
    // Serialize and deserialize users here.

    passport.serializeUser(User.serializeUser());
    // passport.serializeUser(function(user, done) {
    //     done(null, user._id);
    // });

    passport.deserializeUser(User.deserializeUser());
    // passport.deserializeUser(function(id, done){
    //     User.findById(id, function(err, user){
    //         done(err, user);
    //     });
    // });

    // Now to put the strategy into middleware.
    // passport.use("local", localStrategy);
    passport.use(new LocalStrategy(User.authenticate()));

    return passport;
}
