var mongoose = require("mongoose");
var Comment = require("./comment");
var Review = require("./review");


var campgroundSchema = new mongoose.Schema({
   name: String,
   price: String, 
   image: String,
   imageId: String, 
   description: String,
   createdAt: { type: Date, default: Date.now },
   author: {
        id: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ], 
   reviews: [
       {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Review"
       }
    ],
    rating: {
        type: Number, 
        default: 0
    }
});

module.exports = mongoose.model("Campground", campgroundSchema);

// var Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create(
//     {
//         name: "Granite Hill",
//         image: "https://farm7.staticflickr.com/6139/5963108558_5f3ff43fef.jpg",
//         description: "This is a large granite hill, no bathrooms. No water. Beautiful granite."
//     }, function(err, campground){
//         if(err) {
//             console.log(err);
//         } else {
//             console.log("New Campground: ");
//             console.log(campground);
//         }
//     });

    // var campgrounds = [
    //     {name: "Granite Hill", image: "https://farm4.staticflickr.com/3136/3679145756_8e639e043a.jpg"},
    //     {name: "Salmon Creek", image: "https://farm7.staticflickr.com/6139/5963108558_5f3ff43fef.jpg"},
    //     {name: "Mountain Goat's Rest", image: "https://pixabay.com/get/e83db40e28fd033ed1584d05fb1d4e97e07ee3d21cac104496f2c17da2edb1b8_340.jpg"}
    //     ]

// module.exports = mongoose.model("Campground", campgroundSchema);

//5ba32a40a8dca00abd2a5b22