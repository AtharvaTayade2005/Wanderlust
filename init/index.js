require("dotenv").config();
const mongoose=require("mongoose");
const initData=require("./data.js");
const listing=require("../models/listing.js");
const User=require("../models/user.js");
const Review=require("../models/review.js");
const Wishlist=require("../models/wishlist.js");

const mongo_url=process.env.MONGODB_URL||"mongodb://127.0.0.1:27017/wanderlust";

async function main(){
    await mongoose.connect(mongo_url);
    console.log("connected to DB");

    // Re-running this script replaces all current listings/users with fresh data.
    await listing.deleteMany({});
    await Review.deleteMany({});
    await Wishlist.deleteMany({});
    await User.deleteMany({});

    const demoUser=new User({
        email:"demo@wanderlust.com",
        username:"demouser",
    });
    const registeredUser=await User.register(demoUser,"demopassword");

    let data=initData.data.map((obj)=>({...obj,owner:registeredUser._id}));
    const {geocodeLocation}=require("../config/geocoding.js");
    data=await Promise.all(data.map(async(item)=>{
        const geometry=await geocodeLocation(`${item.location}, ${item.country}`);
        return geometry?{...item,geometry}:item;
    }));
    await listing.insertMany(data);
    console.log("data was initialized with owner:",registeredUser.username,"maps:",data.filter(i=>i.geometry).length);

    const seededReviews=await listing.find();
    const ratingPool=[4,4,5,5,5];
    const commentPool=[
        "Fantastic stay! Clean, responsive host, great value for money.",
        "Beautiful place, exactly as pictured. Would book again.",
        "Loved the location — peaceful yet close to everything. 5 stars.",
        "Smooth booking, spotless rooms and a warm welcome. Recommended.",
        "Great value, quick check-in and the photos don't lie. Highly recommend.",
        "Perfect weekend getaway. The view from the room alone is worth it.",
    ];
    const seededList=[];
    for(const l of seededReviews){
        const n=2+Math.floor(Math.random()*3);
        for(let i=0;i<n;i++){
            const rating=ratingPool[Math.floor(Math.random()*ratingPool.length)];
            const comment=commentPool[Math.floor(Math.random()*commentPool.length)];
            const r=new Review({rating,comment,author:registeredUser._id});
            seededList.push(r);
            l.reviews.push(r._id);
        }
        await l.save();
    }
    await Review.insertMany(seededList);
    console.log("seeded reviews:",seededList.length);

    await mongoose.connection.close();
}

main().catch((err)=>{
    console.log(err);
    process.exitCode=1;
});