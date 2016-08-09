//dependencies (npm packages needed to run and build the app, must be installed (npm install package --save))
var express = require("express"); //framework to handle requests and responses to the app
var app = express(); //activates express as var app
var bodyParser = require("body-parser"); //creates body objects in the request, used to access data sent to the app via a form
var mongoose = require("mongoose"); //makes mongoDB easier to use
var methodOverride = require("method-override"); //allows forms on the site to make request other than get and post (like PUT and DELETE)
var flash = require("connect-flash"); //for sending flash messages to the user
var localStrategy = require("passport-local"); //basic passport authentication strategy for logging in and signing up new users
//var facebookStrategy = require("passport-facebook").Strategy; //allows us to sign up/login someone through facebook's api
//var googleStrategy = require( 'passport-google-oauth2' ).Strategy; //allows us to sign up/login someone through google's api
var passport = require("passport"); //the passport module itself. It's used to authenticate a user and keep their data persistent as they navigate from page to page
//var expressSanitizer = require("express-sanitizer"); //used to keep malicious code from being entered through forms
//var multer = require("multer"); //used for file uploads
//var expressSession = require("express-session")

//var config = require("./oauth");

//random stuff (activates many of the dependencies above)
app.set("view engine", "ejs"); //allows us to make and render ejs templates
app.use(bodyParser.urlencoded({extended: true})); //allows us to use body parser
//app.use(expressSanitizer());
app.use(express.static(__dirname + "/public")); //use the directory with the stylesheet
app.use(methodOverride("_method")); //allows us to use method override
app.use(flash()); //allows us to use flash messages
//app.use(cookieParser());
//app.use(expressSession({secret:'dontwatchbatmanvssuperman'}));
//app.set('upload', multer({ dest: 'uploads/' }));

//database stuff (connects to either the local database (data directory) or the database connected to the hosted server
var url = process.env.DATABASE || "mongodb://localhost/app";
console.log(url);
mongoose.connect(url);
//var seedDB = require("./seeds.js"); //in case we want to seed the database with sample posts and users
//seedDB();

//authentication stuff
var User = require("./models/user"); //imports the user model
app.use(require("express-session")({ //used create persistent user data so they don't get logged out when the go to another page
    secret: "Tupac lives!", //this can be anything
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

/*passport.use(new facebookStrategy({
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

passport.use(new googleStrategy({
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

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());

//sends some basic data to the routes
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
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