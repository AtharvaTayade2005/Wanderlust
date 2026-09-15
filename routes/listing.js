const express=require("express");
const router=express.Router();
const wrapasync=require("../utils/wrapasync.js");
const {listingSchema: schema, reviewschema}=require("../schema.js");
const expresserror=require("../utils/expresserror.js");
const Listing=require("../models/listing.js");
const validatelisting=(req,res,next)=>{
    let {error}=schema.validate(req.body);
    if(error){
        let errmsg=error.details.map((el)=>el.message).join(",");
        throw new expresserror(400,errmsg);
    }
    else{
        next();
    }
}
router.get("/",async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
});
router.post("/",validatelisting,wrapasync(async(req,res,next)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

router.get("/new",(req,res)=>{
    res.render("listings/new.ejs");
});
router.get("/:id",async(req,res)=>{
    let{id}=req.params;
    const foundListing=await Listing.findById(id).populate("reviews");
    if(!foundListing){
        return res.status(404).send("Listing not found");
    }
    res.render("listings/show.ejs",{listing:foundListing});
});
router.get("/:id/edit",wrapasync(async (req,res)=>{
    const foundListing=await Listing.findById(req.params.id);
    if(!foundListing){
        return res.status(404).send("Listing not found");
    }
    res.render("listings/edit.ejs",{listing:foundListing});
}));

router.put("/:id",wrapasync(async (req,res)=>{
    const updatedListing=await Listing.findByIdAndUpdate(
        req.params.id,
        req.body.listing,
        {runValidators:true,new:true}
    );
    if(!updatedListing){
        return res.status(404).send("Listing not found");
    }
    res.redirect(`/listings/${updatedListing._id}`);
}));

router.delete("/:id",async (req,res)=>{
    const deletedListing=await Listing.findByIdAndDelete(req.params.id);
    if(!deletedListing){
        return res.status(404).send("Listing not found");
    }
    res.redirect("/listings");
});

module.exports=router;