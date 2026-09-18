const Listing=require("../models/listing.js");
const Review=require("../models/review.js");

module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({}).populate("owner");
    res.render("listings/index.ejs",{allListings});
}

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.createListing=async(req,res,next)=>{
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created");
    res.redirect("/listings");
};

module.exports.showListing=async(req,res)=>{
    let{id}=req.params;
    const foundListing=await Listing.findById(id)
        .populate("owner")
        .populate("reviews");
    if(!foundListing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    await Review.populate(foundListing.reviews,{path:"author"});
    res.render("listings/show.ejs",{listing:foundListing});
};

module.exports.renderEditForm=async(req,res)=>{
    const foundListing=await Listing.findById(req.params.id);
    if(!foundListing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing:foundListing});
};

module.exports.updateListing=async(req,res)=>{
    const updatedListing=await Listing.findByIdAndUpdate(
        req.params.id,
        req.body.listing,
        {runValidators:true,new:true}
    );
    if(!updatedListing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    req.flash("success","Listing Updated !");
    res.redirect(`/listings/${updatedListing._id}`);
};

module.exports.destroyListing=async(req,res)=>{
    const deletedListing=await Listing.findByIdAndDelete(req.params.id);
    if(!deletedListing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    req.flash("success","Listing Deleted !");
    res.redirect("/listings");
};