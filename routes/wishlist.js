const express=require("express");
const router=express.Router();
const wrapasync=require("../utils/wrapasync.js");
const wishlistController=require("../controllers/wishlist.js");
const {isLoggedIn,isValidId}=require("../middleware.js");

router.route("/wishlist")
    .get(isLoggedIn, wrapasync(wishlistController.myWishlist));

router.route("/listings/:id/wishlist")
    .post(isValidId, isLoggedIn, wrapasync(wishlistController.toggleWishlist));

module.exports=router;