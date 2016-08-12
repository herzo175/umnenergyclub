//dependencies
var express = require("express");
var router = express.Router();

//models
var Post = require("../models/post");

//libraries
var middleware = require("../library/middleware");

//renders create post page
router.get("/createpost", middleware.isLoggedIn, function(req, res) {
    res.render("posts/createpost");
});

//handles creation of a new post when the form on the create post page is submitted
//the form specifies a POST request to "/createpost"
router.post("/createpost", middleware.isLoggedIn, function(req, res) {
    //sanitize the form
    req.body.post.title = req.sanitize(req.body.post.title);
    req.body.post.text = req.sanitize(req.body.post.text);
    //create a post
    Post.create(req.body.post, function(err, newPost) {
        if (err) {
            console.log(err);
        }
        else {
            //if there isn't an error, we return the created post and call the object newPost
            //set the author field in the newPost to the user making the post, and the name to the user's name
            newPost.author.id = req.user;
            newPost.author.name = req.user.name;
            newPost.save(); //save the post in the database
            //debugging printour
            console.log("New post created: " + newPost);
            //redirect to the home page
            res.redirect("/");
        }
    });
});

//render the edit page for the post, passing in the id of the post as /:post_id
//the user will be directed to this route, and a post with the matching id will be found
router.get("/editpost/:post_id", middleware.isLoggedIn, function(req, res) {
    //finds a post based on the id of the post passed in by the http request
    //for example, someone makes a request to the page with the address https://umnenergyclub-herzo175.c9users.io/viewpost/abce12345
    //abce12345 is the id of the post, the below function takes that id and uses it to find a particular post in the database
    Post.findById(req.params.post_id, function(err, foundPost) {
        if (err) {
            console.log(err);
        }
        else {
            //renders the edit post page (editpost.ejs) with the found post object
            res.render("posts/editpost", {post: foundPost});
        }
    });
});

//handles edit of the post similar to creation of a post
//since we're editing a database, it is appropriate to make a PUT request instead of a GET of POST request
router.put("/editpost/:post_id", middleware.isLoggedIn, function(req, res) {
    req.body.post.title = req.sanitize(req.body.post.title);
    req.body.post.text = req.sanitize(req.body.post.text);
    Post.findByIdAndUpdate(req.params.post_id, req.body.post, function(err, updatedPost) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Edited post: " + updatedPost);
            res.redirect("/");
        }
    });
});

//delete post via GET request
//since the delete route is hit when a person clicks a delete icon, only a GET request can be made instead of an appropriate DELETE request
router.get("/deletepost/:post_id", middleware.isLoggedIn, function(req, res) {
    //find the post first
    Post.findById(req.params.post_id, function(err, foundPost) {
        if (err) {
            console.log(err);
        }
        else {
            //check if the person making the request is the post's creator, or an officer
            if ((foundPost.author.id.equals(req.user._id) || req.user.isOfficer || req.user.isWebmaster) && req.query._method === "DELETE") {
                //then, delete the post
                foundPost.remove();
                res.redirect("/");
            }
            else {
                res.redirect("/");
            }
        }
    });
});

//finally, export the router module
module.exports = router;