const User=require("../models/user.js");
const Listing=require("../models/listing.js");
const Review=require("../models/review.js");
const Wishlist=require("../models/wishlist.js");
const passport=require("passport");

const PASSWORD_RULE={
    pattern:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
    message:"Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.",
};

module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup=async(req,res)=>{
    try{
        let {username,email,password}=req.body;
        if(!PASSWORD_RULE.pattern.test(password||"")){
            req.flash("error",PASSWORD_RULE.message);
            return res.redirect("/signup");
        }
        const newUser=new User({email,username});
        const registeredUser=await User.register(newUser,password);
        req.login(registeredUser,(err)=>{
            if(err){
                return res.redirect("/signup");
            }
            req.flash("success","Welcome to Wanderlust");
            const redirectUrl=req.session.redirectUrl||"/listings";
            delete req.session.redirectUrl;
            res.redirect(redirectUrl);
        });
    } catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login=(req,res,next)=>{
    passport.authenticate("local",{failureRedirect:'/login',failureFlash:true},(err,user,info)=>{
        if(err) return next(err);
        if(!user) return res.redirect("/login");
        req.logIn(user,(err)=>{
            if(err) return next(err);
            req.flash("success","Welcome to Wanderlust! You are logged in!");
            const redirectUrl=req.session.redirectUrl||"/listings";
            delete req.session.redirectUrl;
            res.redirect(redirectUrl);
        });
    })(req,res,next);
};

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err) next(err);
        req.flash("success","you are logged out");
        res.redirect("/listings");
    });
};

module.exports.showProfile=async(req,res)=>{
    const {id}=req.params;
    const user=await User.findById(id);
    if(!user){
        req.flash("error","User not found");
        return res.redirect("/listings");
    }
    const listings=await Listing.find({owner:user._id}).populate("owner");
    const reviews=await Review.find({author:user._id}).populate("listing");
    const savedCount=await Wishlist.countDocuments({user:user._id});
    const isOwn=req.user && user._id.equals(req.user._id);
    res.render("users/profile.ejs",{profileUser:user,listings,reviews,savedCount,isOwn});
};

module.exports.myProfile=async(req,res)=>{
    res.redirect(`/profile/${req.user._id}`);
};

module.exports.editProfile=async(req,res)=>{
    const user=await User.findByIdAndUpdate(
        req.user._id,
        {
            bio:req.body.bio,
            avatar:req.body.avatar,
        },
        {runValidators:true,new:true}
    );
    req.flash("success","Profile updated");
    res.redirect(`/profile/${user._id}`);
};