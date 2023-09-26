const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Replace with your Stripe secret key

const createPaymentIntent = async (
  courseId,
  studentId,
  paymentAmount,
  paymentMethodId
) => {
  try {
    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentAmount,
      currency: "usd",
      payment_method_types: ["card"],
      description: `Subscription for course: ${courseId}`,
      metadata: {
        courseId: courseId,
        studentId: studentId,
      },
      payment_method: paymentMethodId,
    });

    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

const capturePayment = async (paymentIntentId) => {
  try {
    // Confirm the PaymentIntent
    await stripe.paymentIntents.confirm(paymentIntentId);

    // Retrieve the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check if the PaymentIntent status is "requires_capture"
    if (paymentIntent.status === "requires_capture") {
      // Capture the payment
      const capturedPayment = await stripe.paymentIntents.capture(
        paymentIntentId
      );
      return capturedPayment;
    } else {
      // Handle other PaymentIntent statuses if needed
      return paymentIntent;
    }
  } catch (error) {
    console.error("Error capturing payment:", error);
    throw error;
  }
};

const refundPayment = async (paymentIntentId) => {
  try {
    await stripe.refunds.create({ payment_intent: paymentIntentId });
  } catch (error) {
    console.error("Error refunding payment:", error);
    throw error;
  }
};

const transferToTeacher = async (chargeId, teacherStripeAccountId, amount, currency) => {
  try {
    const transfer = await stripe.transfers.create({
      amount,            
      currency,          
      destination: teacherStripeAccountId, 
      description: "Payment for course",
      source_transaction: chargeId, 
    });

    return transfer;
  } catch (error) {
    console.error("Error transferring payment to teacher:", error);
    throw error;
  }
};

module.exports = transferToTeacher;



module.exports = {
  createPaymentIntent,
  refundPayment,
  transferToTeacher,
  capturePayment,
};
