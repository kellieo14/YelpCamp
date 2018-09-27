var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
// var async = require("async");
// var nodemailer = require("nodemailer");
// var crypto = require("crypto");


//ROOT ROUTE
router.get("/", function(req, res){
    res.render("landing");
});


//=======================
//AUTH ROUTES
//=======================

//show register form
router.get("/register", function(req, res){
    res.render("register", {page: 'register'});
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User(
        {
            username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
        }
    );
    if (req.body.adminCode === "lindyhop"){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            // req.flash("error", err.message);
            // return res.redirect("/register");
            console.log(err);
            return res.render("register", {error: err.message});
        } 
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    });//User.register provided by passport-local-mongoose
});

//show login form
router.get("/login", function(req, res){
    res.render("login", {page: 'login'});
});

//handle login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds", 
        failureRedirect: "/login"
    }), function(req, res){

});


//logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged Out");
    res.redirect("/campgrounds");
});

// //forgot password
// router.get("/forgot", function(req, res){
//     res.render("forgot");
// });


//user profiles
router.get("/users/:id", function(req, res){
   User.findById(req.params.id, function(err, foundUser){
       if(err){
           req.flash("error", "Something went wrong...");
           res.redirect("/");
       } else {
           Campground.find().where("author.id").equals(foundUser._id).exec(function(err, foundCampgrounds){
                if(err){
                    req.flash("error", "Something went wrong...");
                    res.redirect("/");
                }  
                res.render("users/show", {user: foundUser, campgrounds: foundCampgrounds});
           });
       }
   }); 
});


module.exports = router;