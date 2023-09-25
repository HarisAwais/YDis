const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const generateCertificatePdf = async (studentName, teacherName, courseName, completionDate, pdfFilename) => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });

        const page = await browser.newPage();

        // HTML content for the certificate
        const htmlContent = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Certificate of Completion</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                }
                .certificate {
                    border: 2px solid #0073e6;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                    background-color: #f0f0f0;
                }
                .title {
                    font-size: 24px;
                    color: #0073e6;
                    margin-bottom: 20px;
                }
                .subtitle {
                    font-size: 18px;
                    color: #333;
                    margin-bottom: 30px;
                }
                .name {
                    font-size: 36px;
                    font-weight: bold;
                    color: #333;
                }
                .course {
                    font-size: 20px;
                    margin-top: 20px;
                }
                .instructor {
                    font-size: 18px;
                    color: #555;
                }
                .date {
                    font-size: 16px;
                    color: #777;
                    margin-top: 20px;
                }
                .signature {
                    margin-top: 50px;
                }
            </style>
        </head>
        <body>
            <div class="certificate">
                <div class="title">Certificate of Completion</div>
                <div class="subtitle">This is to certify that</div>
                <div class="name">${studentName}</div>
                <div class="course">has successfully completed the course:</div>
                <div class="course">${courseName}</div>
                <div class="instructor">taught by:</div>
                <div class="name">${teacherName}</div>
                <div class="date">on this date: ${completionDate}</div>
                <div class=>
                <p>from:</p>
                <h1> YDI</h1>
                </div>
            </div>
        </body>
        </html>
        `;

        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ 
          format: 'Letter', // Change to a smaller format like 'Letter' or 'Legal'
          margin: {
              top: '10mm',    // Narrower top margin
              right: '10mm',  // Narrower right margin
              bottom: '10mm', // Narrower bottom margin
              left: '10mm',   // Narrower left margin
          },
      });
        // Specify the directory and filename for saving the PDF
        const pdfDirectory = path.join(__dirname, '../../public', 'pdf'); 
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