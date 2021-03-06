var express         = require("express"),
    mkdirp          = require('mkdirp'),
    fs              = require('fs-extra'),
    resizeImg       = require('resize-img'),
    Projects        = require("../models/projects"),
    middleware      = require("../middleware");

var router  = express.Router();

// GET all Projects

router.get("/", function(req, res){
    Projects.find({}, function(err, allProjects){
        if(err){
            console.log("Something Went Wrong!!");
        } else{
            res.render("projects/index", {projects: allProjects});
        }
    });
});

// POST Route for new Project

router.post("/", middleware.isAdmin ,function(req, res){
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

// GET a New Project Form

router.get("/new", middleware.isAdmin ,function(req, res){
    res.render("projects/new");
});

// GET a particular project

router.get("/:id", function(req, res){
    Projects.findById(req.params.id, function(err, foundProject){
        if(err){
            console.log(err);
            req.flash('error', 'Sorry, that Project does not exist!');
        }            
        else{
            var galleryDir = 'public/project_images/' + foundProject._id + '/gallery';
            var galleryImages = null;

            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err);
                    res.redirect('back');
                } else {
                    galleryImages = files;
                    res.render("projects/show", {project: foundProject, galleryImages: galleryImages}); 
                }
            });
        }    
    });
   
});

// GET Edit Project Form

router.get("/:id/edit", middleware.isAdmin, function(req, res) {
    Projects.findById(req.params.id, function(err, foundProject){
        if(err){
            console.log(err);
            req.flash('error', 'Sorry, that Project does not exist!');
        } else {
                var galleryDir = 'public/project_images/' + foundProject._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                        res.redirect('back');
                    } else {
                        galleryImages = files;
                        res.render('projects/edit', { galleryImages: galleryImages, project: foundProject });
                    }
                });
            }
        });   
    });

/*
 * POST Route for Project Gallery Images
 */
router.post('/:id/gallery', middleware.isAdmin ,function (req, res) {

    var projectImage = req.files.file;
    var id = req.params.id;
    var path = 'public/project_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/project_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    projectImage.mv(path, function (err) {
        if (err)
            console.log(err);

        resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then(function (buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);

});


// PUT Request for Editing a Project

router.put("/:id", middleware.isAdmin ,function(req, res){
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    
    var name = req.body.name;
    var desc = req.body.description;
    var duration = req.body.duration;
    var pimage = req.body.pimage;
    
    Projects.findById(req.params.id, function(err, updatedProject){
        
        if(err){
            req.flash("error", err.message);
            res.redirect("/projects");
        } else{
            
            updatedProject.name = name;
            updatedProject.description = desc;
            updatedProject.duration = duration;
            
            
            if (imageFile) {
                updatedProject.image = imageFile;
            }
            updatedProject.save(function (err){
                if(err){
                    console.log(err);
                }
                
                if (imageFile) {
                    if (pimage) {
                        fs.remove('public/project_images/' +req.params.id + '/' + pimage, function (err) {
                        if (err)
                            console.log(err);
                    });
                }

                var productImage = req.files.image;
                var path = 'public/project_images/' + req.params.id + '/' + imageFile;
                updatedProject.image = productImage;
                productImage.mv(path, function (err) {
                    return console.log(err);
                });
            }    
            req.flash("success","Successfully Updated!");
            res.redirect("/projects/" + req.params.id);
        
            });
            
        }
    });
});

/*
 * DELETE Project Gallery Image
 */
router.get('/delete-image/:image', middleware.isAdmin ,function (req, res) {

    var originalImage = 'public/project_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/project_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image Deleted!');
                    res.redirect('/projects/' + req.query.id + '/edit');
                }
            });
        }
    });
});

// Delete Entire Project

router.delete('/delete-project/:id', middleware.isAdmin ,function (req, res) {

    var id = req.params.id;
    var path = 'public/project_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Projects.findByIdAndRemove(id, function (err) {
                console.log(err);
            });
            
            req.flash('success', 'Project deleted!');
            res.redirect('/projects');
        }
    });

});

module.exports = router;