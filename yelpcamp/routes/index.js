var express  = require('express'),
    passport = require('../config/passport')(),
    User     = require('../models/user.model'),
    router   = express.Router();

// Root route
router.get('/', function(req, res) {
    res.render('landing');
});


// ===============================================
// ******      AUTHORIZATION ROUTES      *********
// ===============================================
// RESTful routes for authorization
// INDEX   /register                      GET

//
// registration page
router.get('/register', function(req, res) {
    res.render("register");
});

// we need (currently missing) as POST route for /register
router.post('/register', function(req,res){
    // res.send("register POST route");
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if (err) {
            req.flash("error", "Could not register new user: "+err.message);
            res.redirect('/register');
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success","New account created (" + req.body.username + 
                ")! Welcome to YelpCamp");
            // console.log("success!\n" + JSON.stringify(user,null,'\t'));
            res.redirect('/campgrounds');
        });
    });
});

router.get('/login', function(req, res){
    res.render('login');
});

router.post('/login', 
    passport.authenticate('local',
        {
            successRedirect: '/campgrounds',
            failureRedirect: '/login',
            failureFlash: true
        }
    ), function(req, res) {
        // noop
    });

router.get('/logout', function(req, res) {
    if (req.user) {
        req.flash("info", "User " + req.user.username + " has logged out!!");
        req.logout();
    }
    res.redirect('/campgrounds');
});

module.exports = router;
