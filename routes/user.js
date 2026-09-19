const express=require("express");
const router=express.Router();
const wrapasync=require("../utils/wrapasync.js");
const userController=require("../controllers/users.js");
const {isLoggedIn}=require("../middleware.js");
const rateLimit=require("express-rate-limit");

function makeAuthLimiter(redirectTo){
    return rateLimit({
        windowMs:15*60*1000,
        max:20,
        standardHeaders:true,
        legacyHeaders:false,
        handler:(req,res,next)=>{
            req.flash("error","Too many attempts. Please try again after 15 minutes.");
            res.redirect(redirectTo);
        },
    });
}

const signupLimiter=makeAuthLimiter("/signup");
const loginLimiter=makeAuthLimiter("/login");

router.route("/signup")
    .get(userController.renderSignupForm)
    .post(signupLimiter, wrapasync(userController.signup));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(loginLimiter, userController.login);

router.route("/logout")
    .get(userController.logout);

router.route("/profile")
    .get(isLoggedIn, userController.myProfile)
    .post(isLoggedIn, wrapasync(userController.editProfile));

router.route("/profile/:id")
    .get(wrapasync(userController.showProfile));

module.exports=router;