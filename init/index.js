const mongoose=require("mongoose");
const initData=require("./data.js");
const listing=require("../models/listing.js");

const mongo_url="mongodb://127.0.0.1:27017/wanderlust";

async function main(){
    await mongoose.connect(mongo_url);
    console.log("connected to DB");

    // Re-running this script replaces all current listings with data.js.
    await listing.deleteMany({});
    await listing.insertMany(initData.data);
    console.log("data was initialized");

    await mongoose.connection.close();
}

main().catch((err)=>{
    console.log(err);
    process.exitCode=1;
});
