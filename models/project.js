var mongoose = require("mongoose");

var ProjectSchema = new mongoose.Schema({
    title: String,
    text: String,
    isActive: Boolean,
    posted: {type: Date, default: Date.now}, //default value for the date is the time it is created
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }
});

module.exports = mongoose.model("Project", ProjectSchema);