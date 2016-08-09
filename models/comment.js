var mongoose = require("mongoose");

var CommentSchema = new mongoose.Schema({
    text: String,
    posted: {type: Date, default: Date.now}, //default value for the date is the time it is created
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        name: String
    }
});

module.exports = mongoose.model("Comment", CommentSchema);