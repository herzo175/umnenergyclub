var middlewareObj = {};

//middleware is used in between making the request and getting the callback
//it is typically written as router.get("/route", middleware.isLoggedIn, function(req, res) {
//middleware handles the request, then spits out a response and has express move on to the next function
middlewareObj.isLoggedIn = function(req, res, next) {
    //checks if the person making the request is logged in
    if (req.isAuthenticated()) {
        //if they are logged in, the middleware allows the request to continue
        return next();
    }
    //otherwise, the user is redirected to the login page
    //the middleware also appends a query to the request url containing the route the person was trying to make
    //that url is passed on to the login form, so when the person logs in, they can be re routed to their route instead of the homepage
    var url = req.url;
    req.flash("error", "You need to be logged in to do that"); //shows flash message
    res.redirect("/login?url=" + url);
};

//checks if the person making the request is an officer
middlewareObj.isOfficer = function(req, res, next) {
    if (req.user.isOfficer) {
        return next();
    }
    else {
        res.redirect("back");
    }
};

module.exports = middlewareObj;