const mongoose=require("mongoose");
const schema=mongoose.Schema;

const wishlistSchema=new schema({
    user:{
        type:schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    listing:{
        type:schema.Types.ObjectId,
        ref:"Listing",
        required:true,
    },
    savedPrice:{
        type:Number,
        required:true,
        min:0,
    },
},{
    timestamps:true,
});

wishlistSchema.index({user:1,listing:1},{unique:true});

module.exports=mongoose.model("Wishlist",wishlistSchema);