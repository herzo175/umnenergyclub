//dependencies
var express = require("express");
var router = express.Router();

//models
var Project = require("../models/project");

//libraries
var middleware = require("../library/middleware");

//renders the projects page, finds all projects in the database
router.get("/projects", function(req, res) {
    Project.find({}, function(err, foundProjects) {
        if (err) {
            console.log(err);
        }
        else {
            //reverse order of the projects
            foundProjects.reverse();
            res.render("projects/projects", {projects: foundProjects});
        }
    });
});

//renders the create project page
//checks if the person making the request is an officer or not
router.get("/createproject", middleware.isLoggedIn, middleware.isOfficer, function(req, res) {
    res.render("projects/createproject");
});

//handles creation of a new project
router.post("/createproject", middleware.isLoggedIn, middleware.isOfficer, function(req, res) {
    req.body.project.title = req.sanitize(req.body.project.title);
    req.body.project.text = req.sanitize(req.body.project.text);
    Project.create(req.body.project, function(err, newProject) {
        if (err) {
            console.log(err);
        }
        else {
            //by default, make the active field in the database equal to true
            newProject.isActive = true;
            newProject.author.id = req.user;
            newProject.save();
            console.log("New project: " + newProject);
            res.redirect("/");
        }
    });
});

//render the edit page
router.get("/editproject/:project_id", middleware.isLoggedIn, middleware.isOfficer, function(req, res) {
    Project.findById(req.params.project_id, function(err, foundProject) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("projects/editproject", {project: foundProject});
        }
    });
});

//handle the edit
router.put("/editproject/:project_id", middleware.isLoggedIn, middleware.isOfficer, function(req, res) {
    req.body.project.title = req.sanitize(req.body.project.title);
    req.body.project.text = req.sanitize(req.body.project.text);
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

//change the status of a project from active to inactive
//like a deletion, this is handled by clicking an icon
//therefore, it must also be a GET request
router.get("/toggleproject/:project_id", middleware.isLoggedIn, middleware.isOfficer, function(req, res) {
    Project.findById(req.params.project_id, function(err, foundProject) {
        if (err) {
            console.log(err);
        }
        else {
            //once a project is found, the status of it is changed to the opposite status
            foundProject.isActive = !foundProject.isActive;
            foundProject.save();
            res.redirect("/projects");
        }
    });
});

//handle delete project when icon is clicked
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