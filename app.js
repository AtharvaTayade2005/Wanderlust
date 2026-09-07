const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const  mongo_url="mongodb://127.0.0.1:27017/wanderlust";
const path=require("path");
const ejsmate=require("ejs-mate");
main().then(()=>{
    console.log("connected to db");
}).catch(err=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(mongo_url);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.engine('ejs',ejsmate);
app.use(express.static(path.join(__dirname,"/public")));

// HTML forms only support GET and POST. This lets forms use
// ?_method=PUT and ?_method=DELETE for RESTful update/delete routes.
app.use((req,res,next)=>{
    const method=req.query._method?.toUpperCase();
    if(method==="PUT" || method==="DELETE"){
        req.method=method;
    }
    next();
});

app.get("/",(req,res)=>{
    res.redirect("/listings");
});
app.get("/listings",async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
});
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});
app.get("/listings/:id",async(req,res)=>{
    let{id}=req.params;
    const foundListing=await Listing.findById(id);
    if(!foundListing){
        return res.status(404).send("Listing not found");
    }
    res.render("listings/show.ejs",{listing:foundListing});
});

app.post("/listings",async (req,res)=>{
    const newlisting=new Listing(req.body.listing);
    await newlisting.save();
    res.redirect("/listings");
});

app.get("/listings/:id/edit",async (req,res)=>{
    const foundListing=await Listing.findById(req.params.id);
    if(!foundListing){
        return res.status(404).send("Listing not found");
    }
    res.render("listings/edit.ejs",{listing:foundListing});
});

app.put("/listings/:id",async (req,res)=>{
    const updatedListing=await Listing.findByIdAndUpdate(
        req.params.id,
        req.body.listing,
        {runValidators:true,new:true}
    );
    if(!updatedListing){
        return res.status(404).send("Listing not found");
    }
    res.redirect(`/listings/${updatedListing._id}`);
});

app.delete("/listings/:id",async (req,res)=>{
    const deletedListing=await Listing.findByIdAndDelete(req.params.id);
    if(!deletedListing){
        return res.status(404).send("Listing not found");
    }
    res.redirect("/listings");
});


app.get("/testlisting",async (req,res)=>{
    let samplelisting=new Listing({
        title:"My New Villa",
        description:"by the beach",
        price:1200,
        location:"Calangute,Goa",
        country:"India",
    });
    await samplelisting.save();
    console.log("sample was saved");
    res.send("sucessful testing");
});

app.use((err,req,res,next)=>{
    console.error(err);
    res.status(500).send("Something went wrong on the server.");
});

app.listen(8080,()=>{
    console.log("server is running");
});
