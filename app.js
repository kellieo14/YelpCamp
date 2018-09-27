require('dotenv').config();

var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    passport        = require("passport"), 
    flash           = require("connect-flash"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"), 
    passportLocalMongoose = require("passport-local-mongoose"),
    Campground      = require("./models/campground.js"),
    Comment         = require("./models/comment.js"),
    async           = require("async"),
    Review          = require("./models/review.js"),
    User            = require("./models/user"); 
    // seedDB          = require("./seeds"), 


//requiring routes    
var commentRoutes   = require("./routes/comments"),
    reviewRoutes    = require("./routes/review"),
    campgroundRoutes= require("./routes/campgrounds"),
    indexRoutes     = require("./routes/index");


mongoose.connect('mongodb://localhost:27017/yelp_camp_v15', { useNewUrlParser: true }); 
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');
//seed the database:    seedDB();


//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Monster Benjamin Betty Charlie Mandy Lucy Blackberry",
    resave: false, 
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);



app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp server has started");
});