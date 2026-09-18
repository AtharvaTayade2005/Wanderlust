const Booking=require("../models/booking.js");
const Listing=require("../models/listing.js");

module.exports.createBooking=async(req,res)=>{
    const listing=await Listing.findById(req.params.id);
    if(!listing){
        req.flash("error","Listing not found");
        return res.redirect("/listings");
    }
    if(!listing.price){
        req.flash("error","This listing is not bookable");
        return res.redirect(`/listings/${listing._id}`);
    }
    if(listing.owner && listing.owner.equals(req.user._id)){
        req.flash("error","You cannot book your own listing");
        return res.redirect(`/listings/${listing._id}`);
    }

    const checkIn=new Date(req.body.checkIn);
    const checkOut=new Date(req.body.checkOut);
    const guests=Number(req.body.guests)||1;
    const today=new Date();
    today.setHours(0,0,0,0);

    if(!req.body.checkIn||!req.body.checkOut||checkIn>=checkOut){
        req.flash("error","Check-in must be before check-out");
        return res.redirect(`/listings/${listing._id}`);
    }
    if(checkIn<today){
        req.flash("error","Check-in date cannot be in the past");
        return res.redirect(`/listings/${listing._id}`);
    }

    const nights=Math.round((checkOut-checkIn)/(1000*60*60*24));
    if(nights<1){
        req.flash("error","Booking must be at least one night");
        return res.redirect(`/listings/${listing._id}`);
    }

    const overlap=await Booking.find({
        listing:listing._id,
        status:"confirmed",
        checkIn:{$lt:checkOut},
        checkOut:{$gt:checkIn},
    });
    if(overlap.length>0){
        req.flash("error","These dates are already booked");
        return res.redirect(`/listings/${listing._id}`);
    }

    const bookingData={
        listing:listing._id,
        user:req.user._id,
        checkIn,
        checkOut,
        guests,
        nights,
        totalPrice:nights*listing.price,
    };

    if(req.body.paymentMode==="deposit"){
        bookingData.paymentMode="deposit";
        bookingData.depositAmount=Math.round(bookingData.totalPrice*0.2);
        bookingData.locked=true;
        bookingData.lockedPrice=listing.price;
    }

    const booking=new Booking(bookingData);
    await booking.save();
    req.flash(
        "success",
        booking.paymentMode==="deposit"
            ? "Price locked! Deposit of Rs. "+booking.depositAmount.toLocaleString("en-IN")+" received. Balance due at checkout."
            : "Booking confirmed!"
    );
    res.redirect("/bookings/my");
};

module.exports.myBookings=async(req,res)=>{
    const bookings=await Booking.find({user:req.user._id})
        .populate("listing")
        .sort({createdAt:-1});
    res.render("bookings/index.ejs",{bookings,pageTitle:"Trips"});
};

module.exports.cancelBooking=async(req,res)=>{
    const booking=await Booking.findOneAndDelete({
        _id:req.params.bookingId,
        user:req.user._id,
    });
    if(!booking){
        req.flash("error","Booking not found");
        return res.redirect("/bookings/my");
    }
    req.flash("success","Booking cancelled!");
    res.redirect("/bookings/my");
};