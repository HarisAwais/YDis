const stripe = require("stripe")('sk_test_51NpSaDC44tKvGwWA8hqaaDH5TUcJypQjZm1ygDYUYX4gUjBNQUB7Swea652dKKq6odCdFyzKtJYy8eg7KExl3vuk009AdvchfR')
// Replace 'YOUR_ACCOUNT_ID' with the Stripe account ID you want to delete.
const accountId = 'acct_1Nt4HNCFuPMJ0c2b';

async function deleteAccount() {
  try {
    const deletedAccount = await stripe.accounts.del(accountId);
    console.log(`Account with ID ${deletedAccount.id} has been deleted.`);
  } catch (error) {
    console.error('Error deleting account:', error);
  }
}

deleteAccount();

const sgMail = require("@sendgrid/mail");

// Set your SendGrid API key
sgMail.setApiKey("YOUR_SENDGRID_API_KEY");

// Create a function to send an email
const sendEmail = async () => {
  const msg = {
    to: "recipient@example.com",
    from: "sender@example.com",
    subject: "Hello from SendGrid",
    text: "This is a test email sent from SendGrid.",
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

// Call the sendEmail function to send an email
sendEmail();

// if teacher wants to cancel subscription 