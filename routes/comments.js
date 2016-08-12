//dependencies
var express = require("express");
var router = express.Router();

//models
var Post = require("../models/post");
var Comment = require("../models/comment");

//creates a comment
router.post("/createcomment/:post_id", function(req, res) {
    //find post
    Post.findById(req.params.post_id, function(err, foundPost) {
        if (err) {
            console.log(err);
        }
        else {
            //sanitize comment text
            req.body.comment.text = req.sanitize(req.body.comment.text);
            //create comment
            Comment.create(req.body.comment, function(err, newComment) {
                if (err) {
                    console.log(err);
                }
                else {
                    //save comment's creator
                    newComment.author.id = req.user;
                    newComment.author.name = req.user.name;
                    newComment.save();
                    //push comment into the post's comments array
                    foundPost.comments.push(newComment);
                    foundPost.save();
                    res.redirect("/");
                }
            });
        }
    });
});

//delete comment
//normally, this would be a DELETE request, but since it's accessed by clicking a link, it has to be a GET request
router.get("/deletecomment/:comment_id", function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            console.log(err);
        }
        else {
            //checks if the person making the request is the author or an officer
            //also checks if the method used to make the request was a delete method in the query (like how method override would work)
            if ((foundComment.author.id.equals(req.user._id) || req.user.isOfficer || req.user.isWebmaster) && req.query._method === "DELETE") {
                //delete the comment
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