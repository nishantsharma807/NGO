var express         = require("express"),
    fileUpload      = require('express-fileupload'),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStratergy  = require("passport-local"),
    methodOverride  = require("method-override"),
    expressValidator = require('express-validator'),
    User            = require("./models/user"),
    Blog            = require("./models/blog"),
    Comment         = require("./models/comments"),
    Members         = require("./models/members"),
    Project         = require("./models/projects"),
    path            = require('path'),
    crypto          = require('crypto'),
    multer          = require('multer'),
    GridFsStorage   = require('multer-gridfs-storage'),
    Grid            = require('gridfs-stream');
    
var commentRoutes      = require("./routes/comments"),
    blogRoutes         = require("./routes/blogs"),
    indexRoutes        = require("./routes/index"),
    teamRoutes         = require("./routes/team"),
    projectRoutes      = require("./routes/projects");


mongoose.connect("mongodb://localhost/imperfect");

var app = express();

app.use(fileUpload());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(flash());


// PASSPORT CONFIG

app.use(require("express-session")({
    secret: "I am going to do this my way.. Cheers..!!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/blogs/:id/comments", commentRoutes);
app.use("/blogs", blogRoutes);
app.use("/team", teamRoutes);
app.use("/projects", projectRoutes);
app.use(indexRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The Imperfect NGO Server Has Started");
})