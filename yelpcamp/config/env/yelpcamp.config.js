
var port = process.env.PORT || 3000;
var ip   = process.env.IP || 'localhost';
var db   = process.env.MONGODB_URI || 'mongodb://localhost/yelpcamp';

module.exports = {
    db: db,
    port: port,
    ip: ip,
    usersJsonFile: 'users.json',
    campgroundsJsonFile: 'campgrounds.json'
};

