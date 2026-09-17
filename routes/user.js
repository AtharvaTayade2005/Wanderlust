const express=require("express");
const router=express.Router();
const wrapasync=require("../utils/wrapasync.js");
const User=require("../models/user.js");
const passport=require("passport");
router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});

router.post("/signup",wrapasync(async(req,res)=>{
    try{
    let {username,email,password}=req.body;
    const newUser=new User({email,username});
    const registeredUser=await User.register(newUser,password);
    console.log(registeredUser);
    req.flash("success","Welcome to Wanderlust");
    res.redirect("/listings");
    } catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }

}));
router.post("/login",passport.authenticate("local",{failureRedirect:'./login',failureFLesh:true}),async(req,res)=>{
    req.flash("Success","Welcome to Wanderlust! You are logged in!");

});




module.exports=router;