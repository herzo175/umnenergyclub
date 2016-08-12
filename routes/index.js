//npm dependencies
var express = require("express"); //we need to require the express module again on this page...
var router = express.Router(); //so we can create a variable called router using express's router module
var passport = require("passport"); //we also need to require passport since we handle authentication with some of the routes on this page
var async = require("async"); //Node.js handles things asynchronously, meaning that it doesn't execute tasks in order like in an imperative language. Async allows us to run tasks in order, relying on callbacks to allow the next task to run. More on this later...
var multer = require("multer");  var upload = multer({ dest: 'uploads/' }); //the multer module is used to upload a file locally from a form on our page. uploads are specified to go to the uploads folder

//models
var User = require("../models/user"); //acceses the user mongoose model. This is so we can access a user and make edits to them
var Post = require("../models/post"); //accesses the post mongoose model. On this page, it is used for finding posts to display on the landing page
var Meeting = require("../models/meeting"); //accesses the meeting mongoose model to display meetings when a user makes a request to the meetings page

//libraries
var middleware = require("../library/middleware"); //allows us to use middleware functions we wrote
var apis = require("../library/apis"); //allows us to use api functions we wrote

//This is a request to the landing page ("/")
//Whenever a user goes to our web address, they automatically end up on the landing page since there is no other specific page requested (like login or meetings)
//The type of request made to the site is known as a GET request. GET requests are typically made when the primary function is to get data from the server
//this is specified when we say "router.get"
//however, requests are arbitrary. If a post request was made to "/", we could handle it and send back data. 
//The reason we use a get request is because by default, a request, like when a link is clicked, is a get request, and the landing page is our default page
router.get("/", function(req, res) { //once someone makes a request to "/", express sends a callback which we access with function(req, res), where req is the request data, and res is the response data (which we send to the user at the end)
    //on the landing page, we show all the images from user's posts, all the posts made on the blog, and all the comments of those posts
    //To do that, we need to find all the posts in the database
    //this is done with the command "Post.find({})". Inside {} is the search parameter. This can be something like Post.find({"title": "hello"}, which finds all posts where the title is equal to the string "hello"
    //we want to find all posts regardless, so we don't specify a search parameter ({}). This returns all posts
    //all the posts have an array of comments (see post.js in models). We need to return those too, so we say ".populate("comments").exec()" to fill in all the comments in the comments field of the database object
    Post.find({}).populate("comments").exec(function(err, allPosts) { //function(err, allPosts) is the callback once all the posts are found. err is any error returned by the function, allPosts is an array of posts returned by the search. Note that allPosts is an arbitrary name
        if (err) { //if there is an error, we print it to the console so we can diagnose it and fix it
            console.log(err);
        }
        else { //otherwise, we can go to work on the posts array which we called "allPosts"
            allPosts.reverse(); //reverses the found posts so that the newest posts are first in the allPosts array instead of last
            async.each(allPosts, function(post, callback) { //this is an example of a async operation. async.each iterates over an array, in this case allPosts
                //The above breaks down each element in allPosts into an element we can operate on, which we arbitrarily called post
                post.comments.reverse(); //even though we reversed the posts, the comments for those posts will still come out latest on top. This reverses the order
                callback(null); //once the operation is done, we need to state a callback that tells async to go onto operating on the next thing
            }, function(err) { //this function is called once the async operation is finished
                if (err) {
                    console.log(err);
                }
                else {
                    //if there wasn't an error with async, we render the landing page (landing.ejs) and pass in an object called posts which is composed on allPosts
                    //In sum, we found all the posts, reversed their order, reversed the order of the comments for each post, and then sent the posts to the landing page
                    //we render the landing page passing in an object called posts wich we set equal to the allPosts array
                    //the posts object is accessed on the landing page through ejs
                    res.render("landing", {posts: allPosts}); //res.render is the response part of the express function. res.render tells the server to compile HTML from the landing.ejs file and send it to the client
                }
            });
        }
    });
});

//register form 
//The client makes a request to "/login"
router.get("/login", function(req, res) {
    //in middleware.js, if a person tries to access a page that requires them to be logged in and they aren't, they are redirected to /login
    //in the process of redirecting them, we attached a query to the /login request that specifies the page they were trying to access
    //if they were trying to access a page, we save that page request as the variable url
    var url; 
    if (req.query.url) {
        url = req.query.url;
    }
    else {
        url = null;
    }
    //then we render the login page and pass in the url of the page they were trying to go to
    //this way, when the login, they are taken directly to the page they were trying to access instead of being directed to the home page
    //another way to do this is with cookies
    res.render("login", {url: url});
});

