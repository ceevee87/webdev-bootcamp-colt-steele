
console.log("------------------ express.js ------------------");

var express        = require('express'),
    bodyparser     = require('body-parser'),
    flash          = require('connect-flash'),
    passport       = require('passport'),
    session        = require('express-session'),
    methodOverride = require('method-override');

// path       = require('path');
publicPath = './public';

module.exports = function() {
    var app = express();
    app.use(express.static(publicPath));
    app.use(bodyparser.urlencoded({extended: true}));
    app.use(methodOverride("_method"));
    app.use(session({
        secret: "great$%^divide!@890claymore12-+/]",
        resave: false,
        saveUninitialized: false
    }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());

    app.locals.moment = require('moment');
    
    app.use(function(req, res, next){
        res.locals.currentUser = req.user;
        res.locals.flashError = req.flash('error');
        res.locals.flashInfo = req.flash('info');
        res.locals.flashSuccess = req.flash('success');
        next();
    });

     app.set("views", "./views");
    app.set("view engine", "ejs");

    return app;
};