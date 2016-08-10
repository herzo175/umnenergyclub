var express = require("express");
var router = express.Router();

//models
var Post = require("../models/post");

//libraries
var middleware = require("../library/middleware");

router.get("/createpost", middleware.isLoggedIn, function(req, res) {
    res.render("posts/createpost");
});

router.post("/createpost", middleware.isLoggedIn, function(req, res) {
    req.body.post.title = req.sanitize(req.body.post.title);
    req.body.post.text = req.sanitize(req.body.post.text);
    Post.create(req.body.post, function(err, newPost) {
        if (err) {
            console.log(err);
        }
        else {
            newPost.author.id = req.user;
            newPost.author.name = req.user.name;
            newPost.save();
            console.log("New post created: " + newPost);
            res.redirect("/");
        }
    });
});

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

router.put("/editpost/:post_id", middleware.isLoggedIn, function(req, res) {
    req.body.post.title = req.sanitize(req.body.post.title);
    req.body.post.text = req.sanitize(req.body.post.text);
    Post.findByIdAndUpdate(req.params.post_id, req.body.post, function(err, updatedPost) {
        if (err) {
            console.log(err);
        }
        else {
            updatedPost.author.id = req.user;
            updatedPost.save();
            console.log("Edited post: " + updatedPost);
            res.redirect("/");
        }
    });
});

router.get("/deletepost/:post_id", middleware.isLoggedIn, function(req, res) {
    Post.findById(req.params.post_id, function(err, foundPost) {
        if (err) {
            console.log(err);
        }
        else {
            if ((foundPost.author.id.equals(req.user._id) || req.user.isOfficer || req.user.isWebmaster) && req.query._method === "DELETE") {
                foundPost.remove();
                res.redirect("/");
            }
            else {
                res.redirect("/");
            }
        }
    });
});

module.exports = router;