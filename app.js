//dependencies (npm packages needed to run and build the app)
//before we start, we need to run npm init to create a package.json file
//npm init will walk you through the steps, just fill in the blanks and be sure to list app.js as the starting point
//to install a npm package, type in the command link "npm install packagename --save", where packagename is the name of the package
//--save lists the package in the package.json file
var express = require("express"); //framework to handle requests and responses to the app. this is usually the first and most important package we install (npm install express --save)
var app = express(); //activates express as var app
var bodyParser = require("body-parser"); //creates body objects in the request, used to access data sent to the app via a form
var mongoose = require("mongoose"); //makes mongoDB easier to use
var methodOverride = require("method-override"); //allows forms on the site to make request other than get and post (like PUT and DELETE)
var flash = require("connect-flash"); //for sending flash messages to the user
var localStrategy = require("passport-local"); //basic passport authentication strategy for logging in and signing up new users
//var facebookStrategy = require("passport-facebook").Strategy; //allows us to sign up/login someone through facebook's api
//var googleStrategy = require( 'passport-google-oauth2' ).Strategy; //allows us to sign up/login someone through google's api
var passport = require("passport"); //the passport module itself. It's used to authenticate a user and keep their data persistent as they navigate from page to page
var expressSanitizer = require("express-sanitizer"); //used to keep malicious code from being entered through forms
var helmet = require('helmet'); //helmet is a security package. we just have to install and enable it

//var config = require("./oauth"); (js file containing api keys that allow us to use the facebook and google express strategies)

//activate npm packages (app wide)
app.use(helmet()); //activates the helmet package
app.set("view engine", "ejs"); //allows us to make and render ejs templates
app.use(bodyParser.urlencoded({extended: true})); //allows us to use body parser. Now, there is a body object in requests to the page (req.body) that we can access when we recieve a form. More on this later
app.use(expressSanitizer()); //activates express sanitizer. Like body parser, it allows us to say req.sanitize when sanitizing req.body form data
app.use(express.static(__dirname + "/public")); //use the directory with the stylesheet and js libraries
app.use(methodOverride("_method")); //allows us to use method override so we can handle requests from forms other than GET and POST
app.use(flash()); //allows us to use flash messages and send them to the user in req.flash format

//database stuff (connects to either the local database (data directory) or the database connected to the hosted server. This is so we can work on either local development or live with different databases
var url = process.env.DATABASE || "mongodb://localhost/app"; //connects to mongolab's database or the local database (which is turned on in another terminal by typing ./mongod)
console.log(url); //displays the database we are using
mongoose.connect(url); //connects mongoose to the mongoDB database at either mongolab or locally

//authentication stuff
var User = require("./models/user"); //imports the user database model for authentication (in models folder)
app.use(require("express-session")({ //used create persistent user data so they don't get logged out when the go to another page
    secret: "Tupac lives!", //this can be anything...
    name: "f&a877Z01001$$@qpz95", //this is totally random...
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize()); //these two lines start an http session for each user once they start making requests to the page
app.use(passport.session());

passport.use(new localStrategy(User.authenticate())); //activates the local strategy for passport.js login with local strategy consists of a simple username and password

/*passport.use(new facebookStrategy({ //facebook strategy. activate api on facebook developer dashboard
  clientID: config.facebook.clientID,
  clientSecret: config.facebook.clientSecret,
  callbackURL: config.facebook.callbackURL,
  passReqToCallback: true
},
function(request, accessToken, refreshToken, profile, cb) {
    console.log(request.session);
    User.findOne({ oauthId: profile.id }, function (err, user) {
        if (err) {
            console.log(err);
        }
        if (!err && user !== null) {
            console.log(profile);
            return cb(err, user);
        }
        else {
            var nameArray = profile.displayName.split(" ");
            var userObj = {
              oauthId: profile.id,
              firstName: nameArray[0],
              lastName: nameArray[1],
            };
            User.create(userObj, function(err, newUser) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(profile);
                    console.log("New user: " + newUser);
                    return cb(err, newUser);
                }
            });
        }
    });
  }
));

passport.use(new googleStrategy({ //google strategy for authentication. activate google plus and email apis on google developer dashboard
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL,
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, cb) {
    User.findOne({ oauthId: profile.id }, function (err, user) {
        if (err) {
            console.log(err);
        }
        if (!err && user !== null) {
            console.log(profile);
            return cb(err, user);
        }
        else {
            User.findOne({email: profile.email}, function(err, foundUser) {
                if (err) {
                    console.log(err);
                }
                if (!err && foundUser !== null) {
                    foundUser.oauthId = profile.id;
                    foundUser.save();
                    return cb(err, foundUser);
                }
                else {
                    var userObj = {
                      oauthId: profile.id,
                      firstName: profile.name.givenName,
                      lastName: profile.name.familyName,
                      email: profile.email
                    };
                    User.create(userObj, function(err, newUser) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("New user: " + newUser);
                            return cb(err, newUser);
                        }
                    });
                }
            });
        }
    });
  }
));*/

passport.serializeUser(function(user, done) { //these two commands are required for authentication
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());

//sends some basic data to the routes
app.use(function(req, res, next) {
    res.locals.currentUser = req.user; //sends an object called currentUser to be accessable by all front end pages
    res.locals.error = req.flash("error"); //creates a req.flash object called error that can be sent to the front end on all pages
    res.locals.success = req.flash("success"); //creates a req.flash object called success that can be sent and accessed at all pages
    next();
});

//imports the file that handles routing http requests to the app
//var testRoutes = require("./routes/test.js");
var indexRoutes = require("./routes/index.js"); //misc routes and (/) route to render home page
var postRoutes = require("./routes/posts.js"); //routes for handling posts
var commentRoutes = require("./routes/comments.js"); //routes for handling comments
var meetingRoutes = require("./routes/meetings.js"); //routes for handling meetings
var projectRoutes = require("./routes/projects.js"); //routes for handling projects

//app.use(testRoutes); //all routes in one page (for route position testing purposes)
app.use(indexRoutes);
app.use(postRoutes);
app.use(commentRoutes);
app.use(meetingRoutes);
app.use(projectRoutes);

//run the app
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("starting website!");
});