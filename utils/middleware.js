const Listing=require("../models/listing.js");
const {listingSchema: schema, reviewschema}=require("../schema.js");
const expresserror=require("./expresserror.js");
const {Types}=require("mongoose");

module.exports.validatelisting=(req,res,next)=>{
    let {error}=schema.validate(req.body);
    if(error){
        let errmsg=error.details.map((el)=>el.message).join(",");
        throw new expresserror(400,errmsg);
    }
    else{
        next();
    }
}

module.exports.validatereview=(req,res,next)=>{
    let {error}=reviewschema.validate(req.body);
    if(error){
        let errmsg=error.details.map((el)=>el.message).join(",");
        req.flash("error",errmsg);
        return res.redirect(`/listings/${req.params.id}`);
    }
    else{
        next();
    }
}

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner=async(req,res,next)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    if(!listing.owner || !req.user || !listing.owner.equals(req.user._id)){
        req.flash("error","You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isValidId=(req,res,next)=>{
    if(!Types.ObjectId.isValid(req.params.id)){
        req.flash("error","Invalid id");
        return res.redirect("/listings");
    }
    next();
};