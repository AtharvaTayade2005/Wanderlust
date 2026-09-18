const Listing=require("../models/listing.js");
const review=require("../models/review.js");

module.exports.createReview=async(req,res)=>{
    let listing= await Listing.findById(req.params.id);
    let newreview=new review(req.body.review);
    listing.reviews.push(newreview);
    await newreview.save();
    await listing.save();
    req.flash("success","New Review Created");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview=async(req,res)=>{
    let{id,reviewid}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewid}});
    await review.findByIdAndDelete(reviewid);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
};