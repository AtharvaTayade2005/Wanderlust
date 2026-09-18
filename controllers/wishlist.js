const Listing=require("../models/listing.js");
const Wishlist=require("../models/wishlist.js");

module.exports.toggleWishlist=async(req,res)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing not found");
        return res.redirect("/listings");
    }
    const existing=await Wishlist.findOne({user:req.user._id,listing:listing._id});
    if(existing){
        await existing.deleteOne();
        req.flash("success","Removed from saved homes");
    }else{
        await Wishlist.create({
            user:req.user._id,
            listing:listing._id,
            savedPrice:listing.price,
        });
        req.flash("success","Saved to your wishlist");
    }
    res.redirect(req.get("Referrer")||"/wishlist");
};

module.exports.myWishlist=async(req,res)=>{
    const entries=await Wishlist.find({user:req.user._id})
        .populate("listing")
        .sort({createdAt:-1});
    const wishlist=entries
        .filter(e=>e.listing)
        .map((e)=>{
            const current=e.listing.price||0;
            const saved=e.savedPrice||0;
            const diff=Math.round(current-saved);
            return {
                listing:e.listing,
                savedPrice:saved,
                savedAt:e.createdAt,
                drop:diff<0?Math.abs(diff):0,
                rise:diff>0?diff:0,
            };
        });
    res.render("wishlist/index.ejs",{wishlist});
};