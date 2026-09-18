const express=require("express");
const router=express.Router();
const wrapasync=require("../utils/wrapasync.js");
const {validatelisting,isLoggedIn,isOwner,isValidId}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const {upload}=require("../config/cloudinary.js");

router.route("/")
    .get(wrapasync(listingController.index))
    .post(isLoggedIn,upload.single("listing[image]"),validatelisting,wrapasync(listingController.createListing));

router.route("/new")
    .get(isLoggedIn,listingController.renderNewForm);

router.route("/:id")
    .get(isValidId,wrapasync(listingController.showListing))
    .put(isValidId,isLoggedIn,isOwner,upload.single("listing[image]"),validatelisting,wrapasync(listingController.updateListing))
    .delete(isValidId,isLoggedIn,isOwner,wrapasync(listingController.destroyListing));

router.route("/:id/edit")
    .get(isValidId,isLoggedIn,isOwner,wrapasync(listingController.renderEditForm));

module.exports=router;