const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const generateCertificatePdf = async (studentName, teacherName, courseName, completionDate, pdfFilename) => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });

        const page = await browser.newPage();

        // HTML content for the certificate
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Certificate of Completion</title>
            </head>
            <body>
                <h1>Certificate of Completion</h1>
                <p>This is to certify that</p>
                <h2>${studentName}</h2>
                <p>has successfully completed the course:</p>
                <h3>${courseName}</h3>
                <p>taught by:</p>
                <h3>${teacherName}</h3>
                <p>on this date:</p>
                <p>${completionDate}</p>
            </body>
            </html>
        `;

        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ format: 'A4' });

        // Specify the directory and filename for saving the PDF
        const pdfDirectory = path.join(__dirname, 'public', 'pdf'); // Change as needed
        const pdfPath = path.join(pdfDirectory, pdfFilename);

        // Ensure the directory exists
        if (!fs.existsSync(pdfDirectory)) {
            fs.mkdirSync(pdfDirectory, { recursive: true });
        }

        // Save the PDF to the specified filename
        fs.writeFileSync(pdfPath, pdfBuffer);

        await browser.close();

        return pdfPath; // Return the path to the saved PDF
    } catch (error) {
        console.error(error);
        throw new Error('Error generating the certificate PDF');
    }
};


  const sendCertificateEmail = async (studentName, courseName, studentEmail, teacherEmail, teacherPassword, pdfBuffer) => {
    return new Promise((resolve, reject) => {
      // Create a Nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "smtp.gmail.com",
        port:587, // Use Gmail as an example
        auth: {
          user: teacherEmail,
          pass: teacherPassword,
        },
      });
  
      const mailOptions = {
        from: teacherEmail,
        to: studentEmail,
        subject: "Certificate of Completion",
        text: `Congratulations, ${studentName}!\nYou have successfully completed the course "${courseName}".`,
        attachments: [
          {
            filename: "certificate.pdf",
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      };
  
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          reject(error);
        } else {
          console.log("Email sent:", info.response);
          resolve();
        }
      });
    });
  };
  
  const calculateScorePercentage = (totalQuestions, correctQuestions) => {
    return (correctQuestions / totalQuestions) * 100;
  };
  
  module.exports = {sendCertificateEmail,generateCertificatePdf
    ,calculateScorePercentage}