const User=require("../models/user.js");
const passport=require("passport");

module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup=async(req,res)=>{
    try{
        let {username,email,password}=req.body;
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