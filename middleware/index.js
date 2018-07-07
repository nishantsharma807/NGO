var Campground = require("../models/blog");
var Comment = require("../models/comments");
var Member = require("../models/members");
var Project = require("../models/projects");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkBlogOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundBlog){
           if(err){
               req.flash('error', 'Sorry, that Blog does not exist!');
               res.redirect("back");
           }  else {
               // does user own the blog?
            if(foundBlog.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash('error', 'You don\'t have permission to do that!');
                res.redirect("back");
            }
           }
        });
    } else {
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               req.flash('error', 'Sorry, that Comment does not exist!');
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash('error', 'You don\'t have permission to do that!');
                res.redirect("back");
            }
           }
        });
    } else {
        res.redirect("back");
    }
}

middlewareObj.checkMemberOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Member.findById(req.params.id, function(err, foundMember){
           if(err){
               req.flash('error', 'Sorry, that Member does not exist!');
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundMember.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash('error', 'You don\'t have permission to do that!');
                res.redirect("back");
            }
           }
        });
    } else {
        res.redirect("back");
    }
}

middlewareObj.checkProjectOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Project.findById(req.params.id, function(err, foundProject){
           if(err){
               req.flash('error', 'Sorry, that Project does not exist!');
               res.redirect("back");
           }  else {
               // does user own the blog?
            if(foundProject.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash('error', 'You don\'t have permission to do that!');
                res.redirect("back");
            }
           }
        });
    } else {
        res.redirect("back");
    }
}



middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'You must be signed in to do that!');
    res.redirect("/login");
}

module.exports = middlewareObj;