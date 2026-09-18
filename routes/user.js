const express=require("express");
const router=express.Router();
const wrapasync=require("../utils/wrapasync.js");
const userController=require("../controllers/users.js");
const {isLoggedIn}=require("../middleware.js");
const rateLimit=require("express-rate-limit");

const authLimiter=rateLimit({
    windowMs:15*60*1000,
    max:20,
    standardHeaders:true,
    legacyHeaders:false,
    message:{error:"Too many attempts. Please try again later."},
});

router.route("/signup")
    .get(userController.renderSignupForm)
    .post(authLimiter, wrapasync(userController.signup));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(authLimiter, userController.login);

router.route("/logout")
    .get(userController.logout);

router.route("/profile")
    .get(isLoggedIn, userController.myProfile)
    .post(isLoggedIn, wrapasync(userController.editProfile));

router.route("/profile/:id")
    .get(wrapasync(userController.showProfile));

module.exports=router;