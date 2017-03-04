
console.log("------------------ express.js ------------------");

var express    = require('express');
var bodyparser = require('body-parser');
// var path       = require('path');
var publicPath = './public';

module.exports = function() {
    var app = express();
    app.use(express.static(publicPath));
    app.use(bodyparser.urlencoded({extended: true}));

    app.set("views", "./views");
    app.set("view engine", "ejs");

    return app;
};