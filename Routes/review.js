const express =require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync");
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing"); 
const {reviewSchema}=require("../schema.js");
const review=require("../models/review.js");
const reviewControllers=require("../controllers/reviews.js");
const {validateReview, isLoggedIn, isReviewAuthor}=require("../middleware.js");


//review-post route
router.post("/",validateReview,isLoggedIn, wrapAsync(reviewControllers.reviewPost));

//delete review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync( reviewControllers.destroyReview));

module.exports=router;