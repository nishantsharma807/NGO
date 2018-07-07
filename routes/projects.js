var express         = require("express"),
    mkdirp          = require('mkdirp'),
    fs              = require('fs-extra'),
    fileUpload      = require('express-fileupload'),
    Projects        = require("../models/projects"),
    middleware      = require("../middleware");

var router  = express.Router();

// ALL CAMPGROUNDS ROUTE

router.get("/", function(req, res){
    Projects.find({}, function(err, allProjects){
        if(err){
            console.log("Something Went Wrong!!");
        } else{
            res.render("projects/index", {projects: allProjects});
        }
    });
});

// POST CAMPGROUND ROUTE

router.post("/", middleware.isLoggedIn ,function(req, res){
    
    var name = req.body.name;
    var duration = req.body.duration;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username:  req.user.username
    };
    
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    
    var newProject = new Projects({
        name: name,
        duration: duration,
        description: desc,
        author: author,
        image: imageFile});
        
    //Projects.create(newProject);
    newProject.save(function (err) {
        if (err)
            return console.log(err);

        mkdirp('public/project_images/' + newProject._id, function (err) {
            return console.log(err);
        });

        mkdirp('public/project_images/' + newProject._id + '/gallery', function (err) {
            return console.log(err);
        });

        mkdirp('public/project_images/' + newProject._id + '/gallery/thumbs', function (err) {
            return console.log(err);
        });

        if (imageFile != "") {
            var projectImage = req.files.image;
            var path = 'public/project_images/' + newProject._id + '/' + imageFile;

            projectImage.mv(path, function (err) {
                return console.log(err);
            });
        }});
    req.flash('success', 'Project added!');
    res.redirect("/projects");
});

// NEW CAMPGROUND FORM

router.get("/new", middleware.isLoggedIn ,function(req, res){
    res.render("projects/new");
});

// SHOW PARTICULAR CAMPGROUND

router.get("/:id", function(req, res){
    
    Projects.findById(req.params.id, function(err, foundProject){
        if(err){
            console.log(err);
            req.flash('error', 'Sorry, that Project does not exist!');
        }            
        else{
            res.render("projects/show", {project: foundProject}); 
        }
    });
   
});

// EDIT CAMPGROUND FORM

router.get("/:id/edit", middleware.checkProjectOwnership, function(req, res) {
    Projects.findById(req.params.id, function(err, foundProject){
            res.render("projects/edit", {project: foundProject});
    });
});


//Add Images Form
router.get("/:id/addImages", middleware.checkProjectOwnership, function(req, res) {
    Projects.findById(req.params.id, function(err, foundProject){
            res.render("projects/addImages", {project: foundProject});
    });
});

// PUT REQUEST FOR UPDATING FORM

router.put("/:id", middleware.checkProjectOwnership ,function(req, res){
    Projects.findByIdAndUpdate(req.params.id, req.body.project, function(err, updatedProject){
        if(err){
            req.flash("error", err.message);
            res.redirect("/projects");
        } else{
            req.flash("success","Successfully Updated!");
            res.redirect("/projects/" + req.params.id);
        }
    });
});

// REMOVE CAMPGROUND

router.delete("/:id", middleware.checkProjectOwnership, function(req, res){
    Projects.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash('error', err.message);
            res.redirect("/projects");
        } else{
            req.flash('error', 'Project deleted!');
            res.redirect("/projects");
        }
    });
});


module.exports = router;