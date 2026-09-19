const Booking=require("../models/booking.js");
const Listing=require("../models/listing.js");
const razorpay=require("../config/razorpay.js");

function balanceDue(booking){
    return Math.max(0, booking.totalPrice - booking.paidAmount);
}

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
        bookingData.paidAmount=bookingData.depositAmount;
        bookingData.payments=[{amount:bookingData.depositAmount,method:"manual"}];
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
    res.render("bookings/index.ejs",{bookings,pageTitle:"Trips",balanceDue});
};

module.exports.renderPaymentPage=async(req,res)=>{
    const booking=await Booking.findOne({
        _id:req.params.bookingId,
        user:req.user._id,
    }).populate("listing");
    if(!booking){
        req.flash("error","Booking not found");
        return res.redirect("/bookings/my");
    }
    const due=balanceDue(booking);
    if(due<=0){
        req.flash("success","This booking is already paid in full");
        return res.redirect("/bookings/my");
    }
    res.render("bookings/pay.ejs",{booking,due,razorpayConfigured:razorpay.configured});
};

module.exports.createPaymentOrder=async(req,res)=>{
    const booking=await Booking.findOne({
        _id:req.params.bookingId,
        user:req.user._id,
    });
    if(!booking) return res.status(404).json({error:"Booking not found"});
    if(!razorpay.configured){
        return res.status(400).json({error:"Razorpay is not configured"});
    }
    const duePaise=Math.round(balanceDue(booking)*100);
    if(duePaise<=0) return res.status(400).json({error:"No balance due"});
    try{
        const order=await razorpay.createOrder(duePaise,`booking_${booking._id}`);
        res.json({
            order_id:order.id,
            key_id:process.env.RAZORPAY_KEY_ID,
            amount:order.amount,
            currency:order.currency,
        });
    }catch(err){
        console.error("razorpay order failed:",err.message);
        res.status(502).json({error:"Could not create payment order"});
    }
};

module.exports.verifyPayment=async(req,res)=>{
    const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body||{};
    const booking=await Booking.findOne({
        _id:req.params.bookingId,
        user:req.user._id,
    });
    if(!booking) return res.status(404).json({error:"Booking not found"});
    if(!razorpay.configured){
        return res.status(400).json({error:"Razorpay is not configured"});
    }
    if(!razorpay.verifyPayment(razorpay_order_id,razorpay_payment_id,razorpay_signature)){
        return res.status(400).json({error:"Payment signature verification failed"});
    }
    const alreadyPaid=booking.payments.some((p)=>p.razorpay_payment_id===razorpay_payment_id);
    if(alreadyPaid) return res.json({ok:true});
    const amount=Math.round(balanceDue(booking)*100)/100;
    booking.paidAmount=Math.round((booking.paidAmount+amount)*100)/100;
    booking.payments.push({
        amount,
        method:"razorpay",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    });
    await booking.save();
    res.json({ok:true,paid:amount,due:balanceDue(booking)});
};

module.exports.simulatePayment=async(req,res)=>{
    const booking=await Booking.findOne({
        _id:req.params.bookingId,
        user:req.user._id,
    });
    if(!booking){
        req.flash("error","Booking not found");
        return res.redirect("/bookings/my");
    }
    const amount=Math.round(balanceDue(booking)*100)/100;
    if(amount<=0){
        req.flash("success","This booking is already paid in full");
        return res.redirect("/bookings/my");
    }
    booking.paidAmount=Math.round((booking.paidAmount+amount)*100)/100;
    booking.payments.push({amount,method:"manual"});
    await booking.save();
    req.flash("success","Payment of Rs. "+amount.toLocaleString("en-IN")+" recorded (simulated)");
    res.redirect("/bookings/my");
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