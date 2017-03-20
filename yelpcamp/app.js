
var app        = require('./config/express')(),
    config     = require('./config/env/yelpcamp.config');

// MONGOOSE STUFF
var mongoose   = require('./config/mongoose')();
var Campground = require('./models/campground.model');
var Comment    = require('./models/comment.model');

// Read Route definitions and load them into middleware.
var campgroundRoutes = require('./routes/campgrounds'),
    commentRoutes    = require('./routes/comments'),
    adminRoutes      = require('./routes/admin'),
    indexRoutes      = require('./routes/index');

app.use(indexRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/comments',commentRoutes);
app.use(adminRoutes);

app.listen(config.port, config.ip, function() {
   console.log("YelpCamp server starting up... " + config.ip); 
});
