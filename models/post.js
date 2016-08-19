//mongoose is used to interact with the database
var mongoose = require("mongoose");

//each mongoose model follows a schema (even though mongoDB is a nonrelational database)
//if we update this schema, we don't have to update all the users at once
var PostSchema = new mongoose.Schema({
    title: String, //each post CAN contain a title, as long as it is a string. It is saved in the object as post.title. When saving manually, update the value (post.title = "blah") and save it (post.save())
    image: String, //image url
    video: String, //video iframe
    text: String, //text from textarea
    posted: {type: Date, default: Date.now}, //default value for the date is the time it is created
    //array of comments, which are another database model called "Comment"
    //comments can be filled in by calling .populate("comments")
    //if we don't populate the comments, then the comments array will just be a bunch of ObjectId's
    //to add a comment, you push it into the array (post.comments.push(comment)) and save it (post.save()
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    //saves the author under id
    //save author as post.author.id = req.user, post.save()
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        //for convience, so we don't have to populate the author just to get the name
        name: String
    }
});

//export the post model, it can be accessed in the database as "Post"
module.exports = mongoose.model("Post", PostSchema);