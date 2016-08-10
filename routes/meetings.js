var express = require("express");
var router = express.Router();

//models
var Meeting = require("../models/meeting");

//libraries
var middleware = require("../library/middleware");

router.get("/meetings", function(req, res) {
    Meeting.find({}, function(err, foundMeetings) {
        if (err) {
            console.log(err);
        }
        else {
            foundMeetings.reverse();
            res.render("meetings/meetings", {meetings: foundMeetings});
        }
    });
});

router.get("/createmeeting", function(req, res) {
    res.render("meetings/createmeeting");
});

router.post("/createmeeting", middleware.isLoggedIn, function(req, res) {
    req.body.meeting.title = req.sanitize(req.body.meeting.title);
    req.body.meeting.text = req.sanitize(req.body.meeting.text);
    Meeting.create(req.body.meeting, function(err, newMeeting) {
        if (err) {
            console.log(err);
        }
        else {
            newMeeting.author.id = req.user;
            newMeeting.save();
            console.log("New meeting: " + newMeeting);
            res.redirect("/");
        }
    });
});

router.get("/attendmeeting/:meeting_id", middleware.isLoggedIn, function(req, res) {
    Meeting.findById(req.params.meeting_id, function(err, foundMeeting) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundMeeting.attendeeNames.indexOf(req.user.name) > -1) {
                res.redirect("back");
            }
            else {
                foundMeeting.attendeeNames.push(req.user.name);
                foundMeeting.attendees.push(req.user);
                foundMeeting.save();
                res.redirect("/");
            }
        }
    });
});

router.get("/editmeeting/:meeting_id", middleware.isLoggedIn, function(req, res) {
    Meeting.findById(req.params.meeting_id, function(err, foundMeeting) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("meetings/editmeeting", {meeting: foundMeeting});
        }
    });
});

router.put("/editmeeting/:meeting_id", middleware.isLoggedIn, function(req, res) {
    req.body.meeting.title = req.sanitize(req.body.meeting.title);
    req.body.meeting.text = req.sanitize(req.body.meeting.text);
    Meeting.findByIdAndUpdate(req.params.meeting_id, req.body.meeting, function(err, updatedMeeting) {
        if (err) {
            console.log(err);
        }  
        else {
            console.log("Updated meeting: " + updatedMeeting);
            res.redirect("/");
        }
    });
});

router.get("/deletemeeting/:meeting_id", middleware.isLoggedIn, function(req, res) {
    Meeting.findById(req.params.meeting_id, function(err, foundMeeting) {
        if (err) {
            console.log(err);
        }
        else {
            if ((foundMeeting.author.id.equals(req.user._id) || req.user.isOfficer || req.user.isWebmaster) && req.query._method === "DELETE") {
                foundMeeting.remove();
                res.redirect("/");
            }
            else {
                res.redirect("/");
            }
        }
    });
});

module.exports = router;