//handle login
//this is an example of a POST request. POST request are the second most common type of request and are typically used when sending form data
//in this case, a person is sending in their login data and we are authenticating them
//like with a GET request, post is arbitrary. We use post to differenciate this request from the GET request to login that is handled above
router.post("/login", passport.authenticate("local",
    //uses the local strategy to take the form that is passed in and authenticate the user
    {
        //successRedirect: "/dashboard", //middleware
        failureRedirect: "/login", //if the authentication is unsuccessful, the user is redirected back to the login page ("/login" route)
    }), function(req, res) { //if the authentication is successful:
            //this uses the query that was passed to the login page if the user was denied from accessing a page and needed to login
            if (req.query.url) {
                req.flash("success", "Welcome, " + req.user.name); //Upon login, a success type flash message is sent to the client
                res.redirect(req.query.url); //redirects them to the desired route
            }
            else {
                req.flash("success", "Welcome, " + req.user.name);
                res.redirect("/"); //otherwise, redirects them to the route that renders the home page (router.get("/"))
            }
});

//handle register of new user
//user fills out the register form on the login page and submits it, making a POST request to "/register"
router.post("/register", function(req, res) {
    //in case someone put malicious code in their name (like alert("I hacked you")), we can get rid of it
    req.body.name = req.sanitize(req.body.name); //using express sanitizer, the name field is sanitized so it is free of code
    //this command creates a new user using form data from body parser
    var newUser = new User({username: req.body.username, email: req.body.username, name: req.body.name});
    //creates a new user. These routes are more specific to authentication, we don't use these in other places in the application
    User.register(newUser, req.body.password, function(err, newUser) {
        if (err) {
            console.log(err);
            req.flash("error", err.message); //err.message is inside the object generated by passpost.js
            return res.render("login"); 
        }
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Welcome, " + req.body.name);
            var officerArray = ["jeremyaherzog@gmail.com","wang3790@umn.edu"]; //array of officer emails
            if (officerArray.indexOf(newUser.email) > -1) { //if the person registering is an officer (since their email matches an email in the officer array),
                newUser.isOfficer = true; //the isOfficer field is set to true, saving the status in the database
                newUser.save();
            }
            if (req.query.url) {
                //if the person was trying to reach a page (like in login) and wasn't registered, they can be sent to that page after they register
                res.redirect(req.query.url);
            }
            else {
                //otherwise, send to the home page
                res.redirect("/");
            }
        });
    });
});

//handle sign out
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Signed you out!");
    res.redirect("/");
});

//renders settings page of the user making the request
//checks if the person is logged in before rendering the page
//if they are, it returns next and allows the rest of the function to happen
//otherwise, isLoggedIn redirects the person to the login page
router.get("/settings", middleware.isLoggedIn, function(req, res) {
    //searches for a user in the database by the id associated with the user making the request
    //that id is accessed in dot notation by ._id (this is the same when accessing the id of any other mongoDB object schema)
    //this assumes that a logged in user is making the request, which is why middleware is called to check if the person making the request is logged in
    User.findById(req.user._id, function(err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            //if the user's data is returned, the settings page is rendered and sent an object called user which is equal to the found user
            res.render("settings", {user: foundUser});
        }
    });
});

//handles a change to the person's settings via a POST request when the form on the settings page is submitted
router.post("/settings", middleware.isLoggedIn, function(req, res) {
    //as a security measure, a user object is used to update the user
    //this is so someone can't duplicate the page, add fields that would allow them to become an admin, and submit it to get admin access
    req.body.bio = req.sanitize(req.body.bio);
    var userObj = {
        role: req.body.role,
        bio: req.body.bio,
        photo: req.body.photo
    };
    //The command selects a user in the database where the ._id field (a unique hexidecimal field) is equal to the ._id field of the user making the request
    //then, using the userObj we created, that data is passed to the database where the matching fields (role, bio, photo) are updated
    User.findByIdAndUpdate(req.user._id, userObj, function(err, updatedUser) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Updated user: " + updatedUser); //prints the updated user's data to our console
            res.redirect("/"); //sends them to the home page route
        }
    });
});

