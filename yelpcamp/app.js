
var express    = require('express');
var path       = require('path');
var bodyparser = require('body-parser');
var publicPath = path.resolve(__dirname, "public");
var validUrl   = require('valid-url');

var app = express();

app.use(express.static(publicPath));
app.use(bodyparser.urlencoded({extended: true}));
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");


// MONGOOSE STUFF
var mongoose = require('./config/mongoose')();
var Campground = require('mongoose').model('Campground');

var port = process.env.PORT || 3000;
var ip   = process.env.IP || 'localhost';

var Xcampgrounds = [
    { name: "Moss Lake", image: "https://farm9.staticflickr.com/8537/29537096513_db5c3723f7.jpg"},
    { name: "Saguaro Springs", image: "https://farm8.staticflickr.com/7459/16358796247_56bc69becd.jpg"},
    { name: "Cowell County Park", image: "https://farm9.staticflickr.com/8571/15924490113_af70fc5dff.jpg"}, 
    { name: "Peyson Wash", image: "https://farm9.staticflickr.com/8001/7578750756_e20931fc90.jpg"},
    { name: "Oak Creek Canyon", image: "https://farm8.staticflickr.com/7174/6655837043_6b4948557f.jpg"}
];


    // { name: "Crystal Lake", image: "img/dino-reichmuth-123637.jpg"},
    // { name: "Dinosaur Wash", image: "img/martino-pietropoli-169840.jpg"},
    // { name: "Guitar Lake", image: "img/andreas-ronningen-37810.jpg"},
    // { name: "Solace Canyon", image: "https://unsplash.com/search/photos/camp?photo=K9olx8OF36A"},
    // { name: "Unknown Lake", image: "https://unsplash.com/search/photos/camp?photo=i9FLJwYhVQs"},
    // https://unsplash.com/search/camping?photo=5Rhl-kSRydQ
// use the guy below for testing (adding new campground) purposes.
//    { name: "Ironside Hills", image: "https://farm6.staticflickr.com/5015/5571738694_92686392b7.jpg"}
//    { name: "Royal Cascade", image: "https://farm8.staticflickr.com/7172/6585313977_b8dc878384.jpg"},


app.get('/', function(req, res) {
    res.render('landing');
});

app.get('/campgrounds/new', function(req, res) {
    res.render("new");    
});

app.get('/campgrounds', function(req, res) {
    console.log('List of campgrounds goes here!');
    Campground.find({}, function(err, campgrounds) {
        if (err) {
            console.log("Couldn't fetch campgrounds from DB!!")
            console.log(err);
        } else {
            res.render('campgrounds', { campgrounds: campgrounds});
        }
    });
});

app.get('/campgrounds/:id', function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log("app.get-campground/id, err: " + err);
        } else {
            res.render('campground.details.ejs', {campground: campground});
        }
    })
});

app.post('/campgrounds', function(req,res) {
    var cgname = req.body.cgname;
    var cgurl  = req.body.cgurl;
    var cgdesc = req.body.cgdesc;
    // add in new entry to campgrounds array assuming the input was valid.
    if (validUrl.isWebUri(cgurl)){
        console.log("New campground! : " + cgname + " : " + cgurl);
        var newCampground = {name: cgname, image: cgurl, description: cgdesc};

        // We're savning this stuff in a database (MongoDB).
        Campground.create(newCampground, function(err, campground) {
            if (err) {
                console.log(err);
            } else {
                console.log("Created new campground!");
                console.log(campground);
            }
        });        
    } else {
        console.log('The campgroung URL looks wrong. NOT accepting new campground.');
    }
    res.redirect('/campgrounds');
});

app.listen(port, ip, function() {
   console.log("YelpCamp server starting up... " + ip); 
});
