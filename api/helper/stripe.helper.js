const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Replace with your Stripe secret key

const createPaymentIntent = async (courseId, studentId, paymentAmount) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentAmount,
      currency: "usd",
      payment_method_types: ["card"],
      description: `Subscription for course: ${courseId}`,
      metadata: {
        courseId: courseId,
        studentId: studentId,
      },
    });
    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

const capturePayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error capturing payment:', error);
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

const transferToTeacher = async (paymentIntent, teacherStripeAccountId) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      destination: teacherStripeAccountId,
      description: "Payment for course",
      source_transaction: paymentIntent.charges.data[0].id,
    });
    return transfer;
  } catch (error) {
    console.error("Error transferring payment to teacher:", error);
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  refundPayment,
  transferToTeacher,
  capturePayment
};
