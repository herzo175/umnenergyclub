var express = require("express");
var router = express.Router();

//models
var Post = require("../models/post");
var Comment = require("../models/comment");

router.post("/createcomment/:post_id", function(req, res) {
    Post.findById(req.params.post_id, function(err, foundPost) {
        if (err) {
            console.log(err);
        }
        else {
            Comment.create(req.body.comment, function(err, newComment) {
                if (err) {
                    console.log(err);
                }
                else {
                    newComment.author.id = req.user;
                    newComment.author.name = req.user.name;
                    newComment.save();
                    foundPost.comments.push(newComment);
                    foundPost.save();
                    res.redirect("/");
                }
            });
        }
    });
});

router.get("/deletecomment/:comment_id", function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            console.log(err);
        }
        else {
            if ((foundComment.author.id.equals(req.user._id) || req.user.isOfficer || req.user.isWebmaster) && req.query._method === "DELETE") {
                foundComment.remove();
                res.redirect("/");
            }
            else {
                res.redirect("/");
            }
        }
    });
});

module.exports = router;