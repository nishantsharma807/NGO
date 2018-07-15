var Comment = require("../models/comments");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.isAdmin = function(req, res, next) {
 if(req.isAuthenticated()){
    if(req.user.isAdmin) {
        next();
    } else {
        req.flash('error', 'You don\'t have permission to do that!');
        res.redirect("back");
    }
 }
};

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
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'You must be signed in to do that!');
    res.redirect("/login");
};

module.exports = middlewareObj;