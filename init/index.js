require("dotenv").config();
const mongoose=require("mongoose");
const initData=require("./data.js");
const listing=require("../models/listing.js");
const User=require("../models/user.js");

const mongo_url=process.env.MONGODB_URL||"mongodb://127.0.0.1:27017/wanderlust";

async function main(){
    await mongoose.connect(mongo_url);
    console.log("connected to DB");

    // Re-running this script replaces all current listings/users with fresh data.
    await listing.deleteMany({});
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

    await mongoose.connection.close();
}

main().catch((err)=>{
    console.log(err);
    process.exitCode=1;
});