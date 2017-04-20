
var port = process.env.PORT || 3000;
var ip   = process.env.IP || 'localhost';

module.exports = {
    db: 'mongodb://localhost/yelpcamp',
    port: port,
    ip: ip,
    usersJsonFile: './users.json',
    campgroundsJsonFile: './campgrounds.json'
};

