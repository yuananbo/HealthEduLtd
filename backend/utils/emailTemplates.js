export const signUpTemplate = ({ verifyLink }) => {
  return `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #4CAF50;">Welcome to MoniHealth!</h2>
          <p>Hello,</p>
          <p>Thank you for signing up for MoniHealth. Please click the button below to verify your email address.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href=${verifyLink} style="background-color: #4CAF50; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Verify Email</a>
          </div>
          <p>If you did not sign up for MoniHealth, you can safely ignore this email.</p>
          <p>Best,</p>
          <p>The MoniHealth Team</p>
        </div>
        `;
};

export const appointmentConfirmationTemplate = ({ appointment }) => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${appointment.subject}</title>
          <style>
            body, h1, h2, h3, h4, h5, h6, p, ul, li {
              margin: 0;
              padding: 0;
            }
            body {
              font-family: Arial, sans-serif;
              background-color: #f5f5f5;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              font-size: 24px;
              color: #4CAF50;
            }
            .content p {
              margin-bottom: 10px;
            }
            .content ul {
              list-style-type: none;
              margin-bottom: 20px;
            }
            .content ul li {
              margin-bottom: 5px;
            }
            .button {
              text-align: center;
              margin: 20px 0;
            }
            .button a {
              background-color: #4CAF50;
              color: #fff;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #888;
            }
            @media (max-width: 480px) {
              .container {
                padding: 10px;
              }
              .header h1 {
                font-size: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Confirmation</h1>      if (therapist.active === false) {
        throw new Error(
          "This therapist haven't verified their email yet. Account can't be approved"
        );
      }
            </div>
            <div class="content">
              <p>Hello ${appointment.name},</p>
              <p>Your appointment with ${appointment.therapistName} has been sent with the following details:</p>
              <ul>
                <li><strong>Date:</strong> ${appointment.date}</li>
                <li><strong>Time:</strong> ${appointment.time}</li>
                <li><strong>Therapist:</strong> ${appointment.therapistName}</li>
                <li><strong>Status:</strong> ${appointment.status}</li>
              </ul>
             <div class="button">
                 <a href="${appointment.link}">View Appointment</a>
               </div>
               <p>Please this is just to confirm that your application have been sent to tthe therapist for confirmation and approval.</p>
               </div>
            
            <div class="footer">
              <p>&copy; MOBIREHAB Team</p>
            </div>
          </div>
        </body>
        </html> `;
};

export const appointmentConfrimationTherapistTemplate = ({ template_data }) => {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${template_data.subject}</title>
          <style>
            body, h1, h2, h3, h4, h5, h6, p, ul, li {
              margin: 0;
              padding: 0;
            }
            body {
              font-family: Arial, sans-serif;
              background-color: #f5f5f5;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              font-size: 24px;
              color: #4CAF50;
            }
            .content p {
              margin-bottom: 10px;
            }
            .content ul {
              list-style-type: none;
              margin-bottom: 20px;
            }
            .content ul li {
              margin-bottom: 5px;
            }
            .button {
              text-align: center;
              margin: 20px 0;
            }
            .button a {
              background-color: #4CAF50;
              color: #fff;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #888;
            }
            @media (max-width: 480px) {
              .container {
                padding: 10px;
              }
              .header h1 {
                font-size: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Appointment Notification</h1>
            </div>
            <div class="content">
              <p>Hello ${template_data.name},</p>
              <p>You have a new appointment scheduled with ${template_data.patientName}:</p>
              <ul>
                <li><strong>Date:</strong> ${template_data.date}</li>
                <li><strong>Time:</strong> ${template_data.time}</li>
                <li><strong>Patient:</strong> ${template_data.patientName}</li>
                <li><strong>Service:</strong> ${template_data.service}</li>
                <li><strong>Purpose:</strong> ${template_data.purpose}</li>
              </ul>
              <div class="button">
                <a href=${template_data.link}>Approve Appointment</a>
              </div>
            </div>
            <div class="footer">
              <p>&copy; MOBIREHAB Team</p>
            </div>
          </div>
        </body>
        </html>
      `;
};

export const therapistAccountStatusChangeTemplate = ({ template_data }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template_data.subject}</title>
      <style>
        body, h1, h2, h3, p {
            margin: 0;
            padding: 0;
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #4CAF50;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .button {
            display: inline-block;
            background-color: #4CAF50;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            background-color: #f0f0f0;
            padding: 20px;
            text-align: center;
            font-size: 0.8em;
            color: #666;
        }
    </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${
                  template_data.isVerified === true
                    ? "Account Verified!"
                    : "Account Update"
                }</h1>
            </div>
            <div class="content">
                <h2>Hello ${template_data.name},</h2>
                ${
                  template_data.isVerified === true
                    ? `
                    <p>Congratulations! Your Mobirehab therapist account has been successfully verified.</p>
                    <p>You can now start accepting appointments from patients and provide your valuable services through our platform.</p>
                    <p>Here's what you can do next:</p>
                    <ul>
                        <li>Complete your profile with any additional information</li>
                        <li>Set your availability for appointments</li>
                        <li>Familiarize yourself with the platform's features</li>
                    </ul>
                    <a href="${template_data?.link}" class="button">Go to Dashboard</a>
                `
                    : `
                    <p>We regret to inform you that your Mobirehab therapist account has been deactivated or not verified at this time.</p>
                    <p>This decision was made after careful review of the information provided. We understand this may be disappointing, but we want to ensure the highest standards for our platform and patients.</p>
                    <p>For more information about the specific reasons for this decision or to discuss how you can improve your application, please contact our admin team.</p>
                    <a href="mailto:admin@mobirehab.com" class="button">Contact Admin</a>
                `
                }
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Mobirehab. All rights reserved.</p>
                <p>If you have any questions, please contact our support team at support@mobirehab.com</p>
            </div>
        </div>
    </body>
    </html> `;
};

export const appointmentStatusUpdate = ({ template_data }) => {
  return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${template_data.subject}</title>
            <style>
              body, h1, h2, h3, h4, h5, h6, p, ul, li {
                margin: 0;
                padding: 0;
              }
              body {
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .header h1 {
                font-size: 24px;
                color: #4CAF50;
              }
              .content p {
                margin-bottom: 10px;
              }
              .content ul {
                list-style-type: none;
                margin-bottom: 20px;
              }
              .content ul li {
                margin-bottom: 5px;
              }
              .button {
                text-align: center;
                margin: 20px 0;
              }
              .button a {
                background-color: #4CAF50;
                color: #fff;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #888;
              }
              @media (max-width: 480px) {
                .container {
                  padding: 10px;
                }
                .header h1 {
                  font-size: 20px;
                }
              }
            </style>
          </head>
                  <body>
      <div class="container">
        <div class="header">
          <h1>Appointment ${template_data.status}</h1>
        </div>
        <div class="content">
          <p>Hello ${template_data.name},</p>
          <p>${template_data.message}</p>
          <p>Your appointment with ${template_data.therapistName} has been updated:</p>
          <ul>
            <li><strong>Date:</strong> ${template_data.date}</li>
            <li><strong>Time:</strong> ${template_data.time}</li>
            <li><strong>Therapist:</strong> ${template_data.therapistName}</li>
            <li><strong>Status:</strong> ${template_data.status}</li>
          </ul>
          <div class="button">
            <a href="${template_data.link}">View Appointment</a>
          </div>
          
            <p>${template_data.message}</p>

        </div>
        <div class="footer">
          <p>&copy; MOBIREHAB Team</p>
        </div>
      </div>
    </body>
          </html>
        `;
};
