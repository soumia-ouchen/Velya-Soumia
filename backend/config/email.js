import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const sendEmail = (to, subject, html) => {
  console.log("EMAIL_USER:", process.env.EMAIL_USER);

    return transporter.sendMail({

      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    }).then(() => {
      console.log('Email sent successfully');
    }).catch((error) => {
      console.error('Error sending email:', error);
    });
  };
  
export default transporter;