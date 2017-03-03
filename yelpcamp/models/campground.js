console.log("----- campground.js ----------");
var mongoose = require('mongoose');

var campgroundSchema = mongoose.Schema({
    name:   String,
    image:  String
});
var Campground = mongoose.model('Campground', campgroundSchema);

