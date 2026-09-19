const mongoose=require("mongoose");

const MONGODB_URL=process.env.MONGODB_URL||"mongodb://127.0.0.1:27017/wanderlust";

let connected=false;

async function connectDB(){
    if(connected) return;
    await mongoose.connect(MONGODB_URL);
    connected=true;
}

module.exports={connectDB,MONGODB_URL};