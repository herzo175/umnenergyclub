var mongoose = require("mongoose");

var MeetingSchema = new mongoose.Schema({
    title: String,
    text: String,
    posted: {type: Date, default: Date.now}, //default value for the date is the time it is created
    attendeeNames: [String],
    attendees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }    
    ],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }
});

module.exports = mongoose.model("Meeting", MeetingSchema);