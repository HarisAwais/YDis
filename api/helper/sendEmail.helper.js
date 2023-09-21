const nodemailer = require('nodemailer');
const User = require("../schema/user.schema")

// Create a transporter using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'your_email@gmail.com',  // Your Gmail email address
    pass: 'your_password',         // Your Gmail password or an app-specific password
  },
});

async function sendNotificationToStudent(subscription) {
  try {
    const studentEmail = 'harisawais828@gmail.com';

    // Compose and send an email notification
    const emailSubject = "Your Subscription Has Been Approved!";
    const emailBody = "Dear student, your subscription has been approved. Please make your payment to activate it.";

    // Create an email message
    const mailOptions = {
      from: 'YDI@gmail.com',  // Your sender email address
      to: studentEmail,
      subject: emailSubject,
      text: emailBody,
      // You can also include an HTML version of the email if needed.
      // html: '<p>' + emailBody + '</p>',
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    // You can also send in-app notifications or push notifications here if needed.
  } catch (error) {
    console.error("Error sending notification to student:", error);
  }
}

module.exports = { sendNotificationToStudent };
