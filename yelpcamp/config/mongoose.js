var config   = require('./env/yelpcamp'),
    mongoose = require('mongoose');

console.log("----- mongoose.js ----------");
console.log(__dirname);

module.exports = function() {
    mongoose.connect(config.db);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'mongodb connection error:'));
    db.on('connected', function() {
        console.log('Connection to mongodb (yelpcamp) successful!!');
    });
    
    try {
        require('../models/campground');
    }
    catch (e) {
        console.log('oh no big error')
        console.log(e)
    }
    return mongoose;
};
