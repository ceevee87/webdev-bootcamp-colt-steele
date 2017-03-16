var express  = require('express'),
    passport = require('../config/setuppassport')(),
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
            console.error("Could not register new user: "+err);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function(){
            console.log("success!\n" + JSON.stringify(user,null,'\t'));
            res.redirect('/campgrounds');
        });
    });
});

router.get('/login', function(req, res){
    res.render('login');
    // res.send('login page goes here.');
});

router.post('/login', 
    passport.authenticate('local',
        {
            successRedirect: '/campgrounds',
            failureRedirect: '/login',
            failureFlash: true
        }
    ), function(req, res) {
    });

router.get('/logout', function(req, res){
    console.log("Logging out!!");
    req.logout();
    res.redirect('/campgrounds');
});

router.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash('error');
    res.locals.infos = req.flash('info');
    next();
});
module.exports = router;
