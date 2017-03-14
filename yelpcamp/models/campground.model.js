console.log("----- campground.js ----------");
var mongoose = require('mongoose');

var campgroundSchema = mongoose.Schema({
    name:        String,
    image:       String,
    description: String
});

module.exports = mongoose.model('Campground', campgroundSchema);