var mongoose = require("mongoose");

var ProjectSchema = new mongoose.Schema({
    title: String,
    text: String,
    isActive: Boolean, //states whether of not the project should be listed as active
    posted: {type: Date, default: Date.now}, //default value for the date is the time it is created
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }
});

module.exports = mongoose.model("Project", ProjectSchema);