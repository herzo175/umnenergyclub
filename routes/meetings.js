//dependencies
var express = require("express");
var router = express.Router();

//models
var Meeting = require("../models/meeting");

//libraries
var middleware = require("../library/middleware");

//return all meetings to the meetings page when a GET request to /meetings is made
router.get("/meetings", function(req, res) {
    Meeting.find({}, function(err, foundMeetings) {
        if (err) {
            console.log(err);
        }
        else {
            //reverse the order of the meetings so the latest is first in the array
            foundMeetings.reverse();
            res.render("meetings/meetings", {meetings: foundMeetings});
        }
    });
});

//get create meeting page
router.get("/createmeeting", function(req, res) {
    res.render("meetings/createmeeting");
});

//handle creation of meeting
router.post("/createmeeting", middleware.isLoggedIn, function(req, res) {
    //sanitize text
    req.body.meeting.title = req.sanitize(req.body.meeting.title);
    req.body.meeting.text = req.sanitize(req.body.meeting.text);
    Meeting.create(req.body.meeting, function(err, newMeeting) {
        if (err) {
            console.log(err);
        }
        else {
            //set up author
            newMeeting.author.id = req.user;
            newMeeting.save();
            console.log("New meeting: " + newMeeting);
            res.redirect("/");
        }
    });
});

//checks in a meeting attendee
router.get("/attendmeeting/:meeting_id", middleware.isLoggedIn, function(req, res) {
    Meeting.findById(req.params.meeting_id, function(err, foundMeeting) {
        if (err) {
            console.log(err);
        }
        else {
            //if a person has attended the meeting already and somehow manages to make the request,
            //redirects the person if they already checked in
            if (foundMeeting.attendeeNames.indexOf(req.user.name) > -1) {
                res.redirect("back");
            }
            else {
                //pushes the user and their name in to the meeting
                foundMeeting.attendeeNames.push(req.user.name);
                foundMeeting.attendees.push(req.user);
                foundMeeting.save();
                res.redirect("/");
            }
        }
    });
});

//get edit meeting page
router.get("/editmeeting/:meeting_id", middleware.isLoggedIn, middleware.isOfficer, function(req, res) {
    Meeting.findById(req.params.meeting_id, function(err, foundMeeting) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("meetings/editmeeting", {meeting: foundMeeting});
        }
    });
});

//handle edit of meeting
router.put("/editmeeting/:meeting_id", middleware.isLoggedIn, middleware.isOfficer, function(req, res) {
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

//deletes meeting via get request
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