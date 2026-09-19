const crypto = require("crypto");

const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

const configured = Boolean(keyId && keySecret && !keyId.startsWith("your_"));

let razorpay = null;
if (configured) {
  const Razorpay = require("razorpay");
  razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
}

async function createOrder(amountInPaise, receipt) {
  if (!configured) return null;
  return razorpay.orders.create({
    amount: Math.round(amountInPaise),
    currency: "INR",
    receipt,
    payment_capture: 1,
  });
}

function verifyPayment(orderId, paymentId, signature) {
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}

module.exports = { razorpay, configured, createOrder, verifyPayment };