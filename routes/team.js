var express     = require("express"),
    Member      = require("../models/members"),
    middleware  = require("../middleware"),
    mkdirp      = require('mkdirp'),
    fs          = require('fs-extra');

var router  = express.Router();

// ALL CAMPGROUNDS ROUTE

router.get("/", function(req, res){
    Member.find({}, function(err, members){
        if(err){
            console.log("Something Went Wrong!!");
        } else{
            res.render("team/index", {members: members});
        }
    });
});

// POST CAMPGROUND ROUTE

router.post("/", middleware.isLoggedIn ,function(req, res){
    var name = req.body.name;
    var title = req.body.title;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username:  req.user.username
    };
    var imageFile = imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    var newMember = new Member({
        name: name,
        title: title,
        description: desc,
        image: imageFile,
        author: author});
    
    newMember.save(function (err) {
        if (err)
            return console.log(err);

        mkdirp('public/member_images/' + newMember._id, function (err) {
            return console.log(err);
        });

        if (imageFile != "") {
            var projectImage = req.files.image;
            var path = 'public/member_images/' + newMember._id + '/' + imageFile;

            projectImage.mv(path, function (err) {
                return console.log(err);
            });
        }});
    req.flash('success', 'Member added!');
    res.redirect("/team");
    
});

// NEW CAMPGROUND FORM

router.get("/new", middleware.isLoggedIn ,function(req, res){
    res.render("team/new");
});

// EDIT CAMPGROUND FORM

router.get("/:id/edit", middleware.checkMemberOwnership, function(req, res) {
    Member.findById(req.params.id, function(err, foundMember){
            res.render("team/edit", {member: foundMember});
    });
});

// PUT REQUEST FOR UPDATING FORM

router.put("/:id", middleware.checkMemberOwnership ,function(req, res){
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    
    var name = req.body.name;
    var desc = req.body.description;
    var title = req.body.title;
    var memberImage = req.body.memberImage;
    
    Member.findById(req.params.id, function(err, updatedMember){
        
        if(err){
            req.flash("error", err.message);
            res.redirect("/blogs");
        } else {
            updatedMember.name = name;
            updatedMember.description = desc;
            updatedMember.title = title;
            
            if (imageFile) {
                updatedMember.image = imageFile;
            }
            updatedMember.save(function (err){
                if(err){
                    console.log(err);
                }
                
                if (imageFile) {
                    if (memberImage) {
                        fs.remove('public/member_images/' +req.params.id + '/' + memberImage, function (err) {
                        if (err)
                            console.log(err);
                    });
                }

                var memImage = req.files.image;
                var path = 'public/member_images/' + req.params.id + '/' + imageFile;
                updatedMember.image = memImage;
                memImage.mv(path, function (err) {
                    return console.log(err);
                });
            }    
            req.flash("success","Successfully Updated!");
            res.redirect("/team");
        
            });
            
        }
    });
});

// REMOVE CAMPGROUND

router.delete("/:id", middleware.checkMemberOwnership, function(req, res){
    Member.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash('error', err.message);
            res.redirect("/team");
        } else{
            req.flash('error', 'Member deleted!');
            res.redirect("/team");
        }
    });
});


module.exports = router;