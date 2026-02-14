import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env regardless of process working directory.
config({ path: path.resolve(__dirname, "../.env") });
import sgMail from "@sendgrid/mail";

const sendGridApiKey = process.env.SENDGRID_API_KEY;
if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey);
} else {
  console.warn("SENDGRID_API_KEY is missing. Email delivery is disabled.");
}

// const sendEmail = async ({
//   receipientEmail,
//   subject,
//   template_data,
//   req = {},
//   emailType,
// }) => {
//   let htmlContent;
//   const host = req.headers ? req.headers.host : "example.com";

//   switch (emailType) {
//     case "signup":
//       htmlContent = `
//         <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9; border-radius: 8px;">
//           <h2 style="color: #4CAF50;">Welcome to MoniHealth!</h2>
//           <p>Hello,</p>
//           <p>Thank you for signing up for MoniHealth. Please click the button below to verify your email address.</p>
//           <div style="text-align: center; margin: 20px 0;">
//             <a href="http://${req.headers.host}/api/v1/therapist/verify-email?otp=${template_data.otp}" style="background-color: #4CAF50; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Verify Email</a>
//           </div>
//           <p>If you did not sign up for MoniHealth, you can safely ignore this email.</p>
//           <p>Best,</p>
//           <p>The MoniHealth Team</p>
//         </div>
//       `;
//       break;

//     case "appointment_patient":
//       htmlContent = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>${subject}</title>
//           <style>
//             body, h1, h2, h3, h4, h5, h6, p, ul, li {
//               margin: 0;
//               padding: 0;
//             }
//             body {
//               font-family: Arial, sans-serif;
//               background-color: #f5f5f5;
//               color: #333;
//             }
//             .container {
//               max-width: 600px;
//               margin: 0 auto;
//               padding: 20px;
//               background-color: #fff;
//               border-radius: 8px;
//               box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
//             }
//             .header {
//               text-align: center;
//               margin-bottom: 20px;
//             }
//             .header h1 {
//               font-size: 24px;
//               color: #4CAF50;
//             }
//             .content p {
//               margin-bottom: 10px;
//             }
//             .content ul {
//               list-style-type: none;
//               margin-bottom: 20px;
//             }
//             .content ul li {
//               margin-bottom: 5px;
//             }
//             .button {
//               text-align: center;
//               margin: 20px 0;
//             }
//             .button a {
//               background-color: #4CAF50;
//               color: #fff;
//               text-decoration: none;
//               padding: 10px 20px;
//               border-radius: 5px;
//             }
//             .footer {
//               text-align: center;
//               margin-top: 20px;
//               color: #888;
//             }
//             @media (max-width: 480px) {
//               .container {
//                 padding: 10px;
//               }
//               .header h1 {
//                 font-size: 20px;
//               }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>Appointment Confirmation</h1>
//             </div>
//             <div class="content">
//               <p>Hello ${template_data.name},</p>
//               <p>Your appointment with ${template_data.therapistName} is confirmed for the following details:</p>
//               <ul>
//                 <li><strong>Date:</strong> ${template_data.date}</li>
//                 <li><strong>Time:</strong> ${template_data.time}</li>
//                 <li><strong>Therapist:</strong> ${template_data.therapistName}</li>
//                 <li><strong>Status:</strong> ${template_data.status}</li>
//               </ul>
//               <div class="button">
//                 <a href="http://${req.headers.host}/patient/appointments/${template_data.appointmentId}">View Appointment</a>
//               </div>
//               <p>Please make sure to arrive 10 minutes early.</p>
//             </div>
//             <div class="footer">
//               <p>&copy; MOBIREHAB Team</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `;
//       break;

