const express=require("express");
const router=express.Router({mergeParams:true});
const wrapasync=require("../utils/wrapasync.js");
const {isLoggedIn}=require("../middleware.js");
const bookingController=require("../controllers/bookings.js");

router.route("/listings/:id/bookings")
    .post(isLoggedIn,wrapasync(bookingController.createBooking));

router.route("/bookings/my")
    .get(isLoggedIn,wrapasync(bookingController.myBookings));

router.route("/bookings/:bookingId/pay")
    .get(isLoggedIn,wrapasync(bookingController.renderPaymentPage));

router.route("/bookings/:bookingId/pay/order")
    .post(isLoggedIn,bookingController.createPaymentOrder);

router.route("/bookings/:bookingId/pay/verify")
    .post(isLoggedIn,bookingController.verifyPayment);

router.route("/bookings/:bookingId/pay/simulate")
    .post(isLoggedIn,wrapasync(bookingController.simulatePayment));

router.route("/bookings/:bookingId")
    .delete(isLoggedIn,wrapasync(bookingController.cancelBooking));

module.exports=router;