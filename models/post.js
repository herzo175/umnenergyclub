var mongoose = require("mongoose");

var PostSchema = new mongoose.Schema({
    title: String,
    images: [String],
    text: String,
    posted: {type: Date, default: Date.now}, //default value for the date is the time it is created
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        name: String
    }
});

module.exports = mongoose.model("Post", PostSchema);