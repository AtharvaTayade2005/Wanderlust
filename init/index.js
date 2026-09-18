const mongoose=require("mongoose");
const initData=require("./data.js");
const listing=require("../models/listing.js");
const User=require("../models/user.js");

const mongo_url="mongodb://127.0.0.1:27017/wanderlust";

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

    const data=initData.data.map((obj)=>({...obj,owner:registeredUser._id}));
    await listing.insertMany(data);
    console.log("data was initialized with owner:",registeredUser.username);

    await mongoose.connection.close();
}

main().catch((err)=>{
    console.log(err);
    process.exitCode=1;
});