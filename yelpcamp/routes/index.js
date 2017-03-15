var express = require('express'),
    router  = express.Router();

// Root route
router.get('/', function(req, res) {
    res.render('landing');
});


// ===============================================
// ******      AUTHORIZATION ROUTES      *********
// ===============================================
// RESTful routes for authorization
// INDEX   /register                      GET

//
// registration page
router.get('/register', function(req, res) {
    res.render("register");
});

module.exports = router;
