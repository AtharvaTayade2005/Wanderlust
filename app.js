const express=require("express");
require("dotenv").config();
const app=express();
const helmet=require("helmet");
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const wrapasync=require("./utils/wrapasync.js");
const expresserror=require("./utils/expresserror.js");
const {listingSchema: schema, reviewschema}=require("./schema.js");
const  mongo_url=process.env.MONGODB_URL||"mongodb://127.0.0.1:27017/wanderlust";
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
const bookingRouter=require("./routes/booking.js");
const wishlistRouter=require("./routes/wishlist.js");
const {configured}=require("./config/cloudinary.js");
const {mapboxToken}=require("./config/geocoding.js");
const {translate}=require("./config/i18n.js");
const sessionOptions={
    secret:process.env.SESSION_SECRET||"mysecretcode",
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
app.set("trust proxy",1);
app.use(
    helmet({
        contentSecurityPolicy:{
            useDefaults:true,
            directives:{
                "default-src":["'self'"],
                "script-src":["'self'","'unsafe-inline'","https://cdn.jsdelivr.net","https://cdnjs.cloudflare.com","https://api.mapbox.com"],
                "style-src":["'self'","'unsafe-inline'","https://cdn.jsdelivr.net","https://cdnjs.cloudflare.com","https://fonts.googleapis.com","https://api.mapbox.com"],
                "font-src":["'self'","data:","https://fonts.gstatic.com","https://cdnjs.cloudflare.com"],
                "img-src":["'self'","data:","blob:","https:"],
                "connect-src":["'self'","https://api.mapbox.com"],
                "worker-src":["'self'","blob:"],
                "frame-src":["'self'","blob:"],
                "object-src":["'none'"],
            },
        },
        crossOriginEmbedderPolicy:false,
    })
);
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
    res.locals.currUser=req.user;
    res.locals.cloudinaryConfigured=configured;
    res.locals.mapboxToken=mapboxToken;
    if(req.query.lang==="hi"||req.query.lang==="en") req.session.lang=req.query.lang;
    const active=req.session.lang==="hi"?"hi":"en";
    res.locals.lang=active;
    res.locals.t=(key,vars)=>translate(active,key,vars);
    next();
});

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
    res.render("landing.ejs");
});

app.use("/",userRouter);
app.use("/",bookingRouter);
app.use("/",wishlistRouter);
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
// reviews

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

app.get("/favicon.ico",(req,res)=>{
    res.status(204).end();
});
app.use((req,res,next)=>{
    console.error(`404 not found: ${req.method} ${req.originalUrl}`);
    next(new expresserror(404,"Page not found!"));
});
app.use((err,req,res,next)=>{
    console.error(err);
    res.status(err.statusCode||500).render("listings/error.ejs",{err});
});
app.listen(process.env.PORT||8080,()=>{
    console.log(`server is running on port ${process.env.PORT||8080}`);
});
