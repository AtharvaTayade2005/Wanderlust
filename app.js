const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const wrapasync=require("./utils/wrapasync.js");
const expresserror=require("./utils/expresserror.js");
const {listingSchema: schema, reviewschema}=require("./schema.js");
const  mongo_url="mongodb://127.0.0.1:27017/wanderlust";
const path=require("path");
const ejsmate=require("ejs-mate");
const review=require("./models/review.js");
const listingRouter=require("./routes/listing.js");
const ReviewRouter=require("./routes/review.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js");
const userRouter=require("./routes/user.js");
const sessionOptions={
    secret:"mysecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};
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
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
});

app.use("/",userRouter);
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",ReviewRouter);

app.get("/demouser",async(req,res)=>{

    let fakeuser=new User({
        email:"student@gmail.com",
        username:"delta-student",
    });
    let registereduser=await User.register(fakeuser,"helloworld");
    res.send(registereduser);

})
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
//reviews

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
    res.status(err.statusCode||500).render("listings/error.ejs",{err});
});
app.use((req,res,next)=>{
    next(new expresserror(404,"Page not found!"));
});
app.listen(8080,()=>{
    console.log("server is running");
});
