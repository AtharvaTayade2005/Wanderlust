const express=require("express");
const router=express.Router();
const wrapasync=require("../utils/wrapasync.js");
const {validatelisting,isLoggedIn,isOwner}=require("../middleware.js");
const listingController=require("../controllers/listings.js");

router.route("/")
    .get(wrapasync(listingController.index))
    .post(isLoggedIn,validatelisting,wrapasync(listingController.createListing));

router.route("/new")
    .get(isLoggedIn,listingController.renderNewForm);

router.route("/:id")
    .get(wrapasync(listingController.showListing))
    .put(isLoggedIn,isOwner,wrapasync(listingController.updateListing))
    .delete(isLoggedIn,isOwner,wrapasync(listingController.destroyListing));

router.route("/:id/edit")
    .get(isLoggedIn,isOwner,wrapasync(listingController.renderEditForm));

module.exports=router;