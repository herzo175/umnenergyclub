var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    oauthId: String,
    name: String,
    //phoneNumber: String,
    email: String,
    bio: String,
    role: String,
    photo: String,
    isOfficer: Boolean,
    isWebmaster: Boolean
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);