var express = require("express");
var router = express.Router();

//models
var Project = require("../models/project");

//libraries
var middleware = require("../library/middleware");

router.get("/projects", function(req, res) {
    Project.find({}, function(err, foundProjects) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("projects/projects", {projects: foundProjects});
        }
    });
});

router.get("/createproject", middleware.isLoggedIn, middleware.isLoggedIn, function(req, res) {
    res.render("projects/createproject");
});

router.post("/createproject", middleware.isLoggedIn, function(req, res) {
    Project.create(req.body.project, function(err, newProject) {
        if (err) {
            console.log(err);
        }
        else {
            newProject.isActive = true;
            newProject.author.id = req.user;
            newProject.save();
            console.log("New project: " + newProject);
            res.redirect("/");
        }
    });
});

router.get("/editproject/:project_id", middleware.isLoggedIn, function(req, res) {
    Project.findById(req.params.project_id, function(err, foundProject) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("projects/editproject", {project: foundProject});
        }
    });
});

router.put("/editproject/:project_id", middleware.isLoggedIn, function(req, res) {
    Project.findByIdAndUpdate(req.params.project_id, req.body.project, function(err, updatedProject) {
        if (err) {
            console.log(err);
        }  
        else {
            console.log("Updated project: " + updatedProject);
            res.redirect("/");
        }
    });
});

router.get("/toggleproject/:project_id", middleware.isLoggedIn, function(req, res) {
    Project.findById(req.params.project_id, function(err, foundProject) {
        if (err) {
            console.log(err);
        }
        else {
            foundProject.isActive = !foundProject.isActive;
            foundProject.save();
            res.redirect("/projects");
        }
    });
});

router.get("/deleteproject/:project_id", middleware.isLoggedIn, function(req, res) {
    Project.findById(req.params.project_id, function(err, foundProject) {
        if (err) {
            console.log(err);
        }
        else {
            if ((foundProject.author.id.equals(req.user._id) || req.user.isOfficer || req.user.isWebmaster) && req.query._method === "DELETE") {
                foundProject.remove();
                res.redirect("back");
            }
            else {
                res.redirect("back");
            }
        }
    });
});

module.exports = router;