import transporter from "../config/email.js";

export const sendEmail = async ({ name, email, message }) => {
  console.log("Données du formulaire de contact:", { name, email, message });
  console.log("Nom:", name);
  return await transporter.sendMail({

    from: email,
    to: process.env.EMAIL_USER,
    subject: "Message Velya",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h1 style="color: #4a4a4a; text-align: center;">Nouveau message de contact</h1>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="margin: 5px 0;"><strong style="color: #333; width: 80px; display: inline-block;">Nom:</strong> ${name}</p>
        <p style="margin: 5px 0;"><strong style="color: #333; width: 80px; display: inline-block;">Email:</strong> ${email}</p>
      </div>
      
      <div style="background-color: #f1f8ff; padding: 15px; border-radius: 5px;">
        <h3 style="color: #4a4a4a; margin-top: 0;">Message:</h3>
        <p style="white-space: pre-wrap; margin: 0;">${message}</p>
      </div>
      
      <p style="text-align: center; margin-top: 30px; color: #888; font-size: 12px;">
        Ce message a été envoyé via le formulaire de contact de Velya.
      </p>
    </div>
    `,
  });
};