var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    var url = req.url;
    req.flash("error", "You need to be logged in to do that"); //shows flash message
    res.redirect("/login?url=" + url);
};

module.exports = middlewareObj;