//     case "appointment_therapist":
//       htmlContent = `
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>${subject}</title>
//           <style>
//             body, h1, h2, h3, h4, h5, h6, p, ul, li {
//               margin: 0;
//               padding: 0;
//             }
//             body {
//               font-family: Arial, sans-serif;
//               background-color: #f5f5f5;
//               color: #333;
//             }
//             .container {
//               max-width: 600px;
//               margin: 0 auto;
//               padding: 20px;
//               background-color: #fff;
//               border-radius: 8px;
//               box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
//             }
//             .header {
//               text-align: center;
//               margin-bottom: 20px;
//             }
//             .header h1 {
//               font-size: 24px;
//               color: #4CAF50;
//             }
//             .content p {
//               margin-bottom: 10px;
//             }
//             .content ul {
//               list-style-type: none;
//               margin-bottom: 20px;
//             }
//             .content ul li {
//               margin-bottom: 5px;
//             }
//             .button {
//               text-align: center;
//               margin: 20px 0;
//             }
//             .button a {
//               background-color: #4CAF50;
//               color: #fff;
//               text-decoration: none;
//               padding: 10px 20px;
//               border-radius: 5px;
//             }
//             .footer {
//               text-align: center;
//               margin-top: 20px;
//               color: #888;
//             }
//             @media (max-width: 480px) {
//               .container {
//                 padding: 10px;
//               }
//               .header h1 {
//                 font-size: 20px;
//               }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>New Appointment Notification</h1>
//             </div>
//             <div class="content">
//               <p>Hello ${template_data.name},</p>
//               <p>You have a new appointment scheduled with ${template_data.patientName}:</p>
//               <ul>
//                 <li><strong>Date:</strong> ${template_data.date}</li>
//                 <li><strong>Time:</strong> ${template_data.time}</li>
//                 <li><strong>Patient:</strong> ${template_data.patientName}</li>
//                 <li><strong>Service:</strong> ${template_data.service}</li>
//                 <li><strong>Purpose:</strong> ${template_data.purpose}</li>
//               </ul>
//               <div class="button">
//                 <a href="http://${req.headers.host}/api/v1/therapist/appointments/${template_data.appointmentId}">Approve Appointment</a>
//               </div>
//             </div>
//             <div class="footer">
//               <p>&copy; MOBIREHAB Team</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `;
//       break;

//     case "appointment_status_update":
//       htmlContent = `
//           <!DOCTYPE html>
//           <html lang="en">
//           <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>${subject}</title>
//             <style>
//               body, h1, h2, h3, h4, h5, h6, p, ul, li {
//                 margin: 0;
//                 padding: 0;
//               }
//               body {
//                 font-family: Arial, sans-serif;
//                 background-color: #f5f5f5;
//                 color: #333;
//               }
//               .container {
//                 max-width: 600px;
//                 margin: 0 auto;
//                 padding: 20px;
//                 background-color: #fff;
//                 border-radius: 8px;
//                 box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
//               }
//               .header {
//                 text-align: center;
//                 margin-bottom: 20px;
//               }
//               .header h1 {
//                 font-size: 24px;
//                 color: #4CAF50;
//               }
//               .content p {
//                 margin-bottom: 10px;
//               }
//               .content ul {
//                 list-style-type: none;
//                 margin-bottom: 20px;
//               }
//               .content ul li {
//                 margin-bottom: 5px;
//               }
//               .button {
//                 text-align: center;
//                 margin: 20px 0;
//               }
//               .button a {
//                 background-color: #4CAF50;
//                 color: #fff;
//                 text-decoration: none;
//                 padding: 10px 20px;
//                 border-radius: 5px;
//               }
//               .footer {
//                 text-align: center;
//                 margin-top: 20px;
//                 color: #888;
//               }
//               @media (max-width: 480px) {
//                 .container {
//                   padding: 10px;
//                 }
//                 .header h1 {
//                   font-size: 20px;
//                 }
//               }
//             </style>
//           </head>
//                   <body>
//       <div class="container">
//         <div class="header">
//           <h1>Appointment ${template_data.status}</h1>
//         </div>
//         <div class="content">
//           <p>Hello ${template_data.name},</p>
//           <p>${template_data.message}</p>
//           <p>Your appointment with ${
//             template_data.therapistName
//           } has been updated:</p>
//           <ul>
//             <li><strong>Date:</strong> ${template_data.date}</li>
//             <li><strong>Time:</strong> ${template_data.time}</li>
//             <li><strong>Therapist:</strong> ${template_data.therapistName}</li>
//             <li><strong>Status:</strong> ${template_data.status}</li>
//           </ul>
//           <div class="button">
//             <a href="http://${req.headers.host}/patient/appointments/${
//         template_data.appointmentId
//       }">View Appointment</a>
//           </div>
//           ${
//             template_data.status === "Accepted"
//               ? "<p>Please make sure to arrive 10 minutes early.</p>"
//               : ""
//           }
//         </div>
//         <div class="footer">
//           <p>&copy; MOBIREHAB Team</p>
//         </div>
//       </div>
//     </body>
//           </html>
//         `;
//       break;

