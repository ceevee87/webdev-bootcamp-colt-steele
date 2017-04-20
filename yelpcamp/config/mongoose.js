var config   = require('./env/yelpcamp.config'),
    mongoose = require('mongoose');

console.log("----- mongoose.js ----------");
console.log(__dirname);

module.exports = function() {
    mongoose.Promise = require('bluebird');
    mongoose.connect(config.db);
    var db = mongoose.connection;

    db.on('error', function(err) {
        console.error('Yikes! There was an error connecting to MongoDB: '+err);
        process.exit(-1);
    });
    db.on('connected', function() {
        console.log('Connection to mongodb (' + config.db + ') successful!!');
    });
    
    return mongoose;
};
