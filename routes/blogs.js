var express     = require("express"),
    Blog        = require("../models/blog"),
    middleware  = require("../middleware"),
    mkdirp      = require('mkdirp'),
    fs          = require('fs-extra');

var router  = express.Router();

// All Blogs Route

router.get("/", function(req, res){
    Blog.find({}, function(err, allBlogs){
        if(err){
            console.log("Something Went Wrong!!");
        } else{
            res.render("blogs/index", {blogs: allBlogs});
        }
    });
});

// POST a New Blog Route

router.post("/", middleware.isLoggedIn ,function(req, res){
    var name = req.body.name;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username:  req.user.username
    };
    var imageFile = imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    var newBlog = new Blog({
        name: name,
        description: desc,
        image: imageFile,
        author: author});
    
    newBlog.save(function (err) {
        if (err)
            return console.log(err);

        mkdirp('public/blog_images/' + newBlog._id, function (err) {
            return console.log(err);
        });

        if (imageFile != "") {
            var projectImage = req.files.image;
            var path = 'public/blog_images/' + newBlog._id + '/' + imageFile;

            projectImage.mv(path, function (err) {
                return console.log(err);
            });
        }});
    req.flash('success', 'Blog added!');
    res.redirect("/blogs");
    
    
});

// NEW Blog Form

router.get("/new", middleware.isLoggedIn ,function(req, res){
    res.render("blogs/new");
});

// SHOW a Particular Blog

router.get("/:id", function(req, res){
    
    Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlog){
        if(err){
            console.log(err);
            req.flash('error', 'Sorry, that blog does not exist!');
        }            
        else{
            res.render("blogs/show", {blog: foundBlog}); 
        }
    });
   
});

// EDIT Blog Form

router.get("/:id/edit", middleware.checkBlogOwnership, function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            req.flash("error", err.message);
            res.redirect("/blogs");
        }
        res.render("blogs/edit", {blog: foundBlog});
    });
});

// PUT Request for Updating a Blog

router.put("/:id", middleware.checkBlogOwnership ,function(req, res){
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    
    var name = req.body.name;
    var desc = req.body.description;
    var title = req.body.title;
    var blogImage = req.body.blogImage;
    
    Blog.findById(req.params.id, function(err, updatedBlog){
        
        if(err){
            req.flash("error", err.message);
            res.redirect("/blogs");
        } else {
            updatedBlog.name = name;
            updatedBlog.description = desc;
            updatedBlog.title = title;
            
            if (imageFile) {
                updatedBlog.image = imageFile;
            }
            updatedBlog.save(function (err){
                if(err){
                    console.log(err);
                }
                
                if (imageFile) {
                    if (blogImage) {
                        fs.remove('public/blog_images/' +req.params.id + '/' + blogImage, function (err) {
                        if (err)
                            console.log(err);
                    });
                }

                var memImage = req.files.image;
                var path = 'public/blog_images/' + req.params.id + '/' + imageFile;
                updatedBlog.image = memImage;
                memImage.mv(path, function (err) {
                    return console.log(err);
                });
            }    
            req.flash("success","Successfully Updated!");
            res.redirect("/blogs/" + req.params.id);
        
            });
            
        }
    });
});

// DELETE a Blog

router.delete('/delete-blog/:id', function (req, res) {
    var id = req.params.id;
    var path = 'public/blog_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Blog.findByIdAndRemove(id, function (err) {
                console.log(err);
            });
            
            req.flash('success', 'Blog deleted!');
            res.redirect('/team');
        }
    });

});

module.exports = router;