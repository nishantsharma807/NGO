var express     = require("express"),
    Member      = require("../models/members"),
    middleware  = require("../middleware"),
    mkdirp      = require('mkdirp'),
    fs          = require('fs-extra');

var router  = express.Router();

// ALL Team Members

router.get("/", function(req, res){
    Member.find({}, function(err, members){
        if(err){
            console.log("Something Went Wrong!!");
        } else{
            res.render("team/index", {members: members});
        }
    });
});

// POST a New Team Member

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

// NEW Team Member Form

router.get("/new", middleware.isLoggedIn ,function(req, res){
    res.render("team/new");
});

// EDIT a Team Member Form

router.get("/:id/edit", middleware.checkMemberOwnership, function(req, res) {
    Member.findById(req.params.id, function(err, foundMember){
        if(err){
            req.flash("error", err);
            res.redirect("/team");
        }
        res.render("team/edit", {member: foundMember});
    });
});

// PUT Request for Updating a Team Member

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

//DELETE a Team Member

router.delete('/delete-member/:id', function (req, res) {

    var id = req.params.id;
    var path = 'public/member_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Member.findByIdAndRemove(id, function (err) {
                console.log(err);
            });
            
            req.flash('success', 'Member deleted!');
            res.redirect('/team');
        }
    });

});

module.exports = router;