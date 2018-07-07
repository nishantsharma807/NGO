var express     = require("express"),
    Blog        = require("../models/blog"),
    middleware  = require("../middleware");

var router  = express.Router();

// ALL CAMPGROUNDS ROUTE

router.get("/", function(req, res){
    Blog.find({}, function(err, allBlogs){
        if(err){
            console.log("Something Went Wrong!!");
        } else{
            res.render("blogs/index", {blogs: allBlogs});
        }
    });
});

// POST CAMPGROUND ROUTE

router.post("/", middleware.isLoggedIn ,function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username:  req.user.username
    }
    var newBlog = {name: name, image: image, description: desc, author: author};
    Blog.create(newBlog);
    res.redirect("/blogs");
    
});

// NEW CAMPGROUND FORM

router.get("/new", middleware.isLoggedIn ,function(req, res){
    res.render("blogs/new");
});

// SHOW PARTICULAR CAMPGROUND

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

// EDIT CAMPGROUND FORM

router.get("/:id/edit", middleware.checkBlogOwnership, function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
            res.render("blog/edit", {blog: foundBlog});
    });
});

// PUT REQUEST FOR UPDATING FORM

router.put("/:id", middleware.checkBlogOwnership ,function(req, res){
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            req.flash("error", err.message);
            res.redirect("/blogs");
        } else{
            req.flash("success","Successfully Updated!");
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// REMOVE CAMPGROUND

router.delete("/:id", middleware.checkBlogOwnership, function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash('error', err.message);
            res.redirect("/blogs");
        } else{
            req.flash('error', 'Blog deleted!');
            res.redirect("/blogs");
        }
    });
});


module.exports = router;