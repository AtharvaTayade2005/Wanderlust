const express=require("express");
const router=express.Router({mergeParams:true});
const wrapasync=require("../utils/wrapasync.js");
const {validatereview,isLoggedIn}=require("../middleware.js");
const reviewController=require("../controllers/reviews.js");

router.route("/")
    .post(validatereview,wrapasync(reviewController.createReview));

router.route("/:reviewid")
    .delete(isLoggedIn,wrapasync(reviewController.destroyReview));

module.exports=router;