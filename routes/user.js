const express=require("express");
const router=express.Router();
const wrapasync=require("../utils/wrapasync.js");
const userController=require("../controllers/users.js");

router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapasync(userController.signup));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(userController.login);

router.route("/logout")
    .get(userController.logout);

module.exports=router;