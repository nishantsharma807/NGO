var express     = require("express"),
    Blog  = require("../models/blog"),
    Comment     = require("../models/comments"),
    middleware  = require("../middleware");
    
var router  = express.Router({mergeParams: true});

// NEW COMMENT FORM ROUTE

router.get("/new", middleware.isLoggedIn ,function(req, res) {
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            console.log(err);
        } else{
            res.render("comments/new", {blog: blog});
        }
    });
});

// NEW COMMENT POST ROUTE

router.post("/", middleware.isLoggedIn ,function(req, res){
    Blog.findById(req.params.id, function(err, blog) {
        if(err){
            console.log(err);
        } else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    blog.comments.push(comment);
                    blog.save();
                    req.flash('success', 'Created a comment!');
                    res.redirect("/blogs/" + req.params.id);
                }
            });
        }
    });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          res.redirect("back");
      } else {
        res.render("comments/edit", {blog_id: req.params.id, comment: foundComment});
      }
   });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/blogs/" + req.params.id );
      }
   });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           req.flash('error', err.message);
           res.redirect("back");
       } else {
           req.flash('error', 'Comment deleted!');
           res.redirect("/blogs/" + req.params.id);
       }
    });
});

module.exports = router;