//the following are get requests that render the about page, calendar page, and contact page
//handle GET request to the about page
router.get("/about", function(req, res) {
    res.render("about"); //renders about.ejs and sends to client
});

//handle GET request to calendar page
router.get("/calendar", function(req, res) {
    res.render("calendar"); //renders calendar.ejs and sends to client
});

//handle GET request to contact page
router.get("/contact", function(req, res) {
    res.render("contact"); //renders contact.ejs and sends to client
});

//handles a POST request made by submitting the form on the contac page
router.post("/contact", function(req, res) {
    req.body.email = req.sanitize(req.body.email); //sanitize the email address
    req.body.subject = req.sanitize(req.body.subject); //sanitize the subject field
    req.body.body = req.sanitize(req.body.body); //sanitize the body field

    apis.sendEmailToAdmin(req); //using the mailgun api code written in the apis library, an email is sent to the admin using data from the form
    res.redirect("/"); //send to client back to the home page
});

//renders the members page (in the officer dashboard)
//middleware checks if the person is logged in and if the person making the request is an officer
router.get("/members", middleware.isLoggedIn, middleware.isOfficer, function(req, res) {
    //since the person making the request has to be an officer, we need to check if so
    if (req.user.isOfficer) {
        //The members page will show all members of the club including the officers, so we need to do a query that will return all users of the site
        User.find({}, function(err, foundUsers) {
            if (err) {
                console.log(err);
            }
            else {
                //The members page will have data on meetings too, so we also need to select all the meetings
                //Each meeting has an array containing all the attendees of the meetings, under the field attendees, so we need to populate the attendees of all the meetings
                //to get data such as who attend which meetings
                Meeting.find({}).populate("attendees").exec(function(err, foundMeetings) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        //once we have all the users and all the meetings, we can render the members page and pass in a users object equal to all the found users
                        //and a meetings object equal to all the found meetings
                        res.render("members", {users: foundUsers, meetings: foundMeetings});
                    }
                });
            }
        });
    }
});

//this route is used to send emails to multiple people on the members page
router.post("/sendemail", middleware.isLoggedIn, middleware.isOfficer, function(req, res) {
    //first, we sanitize the form's subject and body fields
    req.body.subject = req.sanitize(req.body.subject);
    req.body.body = req.sanitize(req.body.body);
    console.log(req.body); //debugging readout
    apis.sendEmailsToRecipients(req); //then, we send it to the sendEmailsToRecipients function in the api library, which sends an email using mailgun to all the recipients that were marked down
    res.redirect("/");
});

//renders the officers page
router.get("/officers", function(req, res) {
    //first we do a query to return all the users who are officers
    User.find({"isOfficer": true}, function(err, foundOfficers) {
        if (err) {
            console.log(err);
        }
        else {
            //with the found users, we can pass their data to the offices page inside an object called officers
            res.render("officers", {officers: foundOfficers});
        }
    });
});

router.post("/twilio/message", function(req, res) {
    //save this for later...
    console.log(req);
});

//this route is to handle front end file uploads of pictures
//first, a POST request is made to /cloudinary/upload
//We want to recieve a JSON (Javascipt Object Notation) object containing all the data about the finished upload, most importantly the url of the photo at the hosting site
//using multer, the file in upload field is uploaded to the local disk.
//once uploaded, it can be accessed via an api, which uploads it to the cloud
//we then delete the file from the local disk to save space and not sacrifice site performance. 
//It is a good dev practice to upload large files such as photos or videos to offsite storage, such as Amazon S3 or a service like cloudinary for this reason
router.post("/cloudinary/upload", upload.single("file"), function(req, res) {
    console.log(req.file);
    apis.uploadImage(req, function(upload) { //in the api library, there is a function uploadImage(req, callback) that handles the upload to the cloud
        console.log(upload); //the uploadImage function has a callback that is returned once the function is done running. The callback (like function(req, res)) contains an object with the upload info (like image url)
        res.json(upload); //we send back the information as a JSON object to the page. An AJAX request handles the request and response to this route on the front end of the page
        //this way, we can upload an image without leaving the page
    });
});

//lastly, export all the routes so we can use them on app.js
module.exports = router;