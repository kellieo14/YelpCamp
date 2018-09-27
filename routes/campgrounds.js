var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
// var request = require("request");
// var User = require("../models/user");
var multer = require('multer');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Comment = require("../models/comment");
var Review = require("../models/review");

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'kad1402', 
  api_key: 782697593235889,
  api_secret: process.env.CLOUDINARY_API_SECRET
});



//INDEX
router.get("/", function(req, res){
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        Campground.find({name: regex}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else{
            if (allCampgrounds.length < 1){
                noMatch = "No campgrounds match that query, please try again.";
            } 
                res.render("campgrounds/index", {campgrounds: allCampgrounds, noMatch: noMatch});
        }
    });
    } else {
    Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds){
        Campground.count().exec(function (err, count) {
            if(err){
                console.log(err);
            } else{
                res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch, current: pageNumber, pages: Math.ceil(count/ perPage)});
            }
        });
    });
        // res.render("campgrounds", {campgrounds: campgrounds});
    }
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the campground object under image property
      req.body.campground.image = result.secure_url;
      // add image's public_id to campground object
      req.body.campground.imageId = result.public_id;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
// router.get("/:id", function(req, res){
//     Campground.findById(req.params.id).populate("comments").exec( function(err, foundCampground){
//         if(err || !foundCampground){
//             req.flash("error", "Campground not found.");
//             res.redirect("back");
//         } else {
//             // console.log(foundCampground);
//             res.render("campgrounds/show", {campground: foundCampground}); 
//         }
//     });
// });

// SHOW - shows more info about one campground
router.get("/:id", function (req, res) {
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT 
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    delete req.body.campground.rating;
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
        res.render("campgrounds/edit", {campground: foundCampground});
    }
    });
});


//UPDATE
// router.put("/:id", upload.single("image"), middleware.checkCampgroundOwnership, function(req, res){
//     Campground.findById(req.params.id, async function(err, campground){
//         if(err){
//             req.flash("error", err.message);
//             res.redirect("back");
//         } else {
//             if(req.file) {
//                 try {
//                     await cloudinary.v2.uploader.destroy(campground.imageId);
//                     var result = await cloudinary.v2.uploader.upload(req.file.path);
//                     campground.imageId = result.public_id;
//                     campground.image = result.secure_url;
//                 } catch (err) {
//                     req.flash("error", err.message);
//                     return res.redirect("back"); 
//                 }
//             }
//             campground.name = req.body.campground.name;
//             campground.description = req.body.campground.description;
//             campground.save();
//             req.flash("success", "Successfully Updated");
//             res.redirect("/campgrounds/" + campground._id);
//         }     
//     });
// });

router.put("/:id", upload.single('image'), function(req, res){
    Campground.findById(req.params.id, async (function (err, campground) {
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await (cloudinary.v2.uploader.destroy(campground.imageId));
                  var result = await (cloudinary.v2.uploader.upload(req.file.path));
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            campground.name = req.body.campground.name;
            campground.description = req.body.campground.description;
            campground.price = req.body.campground.price;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    }));
});


//DESTROY
// router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
//     Campground.findById(req.params.id, async (function(err, campground){
//         if (err){
//             res.redirect("/campgrounds");
//         } 
//         try {
//             await (cloudinary.v2.uploader.destroy(campground.imageId));
//             campground.remove();
//             req.flash("success", "Campground successfully removed.");
//             res.redirect("/campgrounds");
//         } catch (err) {
//             if(err) {
//                 req.flash("error", err.message);
//                 res.redirect("back");
//             }
//         }
//     }));
// });


router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, async (function(err, campground){
        if (err){
            res.redirect("/campgrounds");
        } 
        try {
            await (cloudinary.v2.uploader.destroy(campground.imageId));
            Comment.remove({"_id": {$in: campground.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                Review.remove({"_id": {$in: campground.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/campgrounds");
                    }
                });
            });
            campground.remove();
            req.flash("success", "Campground successfully removed.");
            res.redirect("/campgrounds");
        } catch (err) {
            if(err) {
                req.flash("error", err.message);
                res.redirect("back");
            }
        }
    }));
});
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^?|#\s]/g, "\\$&");
}


module.exports = router;

