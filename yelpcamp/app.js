
var express    = require('express');
var path       = require('path');
var bodyparser = require('body-parser');
// var ejs        = require('ejs');
var publicPath = path.resolve(__dirname, "public");
var validUrl   = require('valid-url');

var app = express();

app.use(express.static(publicPath));
app.set("views", path.resolve(__dirname, "views"));
// app.engine("html", ejs.renderFile);

app.use(bodyparser.urlencoded({extended: true}));

var port = process.env.PORT || 3000;
var ip   = process.env.IP || 'localhost';

var campgrounds = [
    { name: "Moss Lake", image: "https://farm9.staticflickr.com/8537/29537096513_db5c3723f7.jpg"},
    { name: "Saguaro Springs", image: "https://farm8.staticflickr.com/7459/16358796247_56bc69becd.jpg"}, 
    { name: "Royal Cascade", image: "https://farm8.staticflickr.com/7172/6585313977_b8dc878384.jpg"},
    { name: "Cowell County Park", image: "https://farm9.staticflickr.com/8571/15924490113_af70fc5dff.jpg"}, 
    { name: "Peyson Wash", image: "https://farm9.staticflickr.com/8001/7578750756_e20931fc90.jpg"},
    { name: "Oak Creek Canyon", image: "https://farm8.staticflickr.com/7174/6655837043_6b4948557f.jpg"}
];

// use the guy below for testing (adding new campground) purposes.
//    { name: "Ironside Hills", image: "https://farm6.staticflickr.com/5015/5571738694_92686392b7.jpg"}

app.set("view engine", "ejs");

app.get('/', function(req, res) {
    res.render('landing');
});

app.get('/campgrounds/new', function(req, res) {
    res.render("new");    
});

app.get('/campgrounds', function(req, res) {
    console.log('List of campgrounds goes here!');
    res.render('campgrounds', { campgrounds: campgrounds});
});

app.post('/campgrounds', function(req,res) {
    var cgname = req.body.cgname;
    var cgurl  = req.body.cgurl;
    // add in new entry to campgrounds array assuming the input was valid.
    // code not done yet.
    if (validUrl.isWebUri(cgurl)){
        console.log("New campground! : " + cgname + " : " + cgurl);
        var newCampground = {name: cgname, image: cgurl};
        campgrounds.push(newCampground);
        campgrounds.reverse();
    } else {
        console.log('The campgroung URL looks wrong. NOT accepting new campground.');
    }
    res.redirect('/campgrounds');
});

app.listen(port, ip, function() {
   console.log("YelpCamp server starting up... " + ip); 
});
