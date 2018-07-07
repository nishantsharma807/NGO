var express     = require("express"),
    User        = require("../models/user"),
    passport    = require("passport");
    
var router  = express.Router();


router.get("/", function(req, res){
    res.render("landing");
});


// REGISTER FORM

router.get("/register", function(req, res) {
    res.render("register");
});

// REGISTER POST ROUTE

router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
            res.redirect("/blogs");
        });
    });
});

// LOGIN FORM ROUTE

router.get("/login", function(req, res) {
    res.render("login");
});

// LOGIN POST ROUTE

router.post("/login", passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: 'Welcome to Imperfect!'
}) ,function(req, res) {
    
});

//LOGOUT ROUTE

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "See you later!");
    res.redirect("/");
});


router.get("/about", function(req, res){
    res.render("about");
});

router.get("/team", function(req, res){
    res.render("team");
});

router.get("/projects", function(req, res){
    res.render("projects");
});

router.get("/inspiring-stories", function(req, res){
    res.render("stories");
});

router.get("/testimonials", function(req, res){
    res.render("testimonials");
});
// router.get("/blogs", function(req, res){
//     res.render("blogs");
// });
router.get("/join-us", function(req, res){
    res.render("join-us");
});
router.get("/contact-us", function(req, res){
    res.render("contact-us");
});


module.exports = router;