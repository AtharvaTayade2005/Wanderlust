const express=require("express");
const router=express.Router({mergeParams:true});
const wrapasync=require("../utils/wrapasync.js");
const expresserror=require("../utils/expresserror.js");
const {reviewschema}=require("../schema.js");
const Listing=require("../models/listing.js");
const review=require("../models/review.js");

const validatereview=(req,res,next)=>{
    let {error}=reviewschema.validate(req.body);
    if(error){
        let errmsg=error.details.map((el)=>el.message).join(",");
        throw new expresserror(400,errmsg);
    }
    else{
        next();
    }
}

router.post("/",validatereview,wrapasync(async(req,res)=>{
    let listing= await Listing.findById(req.params.id);
    let newreview=new review(req.body.review);
    listing.reviews.push(newreview);
    await newreview.save();
    await listing.save();
    req.flash("success","New Review Created");
    res.redirect(`/listings/${listing._id}`);
}));

router.delete("/:reviewid",wrapasync(async(req,res)=>{
    let{id,reviewid}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewid}});
    await review.findByIdAndDelete(reviewid);
        req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports=router;