//     case "therapist_account_update":
//       htmlContent = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>${subject}</title>
//       <style>
//         body, h1, h2, h3, p {
//             margin: 0;
//             padding: 0;
//         }
//         body {
//             font-family: Arial, sans-serif;
//             line-height: 1.6;
//             color: #333;
//             background-color: #f4f4f4;
//         }
//         .container {
//             max-width: 600px;
//             margin: 20px auto;
//             background-color: #ffffff;
//             border-radius: 8px;
//             overflow: hidden;
//             box-shadow: 0 0 10px rgba(0,0,0,0.1);
//         }
//         .header {
//             background-color: #4CAF50;
//             color: #ffffff;
//             padding: 20px;
//             text-align: center;
//         }
//         .content {
//             padding: 30px;
//         }
//         .button {
//             display: inline-block;
//             background-color: #4CAF50;
//             color: #ffffff;
//             text-decoration: none;
//             padding: 10px 20px;
//             border-radius: 5px;
//             margin-top: 20px;
//         }
//         .footer {
//             background-color: #f0f0f0;
//             padding: 20px;
//             text-align: center;
//             font-size: 0.8em;
//             color: #666;
//         }
//     </style>
//     </head>
//     <body>
//         <div class="container">
//             <div class="header">
//                 <h1>${
//                   template_data.isVerified === true
//                     ? "Account Verified!"
//                     : "Account Update"
//                 }</h1>
//             </div>
//             <div class="content">
//                 <h2>Hello ${template_data.name},</h2>
//                 ${
//                   template_data.isVerified === true
//                     ? `
//                     <p>Congratulations! Your Mobirehab therapist account has been successfully verified.</p>
//                     <p>You can now start accepting appointments from patients and provide your valuable services through our platform.</p>
//                     <p>Here's what you can do next:</p>
//                     <ul>
//                         <li>Complete your profile with any additional information</li>
//                         <li>Set your availability for appointments</li>
//                         <li>Familiarize yourself with the platform's features</li>
//                     </ul>
//                     <a href="http://${req.headers.host}/therapist/" class="button">Go to Dashboard</a>
//                 `
//                     : `
//                     <p>We regret to inform you that your Mobirehab therapist account verification was unsuccessful at this time.</p>
//                     <p>This decision was made after careful review of the information provided. We understand this may be disappointing, but we want to ensure the highest standards for our platform and patients.</p>
//                     <p>For more information about the specific reasons for this decision or to discuss how you can improve your application, please contact our admin team.</p>
//                     <a href="mailto:admin@mobirehab.com" class="button">Contact Admin</a>
//                 `
//                 }
//             </div>
//             <div class="footer">
//                 <p>&copy; ${new Date().getFullYear()} Mobirehab. All rights reserved.</p>
//                 <p>If you have any questions, please contact our support team at support@mobirehab.com</p>
//             </div>
//         </div>
//     </body>
//     </html>
//   `;
//       break;
//     default:
//       console.error("Invalid email type provided");
//       throw new Error("Invalid email type provided");
//   }

//   const msg = {
//     to: receipientEmail,
//     from: process.env.SENDGRID_VERIFIED_SENDER || "falconinnovcm@gmail.com",
//     subject: subject,
//     html: htmlContent,
//   };
//   try {
//     console.log("Sending email with the following details:", msg);
//     await sgMail.send(msg);
//     console.log("Email sent successfully");
//   } catch (error) {
//     console.error(
//       "Error sending email:",
//       error.response ? error.response.body : error
//     );
//     throw new Error("Could not send email");
//   }
// };

const sendEmail = async ({
  recipientEmail,
  subject,
  htmlContent,
  // template_data,
}) => {
  const msg = {
    to: recipientEmail,
    from: process.env.SENDGRID_VERIFIED_SENDER || "falconinnovcm@gmail.com",
    subject: subject,
    html: htmlContent,
    // template_data,
  };

  try {
    if (!sendGridApiKey) {
      throw new Error("SENDGRID_API_KEY is not configured");
    }
    console.log("Sending email with the following details:", msg);
    await sgMail.send(msg);
  } catch (error) {
    console.error("sending email error", error);
    throw new Error("Could not send email");
  }
};

const sendPasswordResetEmail = async (email, resetLink) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_VERIFIED_SENDER || "falconinnovcm@gmail.com",
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #4CAF50;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to reset your password.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #4CAF50; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Reset Password</a>
        </div>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p>Best,</p>
        <p>The MoniHealth Team</p>
      </div>
    `,
  };

  try {
    if (!sendGridApiKey) {
      throw new Error("SENDGRID_API_KEY is not configured");
    }
    await sgMail.send(msg);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email");
  }
};

export { sendEmail, sendPasswordResetEmail };
