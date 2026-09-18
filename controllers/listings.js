const Listing=require("../models/listing.js");
const Review=require("../models/review.js");
const Wishlist=require("../models/wishlist.js");
const {deleteImage}=require("../config/cloudinary.js");
const {geocodeLocation}=require("../config/geocoding.js");

const fallbackImage={
    filename:"listingimage",
    url:"https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
};

module.exports.index=async(req,res)=>{
    const q=req.query.q?.trim();
    const minPrice=Number(req.query.minPrice)||0;
    const maxPrice=Number(req.query.maxPrice)||0;
    const sort=req.query.sort;

    const filter={};
    if(q){
        const regex=new RegExp(q,"i");
        filter.$or=[{title:regex},{location:regex},{country:regex}];
    }
    if(minPrice>0) filter.price={$gte:minPrice};
    if(maxPrice>0) filter.price={...(filter.price||{}),$lte:maxPrice};

    let query=Listing.find(filter).populate("owner");
    if(sort==="price_asc") query=query.sort({price:1});
    else if(sort==="price_desc") query=query.sort({price:-1});
    else if(sort==="newest") query=query.sort({createdAt:-1});
    else if(sort==="oldest") query=query.sort({createdAt:1});

    const allListings=await query;
    res.render("listings/index.ejs",{allListings,q,minPrice,maxPrice,sort});
}

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.createListing=async(req,res,next)=>{
    const bodyListing=req.body.listing||{};
    const newListing=new Listing(bodyListing);
    if(req.file){
        newListing.image={url:req.file.path,filename:req.file.filename};
    }else if(bodyListing.image?.url){
        newListing.image=bodyListing.image;
    }else{
        newListing.image=fallbackImage;
    }
    newListing.owner=req.user._id;
    const geometry=await geocodeLocation(`${bodyListing.location}, ${bodyListing.country}`);
    if(geometry) newListing.geometry=geometry;
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
    let savedEntry=null;
    if(req.user){
        savedEntry=await Wishlist.findOne({user:req.user._id,listing:foundListing._id});
    }
    res.render("listings/show.ejs",{
        listing:foundListing,
        isSaved:!!savedEntry,
        savedPrice:savedEntry?savedEntry.savedPrice:null,
    });
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
    const foundListing=await Listing.findById(req.params.id);
    if(!foundListing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    if(req.file){
        await deleteImage(foundListing.image?.filename);
        foundListing.image={url:req.file.path,filename:req.file.filename};
    }
    Object.assign(foundListing,req.body.listing);
    const geometry=await geocodeLocation(`${foundListing.location}, ${foundListing.country}`);
    if(geometry) foundListing.geometry=geometry;
    await foundListing.save();
    req.flash("success","Listing Updated !");
    res.redirect(`/listings/${foundListing._id}`);
};

module.exports.destroyListing=async(req,res)=>{
    const deletedListing=await Listing.findByIdAndDelete(req.params.id);
    if(!deletedListing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    await deleteImage(deletedListing.image?.filename);
    req.flash("success","Listing Deleted !");
    res.redirect("/listings");
};