const mongoose=require("mongoose");
const review = require("./review");
const schema=mongoose.Schema;
const listingSchema=new schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        filename:String,
        url:String,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:schema.Types.ObjectId,
            ref:"Review",
        }
    ]
});


listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
    await review.deleteMany({reviews:{$in:listing.reviews}});
    }
})
const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;

